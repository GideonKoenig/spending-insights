import { DataInjestFormat } from "@/lib/data-injestion/types";
import {
    parseAmount,
    parseDate,
    calculateIban,
} from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const ConsorsSchema = z.object({
    Buchung: z.string(),
    Valuta: z.string(),
    "Sender / Empfänger": z.string(),
    "IBAN / Konto-Nr.": z.string(),
    "BIC / BLZ": z.string(),
    Buchungstext: z.string(),
    Verwendungszweck: z.string(),
    Kategorie: z.string(),
    Stichwörter: z.string(),
    "Umsatz geteilt": z.string(),
    "Betrag in EUR": z.string(),
});

function map(elements: z.infer<typeof ConsorsSchema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const element of elements) {
        const amount = parseAmount(element["Betrag in EUR"]);
        const isIban = element["IBAN / Konto-Nr."].startsWith("DE");

        const iban = isIban
            ? element["IBAN / Konto-Nr."]
            : calculateIban(element["IBAN / Konto-Nr."], element["BIC / BLZ"]);
        const bic = isIban ? element["BIC / BLZ"] : "";

        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDate(element["Buchung"]),
            valueDate: parseDate(element["Valuta"]),
            participantName: element["Sender / Empfänger"],
            participantIban: iban,
            participantBic: bic,
            transactionType: element["Buchungstext"],
            purpose: element["Verwendungszweck"],
            amount: amount,
            currency: "EUR",
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
    return "Consors Bank";
}

export const Consors: DataInjestFormat<typeof ConsorsSchema> = {
    name: "consors",
    displayName: "Consors Bank",
    schema: ConsorsSchema,
    map,
    getBankName,
    note: "Consors Bank does not provide account balance information. We calculate a running balance starting from 0 before the first transaction. At a later point, there will be an option to set the starting balance manually.",
};
