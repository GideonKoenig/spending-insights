import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

// Anonymized sample header + rows (pattern-preserving)
// Account Number,Post Date,Check,Description,Debit,Credit,Status,Balance
// AAA0000,0/00/0000,,AA *AAA AAAAA AAAA A,0.00,,Aaaaaaa,-00.00

const Unspecified6Schema = z.object({
    "Account Number": z.string(),
    "Post Date": z.string(),
    Check: z.string(),
    Description: z.string(),
    Debit: z.string(),
    Credit: z.string(),
    Status: z.string(),
    Balance: z.string(),
});

function parseDateSlash(dateStr: string): Date {
    if (!dateStr) return new Date();
    const parts = dateStr.split("/");
    if (parts.length !== 3) return new Date();
    const month = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
}

function map(elements: z.infer<typeof Unspecified6Schema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const e of elements) {
        const debit = e["Debit"] ? parseAmount(e["Debit"]) : 0;
        const credit = e["Credit"] ? parseAmount(e["Credit"]) : 0;
        const amount = credit - debit;

        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDateSlash(e["Post Date"]),
            valueDate: parseDateSlash(e["Post Date"]),
            participantName: "",
            participantIban: e["Account Number"],
            participantBic: "",
            transactionType: e["Check"]
                ? "Check"
                : amount >= 0
                ? "Credit"
                : "Debit",
            purpose: e["Check"]
                ? `${e["Description"]} | Check: ${e["Check"]}`
                : e["Description"],
            amount,
            currency: "USD",
            balanceAfterTransaction: parseAmount(e["Balance"]),
        };

        result.push(transaction);
    }

    return result;
}

function getBankName() {
    return "Unspecified Bank 6";
}

export const Unspecified6: DataInjestFormat<typeof Unspecified6Schema> = {
    name: "unspecified-6",
    displayName: "Unspecified Format 6",
    schema: Unspecified6Schema,
    map,
    getBankName,
    note: "CSV includes account balance after each transaction, which is preserved. Currency assumed USD. Dates parsed as mm/dd/yyyy.",
};
