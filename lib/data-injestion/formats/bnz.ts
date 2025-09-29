import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

// Anonymized header + sample rows (pattern-preserving)
// Date,Amount,Payee,Particulars,Code,Reference,Tran Type,This Party Account,Other Party Account,Serial,Transaction Code,Batch Number,Originating Bank/Branch,Processed Date
// 00/00/0000,-0.00,,,,,AAA,00-0000-0000000-00,---,,00,0000,00-0000,00/00/0000,Aaaaa
// 00/00/0000,00,AAA Aaaaaaaaa Aaaa A,,,AAAAAAAA AAA,AA,00-0000-0000000-00,00-0000-0000000-00,,00,0000,00-0000,00/00/0000,Aaaaa
// 00/00/0000,-0000.00,AAAAAA  A & A,AAAAAAAAAAAA,AAAA AAAA AA,0.00000A+00,AA,00-0000-0000000-00,00-0000-0000000-00,,00,0000,00-0000,00/00/0000,Aaaaa
// 0/00/0000,-000,Aaaaaaaaa,,,AAAAAAAA AAA,AA,00-0000-0000000-00,00-0000-0000000-00,,00,0000,00-0000,0/00/0000,Aaaaa
// 0/00/0000,-000,Aaaaaaaa,,,AAAAAAAA AAA,AA,00-0000-0000000-00,00-0000-0000000-00,,00,0000,00-0000,0/00/0000,Aaaaa

const BnzSchema = z.object({
    Date: z.string(),
    Amount: z.string(),
    Payee: z.string(),
    Particulars: z.string(),
    Code: z.string(),
    Reference: z.string(),
    "Tran Type": z.string(),
    "This Party Account": z.string(),
    "Other Party Account": z.string(),
    Serial: z.string(),
    "Transaction Code": z.string(),
    "Batch Number": z.string(),
    "Originating Bank/Branch": z.string(),
    "Processed Date": z.string(),
});

function parseDateSlashDayFirst(dateStr: string): Date {
    if (!dateStr) return new Date();
    const parts = dateStr.split("/");
    if (parts.length !== 3) return new Date();
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
}

function map(elements: z.infer<typeof BnzSchema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const e of elements) {
        const amount = parseAmount(e["Amount"]);
        const participantName = e["Payee"];
        const purposeParts = [
            e["Particulars"],
            e["Code"],
            e["Reference"],
            e["Transaction Code"],
            e["Batch Number"],
            e["Originating Bank/Branch"],
        ].filter(Boolean);
        const purpose = purposeParts.join(" | ");

        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDateSlashDayFirst(e["Date"]),
            valueDate: parseDateSlashDayFirst(e["Processed Date"]),
            participantName,
            participantIban: e["Other Party Account"],
            participantBic: "",
            transactionType: e["Tran Type"],
            purpose,
            amount,
            currency: "NZD",
            balanceAfterTransaction: 0,
        };

        result.push(transaction);
    }

    result.sort((a, b) => a.bookingDate.getTime() - b.bookingDate.getTime());
    let running = 0;
    for (const tx of result) {
        running += tx.amount;
        tx.balanceAfterTransaction = running;
    }

    return result;
}

function getBankName() {
    return "Bank of New Zealand";
}

export const Bnz: DataInjestFormat<typeof BnzSchema> = {
    name: "bnz",
    displayName: "Bank of New Zealand",
    schema: BnzSchema,
    map,
    getBankName,
    note: "Bank of New Zealand does not provide account balance information. We calculate a running balance starting from 0 before the first transaction. At a later point, there will be an option to set the starting balance manually.",
};
