import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const CapitalOneSchema = z.object({
    "Account Number": z.string(),
    "Transaction Description": z.string(),
    "Transaction Date": z.string(),
    "Transaction Type": z.string(),
    "Transaction Amount": z.string(),
    Balance: z.string(),
});

function parseDateSlashYY(dateStr: string): Date {
    if (!dateStr) return new Date();
    const parts = dateStr.split("/");
    if (parts.length !== 3) return new Date();
    const month = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);
    const twoDigitYear = parseInt(parts[2], 10);
    const year = twoDigitYear + (twoDigitYear >= 70 ? 1900 : 2000);
    return new Date(year, month, day);
}

function map(elements: z.infer<typeof CapitalOneSchema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const element of elements) {
        const rawAmount = parseAmount(element["Transaction Amount"]);

        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDateSlashYY(element["Transaction Date"]),
            valueDate: parseDateSlashYY(element["Transaction Date"]),
            participantName: "",
            participantIban: element["Account Number"],
            participantBic: "",
            transactionType: element["Transaction Type"],
            purpose: element["Transaction Description"],
            amount: rawAmount,
            currency: "USD",
            balanceAfterTransaction: parseAmount(element["Balance"]),
        };

        result.push(transaction);
    }

    return result;
}

function getBankName() {
    return "Capital One";
}

export const CapitalOne: DataInjestFormat<typeof CapitalOneSchema> = {
    name: "capital-one",
    displayName: "Capital One",
    schema: CapitalOneSchema,
    map,
    getBankName,
};
