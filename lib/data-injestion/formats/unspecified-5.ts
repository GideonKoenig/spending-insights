import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount } from "@/lib/data-injestion/utils";
import { convert, formatRateString } from "@/lib/exchange";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const Unspecified5Schema = z.object({
    "Account Type": z.string(),
    "Account Number": z.string(),
    "Transaction Date": z.string(),
    "Cheque Number": z.string(),
    "Description 1": z.string(),
    "Description 2": z.string(),
    CAD$: z.string(),
    USD$: z.string(),
});

function parseDateSlash(dateStr: string): Date {
    if (!dateStr) return new Date();
    const parts = dateStr.split("/");
    if (parts.length !== 3) return new Date();
    const month = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
}

function map(elements: z.infer<typeof Unspecified5Schema>[]) {
    const mapped: Omit<Transaction, "hash">[] = [];

    for (const element of elements) {
        const hasCad = element["CAD$"] && element["CAD$"].trim() !== "";
        const cadAmount = hasCad ? parseAmount(element["CAD$"]) : 0;
        const usdAmount =
            !hasCad && element["USD$"] ? parseAmount(element["USD$"]) : 0;
        const normalizedUsd = hasCad
            ? convert(cadAmount, "CAD", "USD")
            : usdAmount;

        const purposeParts: string[] = [];
        if (element["Description 1"])
            purposeParts.push(element["Description 1"]);
        if (element["Description 2"])
            purposeParts.push(element["Description 2"]);
        if (element["Cheque Number"])
            purposeParts.push(`Cheque: ${element["Cheque Number"]}`);

        mapped.push({
            bookingDate: parseDateSlash(element["Transaction Date"]),
            valueDate: parseDateSlash(element["Transaction Date"]),
            participantName: "",
            participantIban: element["Account Number"],
            participantBic: "",
            transactionType: normalizedUsd >= 0 ? "credit" : "debit",
            purpose: purposeParts.join(" | "),
            amount: normalizedUsd,
            currency: "USD",
            balanceAfterTransaction: 0,
        });
    }

    // Sort by date and compute running balance in USD
    const sorted = mapped.sort(
        (a, b) => a.bookingDate.getTime() - b.bookingDate.getTime()
    );
    let running = 0;
    for (const tx of sorted) {
        running = Math.round((running + tx.amount) * 100) / 100;
        tx.balanceAfterTransaction = running;
    }

    return sorted;
}

function getBankName() {
    return "Unspecified Bank 5";
}

export const Unspecified5: DataInjestFormat<typeof Unspecified5Schema> = {
    name: "unspecified-5",
    displayName: "Unspecified Format 5",
    schema: Unspecified5Schema,
    map,
    getBankName,
    note: `Mixed CAD$/USD$ amounts are normalized to USD using a static CAD→USD rate (${formatRateString(
        "CAD",
        "USD"
    )}). This static rate is updated periodically, not live. Running balance is computed in USD.`,
};
