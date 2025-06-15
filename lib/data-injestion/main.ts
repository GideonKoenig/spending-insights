import { type Result, newSuccess } from "@/lib/utils";
import { StandardFormat3 } from "@/lib/data-injestion/formats/standard-format-3";
import { DataInjestFormat, PreparedFile } from "@/lib/data-injestion/types";
import { CsvParser } from "@/lib/csv-parser/parser";
import { hashTransaction, findFormat } from "@/lib/data-injestion/utils";
import { Account } from "@/lib/types";
import z from "zod";
import { Comdirect } from "@/lib/data-injestion/formats/comdirect";
import { Dkb } from "@/lib/data-injestion/formats/dkb";
import { StandardFormat1 } from "@/lib/data-injestion/formats/standard-format-1";
import { StandardFormat2 } from "@/lib/data-injestion/formats/standard-format-2";

const MAPPING_REGISTRY = [
    Comdirect,
    Dkb,
    StandardFormat1,
    StandardFormat2,
    StandardFormat3,
] as unknown as DataInjestFormat<z.ZodObject<z.ZodRawShape>>[];

async function injest(files: PreparedFile[]) {
    const results: Result<Account>[] = [];

    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const text = await file.file.text();
        const headers = CsvParser.getHeaders(text);
        if (!headers.success) {
            results.push(headers);
            continue;
        }
        const format = findFormat(headers.value, MAPPING_REGISTRY);
        if (!format.success) {
            results.push(format);
            continue;
        }

        const data = CsvParser.parse(text, format.value.schema);
        if (!data.success) {
            results.push(data);
            continue;
        }
        const transactions = format.value.map(data.value);
        const accountName = file.name;
        const hashedTransactions = hashTransaction(transactions, accountName);
        const bankName = format.value.getBankName(data.value);

        results.push(
            newSuccess({
                id: crypto.randomUUID(),
                createdAt: new Date(),
                updatedAt: new Date(),
                name: accountName,
                bankName,
                startingBalance: 0,
                transactions: hashedTransactions,
            })
        );
    }

    return results;
}

async function getFormat(file: File) {
    const text = await file.text();
    const headers = CsvParser.getHeaders(text);
    if (!headers.success) return headers;
    const format = findFormat(headers.value, MAPPING_REGISTRY);
    if (!format.success) return format;
    return format;
}

export const DataInjester = {
    injest,
    getFormat,
};
