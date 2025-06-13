import { CustomError, type Result, newError, newSuccess } from "@/lib/utils";
import { VrBankFormat } from "@/lib/data-injestion/sources/vr-bank";
import { DataInjestFormat, PreparedFile } from "@/lib/data-injestion/types";
import { CsvParser } from "@/lib/csv-parser/parser";
import { hashTransaction, findFormat } from "@/lib/data-injestion/utils";
import { Account } from "@/lib/types";

const MAPPING_REGISTRY: DataInjestFormat<any>[] = [VrBankFormat];

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
        const transactions = data.value.map(format.value.map);
        const accountName = file.name;
        const hashedTransactions = hashTransaction(transactions, accountName);

        results.push(
            newSuccess({
                id: crypto.randomUUID(),
                createdAt: new Date(),
                updatedAt: new Date(),
                name: accountName,
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
