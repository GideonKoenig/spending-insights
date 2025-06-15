import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount, parseDate } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const ComdirectSchema = z.object({
    Buchungstag: z.string(),
    "Wertstellung (Valuta)": z.string(),
    Vorgang: z.string(),
    Buchungstext: z.string(),
    "Umsatz in EUR": z.string(),
});

function map(elements: z.infer<typeof ComdirectSchema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const element of elements) {
        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDate(element["Buchungstag"]),
            valueDate: parseDate(element["Wertstellung (Valuta)"]),
            participantName: "",
            participantIban: "",
            participantBic: "",
            transactionType: element["Vorgang"],
            purpose: element["Buchungstext"],
            amount: parseAmount(element["Umsatz in EUR"]),
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
    return "Comdirect";
}

export const Comdirect: DataInjestFormat<typeof ComdirectSchema> = {
    name: "comdirect",
    displayName: "Comdirect",
    schema: ComdirectSchema,
    map,
    getBankName,
    note: "Comdirect does not provide account balance information in their export format. We calculate a running balance starting from 0 before the first transaction. At a later point, there will be an option to set the starting balance manually.",
};
