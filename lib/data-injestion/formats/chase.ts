// Sample (anonymized) header and row for reference:
// Headers: ["Details","Posting Date","Description","Amount","Type","Balance","Check or Slip #", "<trailing empty>"]
// Row: ["AAAAA","00/00/0000","AAA AAA AAAAA ...","-00.00","AAAA_AAAAA","","",""]

import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const ChaseSchema = z.object({
    Details: z.string(),
    "Posting Date": z.string(),
    Description: z.string(),
    Amount: z.string(),
    Type: z.string(),
    Balance: z.string(),
    "Check or Slip #": z.string(),
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

function map(elements: z.infer<typeof ChaseSchema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const element of elements) {
        const rawAmount = parseAmount(element["Amount"]);

        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDateSlash(element["Posting Date"]),
            valueDate: parseDateSlash(element["Posting Date"]),
            participantName: "",
            participantIban: "",
            participantBic: "",
            transactionType:
                element["Type"] || (rawAmount >= 0 ? "credit" : "debit"),
            purpose: `${element["Description"]}${
                element["Details"] ? ` (${element["Details"]})` : ""
            }`,
            amount: rawAmount,
            currency: "USD",
            balanceAfterTransaction: parseAmount(element["Balance"]),
        };

        result.push(transaction);
    }

    return result;
}

function getBankName() {
    return "Chase";
}

export const Chase: DataInjestFormat<typeof ChaseSchema> = {
    name: "chase",
    displayName: "Chase",
    schema: ChaseSchema,
    map,
    getBankName,
    note: "Chase CSV export format includes an apparent trailing empty column without a header. We ignore trailing empty values and preserve the provided running balance when present. If no balance information is provided, we calculate a running balance starting from 0 before the first transaction. At a later point, there will be an option to set the starting balance manually.",
};
