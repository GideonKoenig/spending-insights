import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount, parseDate } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const CommerzbankSchema = z.object({
    Buchungstag: z.string(),
    Wertstellung: z.string(),
    Umsatzart: z.string(),
    Buchungstext: z.string(),
    Betrag: z.string(),
    Währung: z.string(),
    Auftraggeberkonto: z.string(),
    "Bankleitzahl Auftraggeberkonto": z.string(),
    "IBAN Auftraggeberkonto": z.string(),
    Kategorie: z.string(),
});

function map(elements: z.infer<typeof CommerzbankSchema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const element of elements) {
        const amount = parseAmount(element["Betrag"]);
        const isPositive = amount > 0;

        const iban = isPositive ? element["IBAN Auftraggeberkonto"] : "";
        const participantName = isPositive ? element["Auftraggeberkonto"] : "";

        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDate(element["Buchungstag"]),
            valueDate: parseDate(element["Wertstellung"]),
            participantName: participantName,
            participantIban: iban,
            participantBic: "",
            transactionType: element["Umsatzart"],
            purpose: element["Buchungstext"],
            amount: amount,
            currency: element["Währung"],
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
    return "Commerzbank";
}

export const Commerzbank: DataInjestFormat<typeof CommerzbankSchema> = {
    name: "commerzbank",
    displayName: "Commerzbank",
    schema: CommerzbankSchema,
    map,
    getBankName,
    note: "Commerzbank does not provide account balance information. We calculate a running balance starting from 0 before the first transaction. At a later point, there will be an option to set the starting balance manually.",
};
