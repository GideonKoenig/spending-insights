import { DataInjestFormat } from "@/lib/data-injestion/types";
import {
    parseAmount,
    parseDate,
    calculateIban,
} from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const SparkasseSchema = z.object({
    Auftragskonto: z.string(),
    Buchungstag: z.string(),
    Valutadatum: z.string(),
    Buchungstext: z.string(),
    Verwendungszweck: z.string(),
    "Begünstigter/Zahlungspflichtiger": z.string(),
    Kontonummer: z.string(),
    BLZ: z.string(),
    Betrag: z.string(),
    Währung: z.string(),
    Info: z.string(),
});

function map(elements: z.infer<typeof SparkasseSchema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const element of elements) {
        const amount = parseAmount(element["Betrag"]);
        const iban = calculateIban(element["Kontonummer"], element["BLZ"]);

        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDate(element["Buchungstag"]),
            valueDate: parseDate(element["Valutadatum"]),
            participantName: element["Begünstigter/Zahlungspflichtiger"],
            participantIban: iban,
            participantBic: "",
            transactionType: element["Buchungstext"],
            purpose: element["Verwendungszweck"],
            amount: amount,
            currency: element["Währung"],
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
    return "Sparkasse";
}

export const Sparkasse: DataInjestFormat<typeof SparkasseSchema> = {
    name: "sparkasse",
    displayName: "Sparkasse",
    schema: SparkasseSchema,
    map,
    getBankName,
    note: "Sparkasse format for Giro accounts. The system calculates a running balance starting from 0 before the first transaction.",
};
