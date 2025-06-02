import { z } from "zod";

export type Transaction = z.infer<typeof TransactionSchema>;
export const TransactionSchema = z.object({
    accountName: z.string(),
    accountIban: z.string(),
    accountBic: z.string(),
    bankName: z.string(),
    bookingDate: z.string().transform(parseDate),
    valueDate: z.string().transform(parseDate),
    paymentParticipant: z.string(),
    paymentParticipantIban: z.string(),
    paymentParticipantBic: z.string(),
    transactionType: z.string(),
    purpose: z.string(),
    amount: z.string().transform(parseAmount),
    currency: z.string(),
    balanceAfterTransaction: z.string().transform(parseAmount),
    note: z.string(),
    markedTransaction: z.string(),
    creditorId: z.string(),
    mandateReference: z.string(),
});

export type Dataset = z.infer<typeof DatasetSchema>;
export const DatasetSchema = z.object({
    name: z.string(),
    transactions: z.array(TransactionSchema),
});

function parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();

    const parts = dateStr.split(".");
    if (parts.length !== 3) return new Date();

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-based
    const year = parseInt(parts[2], 10);

    return new Date(year, month, day);
}

function parseAmount(amountStr: string): number {
    if (!amountStr) return 0;

    const cleanAmount = amountStr.replace(/\s/g, "").replace(",", ".");
    return parseFloat(cleanAmount) || 0;
}
