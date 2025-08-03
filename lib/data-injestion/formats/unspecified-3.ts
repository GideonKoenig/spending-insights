import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount, parseDate } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const Unspecified3Schema = z.object({
    "Bank Account": z.string(),
    Date: z.string(),
    Narrative: z.string(),
    "Debit Amount": z.string(),
    "Credit Amount": z.string(),
    Balance: z.string(),
    Categories: z.string(),
    Serial: z.string(),
});

function map(elements: z.infer<typeof Unspecified3Schema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const element of elements) {
        const creditAmount = element["Credit Amount"]
            ? parseAmount(element["Credit Amount"])
            : 0;
        const debitAmount = element["Debit Amount"]
            ? parseAmount(element["Debit Amount"])
            : 0;
        const amount = creditAmount - debitAmount;

        let transactionType = "Debit";
        if (creditAmount > 0) {
            transactionType = "Credit";
        }

        const purposeParts = [];
        if (element.Narrative) {
            purposeParts.push(element.Narrative);
        }
        if (element.Categories) {
            purposeParts.push(`Categories: ${element.Categories}`);
        }
        if (element.Serial) {
            purposeParts.push(`Serial: ${element.Serial}`);
        }

        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDate(element["Date"]),
            valueDate: parseDate(element["Date"]),
            participantName: "",
            participantIban: "",
            participantBic: "",
            transactionType,
            purpose: purposeParts.join(" | "),
            amount: amount,
            currency: "USD",
            balanceAfterTransaction: parseAmount(element["Balance"]),
        };

        result.push(transaction);
    }

    return result;
}

function getBankName() {
    return "Unspecified Bank 3";
}

export const Unspecified3: DataInjestFormat<typeof Unspecified3Schema> = {
    name: "unspecified-3",
    displayName: "Unspecified Format 3",
    schema: Unspecified3Schema,
    map,
    getBankName,
};
