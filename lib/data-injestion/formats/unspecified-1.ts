import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount, parseDate } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const Unspecified1Schema = z.object({
    "Post Date": z.string(),
    Amount: z.string(),
    "Check Number": z.string(),
    Payee: z.string(),
});

function map(elements: z.infer<typeof Unspecified1Schema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const element of elements) {
        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDate(element["Post Date"]),
            valueDate: parseDate(element["Post Date"]),
            participantName: element["Payee"],
            participantIban: "",
            participantBic: "",
            transactionType: element["Check Number"] ? "Check" : "Transfer",
            purpose: `Check Number: ${element["Check Number"]}`,
            amount: parseAmount(element["Amount"]),
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
    return "Unspecified Bank 1";
}

export const Unspecified1: DataInjestFormat<typeof Unspecified1Schema> = {
    name: "unspecified-1",
    displayName: "Unspecified Format 1",
    schema: Unspecified1Schema,
    map,
    getBankName,
    note: "This format does not provide account balance information. We calculate a running balance starting from 0 before the first transaction. At a later point, there will be an option to set the starting balance manually. Currency is assumed to be USD.",
};
