import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount, parseDate } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const StandardFormat1Schema = z.object({
    Buchungstag: z.string(),
    Valuta: z.string(),
    "Auftraggeber/Zahlungsempfänger": z.string(),
    "Empfänger/Zahlungspflichtiger": z.string(),
    "Konto-Nr.": z.string(),
    IBAN: z.string(),
    BLZ: z.string(),
    BIC: z.string(),
    "Vorgang/Verwendungszweck": z.string(),
    Kundenreferenz: z.string(),
    Währung: z.string(),
    Umsatz: z.string(),
    "Soll/Haben": z.string(),
    Vorgang: z.string(),
});

function map(elements: z.infer<typeof StandardFormat1Schema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const element of elements) {
        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDate(element["Buchungstag"]),
            valueDate: parseDate(element["Valuta"]),
            participantName: element["Auftraggeber/Zahlungsempfänger"],
            participantIban: element["IBAN"],
            participantBic: element["BIC"],
            transactionType: element["Vorgang"],
            purpose: element["Vorgang/Verwendungszweck"],
            amount: parseAmount(element["Umsatz"]),
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
    return "Standard Format 1";
}

export const StandardFormat1: DataInjestFormat<typeof StandardFormat1Schema> = {
    name: "standard-format-1",
    displayName: "Standard Format",
    schema: StandardFormat1Schema,
    map,
    getBankName,
    note: "This format does not provide account balance information. We calculate a running balance starting from 0 before the first transaction. At a later point, there will be an option to set the starting balance manually.",
};
