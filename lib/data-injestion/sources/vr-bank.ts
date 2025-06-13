import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount, parseDate } from "@/lib/data-injestion/utils";
import { z } from "zod";

const VrBankSchema = z.object({
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

function map(element: z.infer<typeof VrBankSchema>) {
    return {
        accountName: element["Bezeichnung Auftragskonto"],
        accountIban: element["IBAN Auftragskonto"],
        accountBic: element["BIC Auftragskonto"],
        bankName: element["Bankname Auftragskonto"],
        bookingDate: parseDate(element["Buchungstag"]),
        valueDate: parseDate(element["Valutadatum"]),
        paymentParticipant: element["Name Zahlungsbeteiligter"],
        paymentParticipantIban: element["IBAN Zahlungsbeteiligter"],
        paymentParticipantBic: element["BIC (SWIFT-Code) Zahlungsbeteiligter"],
        transactionType: element["Buchungstext"],
        purpose: element["Verwendungszweck"],
        amount: parseAmount(element["Betrag"]),
        currency: element["Waehrung"],
        balanceAfterTransaction: parseAmount(element["Saldo nach Buchung"]),
    };
}

export const VrBankFormat: DataInjestFormat<typeof VrBankSchema> = {
    name: "vr-bank",
    displayName: "VR-Bank",
    schema: VrBankSchema,
    map,
};
