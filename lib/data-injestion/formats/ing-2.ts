import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const IngSchema2 = z.object({
    Date: z.string(),
    Description: z.string(),
    Credit: z.string().optional(),
    Debit: z.string().optional(),
    Balance: z.string(),
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

function map(elements: z.infer<typeof IngSchema2>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const element of elements) {
        const hasCredit =
            typeof element.Credit === "string" && element.Credit.trim() !== "";
        const hasDebit =
            typeof element.Debit === "string" && element.Debit.trim() !== "";
        if (hasCredit === hasDebit) {
            continue;
        }

        const credit = hasCredit ? parseAmount(element.Credit!) : 0;
        const debit = hasDebit ? parseAmount(element.Debit!) : 0;
        const amount = credit - debit;

        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDateSlash(element.Date),
            valueDate: parseDateSlash(element.Date),
            participantName: "",
            participantIban: "",
            participantBic: "",
            transactionType: amount >= 0 ? "credit" : "debit",
            purpose: element.Description,
            amount,
            currency: "EUR",
            balanceAfterTransaction: parseAmount(element.Balance),
        };

        result.push(transaction);
    }

    return result;
}

function getBankName() {
    return "ING";
}

export const Ing2: DataInjestFormat<typeof IngSchema2> = {
    name: "ing-2",
    displayName: "ING",
    schema: IngSchema2,
    map,
    getBankName,
};
