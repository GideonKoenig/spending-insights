import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount, parseDate } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const IngSchema = z.object({
    Buchung: z.string(),
    Valuta: z.string(),
    "Auftraggeber/Empfänger": z.string(),
    Buchungstext: z.string(),
    Verwendungszweck: z.string(),
    Saldo: z.string(),
    Währung: z.string(),
    Betrag: z.string(),
    "Währung.1": z.string(),
});

function map(elements: z.infer<typeof IngSchema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const element of elements) {
        const amount = parseAmount(element["Betrag"]);

        const transaction: Omit<Transaction, "hash"> = {
            bookingDate: parseDate(element["Buchung"]),
            valueDate: parseDate(element["Valuta"]),
            participantName: element["Auftraggeber/Empfänger"],
            participantIban: "",
            participantBic: "",
            transactionType: element["Buchungstext"],
            purpose: element["Verwendungszweck"],
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
    return "ING";
}

export const Ing: DataInjestFormat<typeof IngSchema> = {
    name: "ing",
    displayName: "ING",
    schema: IngSchema,
    map,
    getBankName,
    note: "ING does not provide account balance information. We calculate a running balance starting from 0 before the first transaction. At a later point, there will be an option to set the starting balance manually.",
};
