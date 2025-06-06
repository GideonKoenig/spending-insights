import { DataInjestFormat } from "@/lib/data-injestion/types";
import { Transaction } from "@/lib/types";
import { createHash } from "crypto";

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

    const cleanAmount = amountStr.replace(/\s/g, "").replace(",", ".");
    return parseFloat(cleanAmount) || 0;
}

export function findFormat(
    headers: string[],
    formats: DataInjestFormat<any>[]
) {
    return formats.find((format) => {
        const formatHeaders = Object.keys(format.schema.shape);
        const hasAllKeys = headers.every((header) =>
            formatHeaders.includes(header)
        );
        const hasSameLength = formatHeaders.length === headers.length;
        return hasAllKeys && hasSameLength;
    });
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
                    accountIban: transaction.accountIban,
                    bookingDate: transaction.bookingDate,
                    amount: transaction.amount,
                    paymentParticipant: transaction.paymentParticipant,
                    purpose: transaction.purpose,
                    transactionType: transaction.transactionType,
                    accountName,
                })
            )
            .digest("hex")
            .substring(0, 16),
    }));
}
