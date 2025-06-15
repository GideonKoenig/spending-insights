import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount, parseDate } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const StandardFormat2Schema = z.object({
    Buchungstag: z.string(),
    Wert: z.string(),
    Umsatzart: z.string(),
    "Begünstigter / Auftraggeber": z.string(),
    Verwendungszweck: z.string(),
    IBAN: z.string(),
    BIC: z.string(),
    Kundenreferenz: z.string(),
    "Mandatsreferenz ": z.string(),
    "Gläubiger ID": z.string(),
    "Fremde Gebühren": z.string(),
    Betrag: z.string(),
    "Abweichender Empfänger": z.string(),
    "Anzahl der Aufträge": z.string(),
    "Anzahl der Schecks": z.string(),
    Soll: z.string(),
    Haben: z.string(),
    Währung: z.string(),
    "Umsatz in EUR": z.string(),
});

function map(elements: z.infer<typeof StandardFormat2Schema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const element of elements) {
        const isNegative =
            element["Soll"] &&
            element["Soll"].replace(/\D/g, "").trim() !== "" &&
            element["Soll"].replace(/\D/g, "") !== "0";
        const amount = isNegative
            ? -parseAmount(element["Umsatz in EUR"])
            : parseAmount(element["Umsatz in EUR"]);

        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDate(element["Buchungstag"]),
            valueDate: parseDate(element["Wert"]),
            participantName: element["Begünstigter / Auftraggeber"],
            participantIban: element["IBAN"],
            participantBic: element["BIC"],
            transactionType: element["Umsatzart"],
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
    return "Standard Format 2";
}

export const StandardFormat2: DataInjestFormat<typeof StandardFormat2Schema> = {
    name: "standard-format-2",
    displayName: "Standard Format",
    schema: StandardFormat2Schema,
    map,
    getBankName,
    note: "This format does not provide account balance information. We calculate a running balance starting from 0 before the first transaction.",
};
