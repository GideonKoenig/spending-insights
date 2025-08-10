import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const WespacSchema = z.object({
    Date: z.string(),
    Narrative: z.string(),
    "Debit Amount": z.string(),
    "Credit Amount": z.string(),
    Balance: z.string(),
    Categories: z.string(),
    Serial: z.string(),
});

function parseDateSlash(dateStr: string): Date {
    if (!dateStr) return new Date();
    const parts = dateStr.split("/");
    if (parts.length !== 3) return new Date();
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
}

function map(elements: z.infer<typeof WespacSchema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const element of elements) {
        const credit = parseAmount(element["Credit Amount"]);
        const debit = parseAmount(element["Debit Amount"]);
        const amount = credit - debit;

        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDateSlash(element["Date"]),
            valueDate: parseDateSlash(element["Date"]),
            participantName: "",
            participantIban: "",
            participantBic: "",
            transactionType: amount >= 0 ? "credit" : "debit",
            purpose: `${element["Narrative"]}${
                element["Categories"] ? ` (${element["Categories"]})` : ""
            }`,
            amount,
            currency: "AUD",
            balanceAfterTransaction: parseAmount(element["Balance"]),
        };

        result.push(transaction);
    }

    return result;
}

function getBankName() {
    return "Wespac";
}

export const Wespac: DataInjestFormat<typeof WespacSchema> = {
    name: "wespac",
    displayName: "Wespac",
    schema: WespacSchema,
    map,
    getBankName,
    note: "Wespac CSV export format includes information about the category of a transaction, which is currently not utilized. Future update will include the ability to preserve those hints.",
};
