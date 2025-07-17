import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount, parseDate } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const Unspecified2Schema = z.object({
    "Txn Date": z.string(),
    "Value\rDate": z.string(),
    Description: z.string(),
    "Ref No./Cheque\rNo.": z.string(),
    Debit: z.string(),
    Credit: z.string(),
    Balance: z.string(),
});

function map(elements: z.infer<typeof Unspecified2Schema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const element of elements) {
        const debitAmount = element["Debit"]
            ? parseAmount(element["Debit"])
            : 0;
        const creditAmount = element["Credit"]
            ? parseAmount(element["Credit"])
            : 0;
        const amount = creditAmount - debitAmount;

        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDate(element["Txn Date"]),
            valueDate: parseDate(element["Value\rDate"]),
            participantName: "",
            participantIban: "",
            participantBic: "",
            transactionType: element["Ref No./Cheque\rNo."]
                ? "Check"
                : "Transfer",
            purpose: element["Ref No./Cheque\rNo."]
                ? `${element["Description"]} - Ref: ${element["Ref No./Cheque\rNo."]}`
                : element["Description"],
            amount: amount,
            currency: "USD",
            balanceAfterTransaction: parseAmount(element["Balance"]),
        };

        result.push(transaction);
    }

    result.sort((a, b) => a.bookingDate.getTime() - b.bookingDate.getTime());

    return result;
}

function getBankName() {
    return "Unspecified Bank 2";
}

export const Unspecified2: DataInjestFormat<typeof Unspecified2Schema> = {
    name: "unspecified-2",
    displayName: "Unspecified Format 2",
    schema: Unspecified2Schema,
    map,
    getBankName,
    note: "Currency is assumed to be USD.",
};
