import { CustomError, type Result, newError, newSuccess } from "@/lib/utils";
import { VrBankFormat } from "@/lib/data-injestion/sources/vr-bank";
import { DataInjestFormat } from "@/lib/data-injestion/types";
import { CsvParser } from "@/lib/csv-parser/parser";
import { hashTransaction, findFormat } from "@/lib/data-injestion/utils";
import { Account } from "@/lib/types";

const MAPPING_REGISTRY: DataInjestFormat<any>[] = [VrBankFormat];

async function injest(files: FileList, accountNames: string[]) {
    const errors: CustomError[] = [];
    const accounts: Account[] = [];

    if (accountNames.length !== files.length)
        return newError(
            "Internal Error: An inadequte number of account names was provided."
        );

    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const text = await file.text();
        const headers = CsvParser.getHeaders(text);
        if (!headers.success) {
            errors.push(headers);
            continue;
        }
        const format = findFormat(headers.value, MAPPING_REGISTRY);
        if (!format) {
            errors.push(
                newError(
                    "The format of this file is not yet supported. Reach out to the developer to add support for this file."
                )
            );
            continue;
        }

        const data = CsvParser.parse(text, format.schema);
        if (!data.success) {
            errors.push(data);
            continue;
        }
        const transactions = data.value.map(format.map);
        const accountName = accountNames[index];
        const hashedTransactions = hashTransaction(transactions, accountName);

        accounts.push({
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
            name: accountName,
            transactions: hashedTransactions,
        });
    }

    return newSuccess(accounts);
}

export const DataInjester = {
    injest,
};
