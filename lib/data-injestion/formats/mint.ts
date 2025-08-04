import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount, parseDate } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const MintSchema = z.object({
    Date: z.string(),
    Description: z.string(),
    "Original Description": z.string(),
    Category: z.string(),
    Amount: z.string(),
    Status: z.string(),
});

function map(elements: z.infer<typeof MintSchema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const element of elements) {
        const amount = parseAmount(element["Amount"]);
        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDate(element["Date"]),
            valueDate: parseDate(element["Date"]),
            participantName: element["Description"],
            participantIban: "",
            participantBic: "",
            transactionType: amount >= 0 ? "credit" : "debit",
            purpose: `${element["Original Description"]} (${element["Status"]})`,
            amount: amount,
            currency: "USD",
            balanceAfterTransaction: 0,
        };

        result.push(transaction);
    }

    result.sort((a, b) => a.bookingDate.getTime() - b.bookingDate.getTime());

    let runningBalance = 0;
    for (const transaction of result) {
        runningBalance += transaction.amount;
        transaction.balanceAfterTransaction = runningBalance;
    }

    return result;
}

function getBankName() {
    return "Mint";
}

export const Mint: DataInjestFormat<typeof MintSchema> = {
    name: "mint",
    displayName: "Mint CSV Export",
    schema: MintSchema,
    map,
    getBankName,
    note: "Mint CSV export format does not provide account balance information. We calculate a running balance starting from 0 before the first transaction. At a later point, there will be an option to set the starting balance manually. Future update will include the ability to preserve and import existing categories from the transaction data.",
};
