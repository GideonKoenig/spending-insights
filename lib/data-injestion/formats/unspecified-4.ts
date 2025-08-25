import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount, parseDate } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const Unspecified4Schema = z.object({
    Datum: z.string(),
    Name: z.string(),
    Text: z.string(),
    "Betrag (EUR)": z.string(),
    "Saldo (EUR)": z.string(),
});

function map(elements: z.infer<typeof Unspecified4Schema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const element of elements) {
        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDate(element["Datum"]),
            valueDate: parseDate(element["Datum"]),
            participantName: element["Name"],
            participantIban: "",
            participantBic: "",
            transactionType: "Transfer",
            purpose: element["Text"],
            amount: parseAmount(element["Betrag (EUR)"]),
            currency: "EUR",
            balanceAfterTransaction: parseAmount(element["Saldo (EUR)"]),
        };

        result.push(transaction);
    }

    return result;
}

function getBankName() {
    return "Unspecified Bank 4";
}

export const Unspecified4: DataInjestFormat<typeof Unspecified4Schema> = {
    name: "unspecified-4",
    displayName: "Unspecified Format 4",
    schema: Unspecified4Schema,
    map,
    getBankName,
};
