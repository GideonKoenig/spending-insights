import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount, parseDate } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const StandardFormat3Schema = z.object({
    "Bezeichnung Auftragskonto": z.string(),
    "IBAN Auftragskonto": z.string(),
    "BIC Auftragskonto": z.string(),
    "Bankname Auftragskonto": z.string(),
    Buchungstag: z.string(),
    Valutadatum: z.string(),
    "Name Zahlungsbeteiligter": z.string(),
    "IBAN Zahlungsbeteiligter": z.string(),
    "BIC (SWIFT-Code) Zahlungsbeteiligter": z.string(),
    Buchungstext: z.string(),
    Verwendungszweck: z.string(),
    Betrag: z.string(),
    Waehrung: z.string(),
    "Saldo nach Buchung": z.string(),
    Bemerkung: z.string(),
    "Gekennzeichneter Umsatz": z.string(),
    "Glaeubiger ID": z.string(),
    Mandatsreferenz: z.string(),
});

function map(elements: z.infer<typeof StandardFormat3Schema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const element of elements) {
        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDate(element["Buchungstag"]),
            valueDate: parseDate(element["Valutadatum"]),
            participantName: element["Name Zahlungsbeteiligter"],
            participantIban: element["IBAN Zahlungsbeteiligter"],
            participantBic: element["BIC (SWIFT-Code) Zahlungsbeteiligter"],
            transactionType: element["Buchungstext"],
            purpose: element["Verwendungszweck"],
            amount: parseAmount(element["Betrag"]),
            currency: element["Waehrung"],
            balanceAfterTransaction: parseAmount(element["Saldo nach Buchung"]),
        };

        result.push(transaction);
    }

    return result;
}

function getBankName(elements: z.infer<typeof StandardFormat3Schema>[]) {
    return elements[0]["Bankname Auftragskonto"];
}

export const StandardFormat3: DataInjestFormat<typeof StandardFormat3Schema> = {
    name: "standard-format-3",
    displayName: "Standard Format 3",
    schema: StandardFormat3Schema,
    map,
    getBankName,
};
