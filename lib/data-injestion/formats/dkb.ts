import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount, parseDate } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const DkbSchema = z.object({
    Buchungsdatum: z.string(),
    Wertstellung: z.string(),
    Status: z.string(),
    "Zahlungspflichtige*r": z.string(),
    "Zahlungsempfänger*in": z.string(),
    Verwendungszweck: z.string(),
    Umsatztyp: z.string(),
    IBAN: z.string(),
    "Betrag (€)": z.string(),
    "Gläubiger-ID": z.string(),
    Mandatsreferenz: z.string(),
    Kundenreferenz: z.string(),
    Zahler_Empfaenger_fuer_Kategorisierung: z.string(),
});

function map(elements: z.infer<typeof DkbSchema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    const nameCount = new Map<string, number>();
    let userName = elements[0]["IBAN"];
    for (const element of elements) {
        const iban = element["IBAN"];
        const count = (nameCount.get(iban) ?? 0) + 1;
        nameCount.set(iban, count);
        if (count > nameCount.get(userName)!) {
            userName = iban;
        }
    }

    for (const element of elements) {
        const userIsRecipient = element["Zahlungsempfänger*in"] === userName;
        const participantName = userIsRecipient
            ? element["Zahlungspflichtige*r"]
            : element["Zahlungsempfänger*in"];
        const amount = userIsRecipient
            ? parseAmount(element["Betrag (€)"])
            : -parseAmount(element["Betrag (€)"]);

        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDate(element["Buchungsdatum"]),
            valueDate: parseDate(element["Wertstellung"]),
            participantName: participantName,
            participantIban: element["IBAN"],
            participantBic: "",
            transactionType: element["Umsatztyp"],
            purpose: element["Verwendungszweck"],
            amount: amount,
            currency: "EUR",
            balanceAfterTransaction: 0,
        };

        result.push(transaction);
    }

    result.sort((a, b) => a.valueDate.getTime() - b.valueDate.getTime());

    let runningBalance = 0;
    for (const transaction of result) {
        runningBalance += transaction.amount;
        transaction.balanceAfterTransaction = runningBalance;
    }

    return result;
}

function getBankName() {
    return "DKB";
}

export const Dkb: DataInjestFormat<typeof DkbSchema> = {
    name: "dkb",
    displayName: "DKB",
    schema: DkbSchema,
    map,
    getBankName,
    note: "DKB does not provide account balance information in their export format. We calculate a running balance starting from 0 before the first transaction. At a later point, there will be an option to set the starting balance manually.",
};
