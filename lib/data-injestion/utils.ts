import { DataInjestFormat } from "@/lib/data-injestion/types";
import { Transaction } from "@/lib/types";
import { newError, newSuccess } from "@/lib/utils";
import { createHash } from "crypto";
import { z } from "zod";

// Todo: this probably doesnt work for all formats... this needs to be more generalized.
export function parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();

    const parts = dateStr.split(".");
    if (parts.length !== 3) return new Date();

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-based
    const year = parseInt(parts[2], 10);

    return new Date(year, month, day);
}

export function parseAmount(amountStr: string): number {
    if (!amountStr) return 0;

    // 1) Detect a minus sign (could be leading or trailing)
    const isNegative = /-/.test(amountStr);

    // 2) Remove every non-digit. What remains represents the value in cents.
    const onlyDigits = amountStr.replace(/\D/g, "");
    if (!onlyDigits) return 0;

    // 3) Interpret the last two digits as the cent portion.
    const cents = parseInt(onlyDigits, 10);
    const value = cents / 100;

    return isNegative ? -value : value;
}

export function findFormat(
    headers: string[],
    formats: DataInjestFormat<z.ZodObject<z.ZodRawShape>>[]
) {
    const format = formats.find((format) => {
        const formatHeaders = Object.keys(format.schema.shape);
        const hasAllKeys = headers.every((header) =>
            formatHeaders.includes(header)
        );
        const hasSameLength = formatHeaders.length === headers.length;
        return hasAllKeys && hasSameLength;
    });
    if (!format)
        return newError(
            "The format of this file is not yet supported. If the selected file contains transactions, reach out to the developer to add support for this format."
        );
    return newSuccess(format);
}

export function hashTransaction(
    transactions: Omit<Transaction, "hash">[],
    accountName: string
) {
    return transactions.map((transaction) => ({
        ...transaction,
        hash: createHash("sha256")
            .update(
                JSON.stringify({
                    accountName,
                    bookingDate: transaction.bookingDate,
                    amount: transaction.amount,
                    participantName: transaction.participantName,
                    purpose: transaction.purpose,
                    transactionType: transaction.transactionType,
                })
            )
            .digest("hex")
            .substring(0, 16),
    }));
}

export function calculateIban(konto: string, blz: string): string {
    if (!konto || !blz) return "";

    const mod97 = (numStr: string): number => {
        let rem = 0;
        for (let i = 0; i < numStr.length; i++) {
            const digit = numStr.charCodeAt(i) - 48; // '0' => 48
            rem = (rem * 10 + digit) % 97;
        }
        return rem;
    };

    const bban = blz.padStart(8, "0") + konto.padStart(10, "0");
    const testNumber = bban + "131400"; // BBAN + "DE00" verschoben
    const remainder = mod97(testNumber);
    const check = String(98 - remainder).padStart(2, "0");

    return `DE${check}${bban}`;
}
