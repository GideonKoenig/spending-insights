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
    tags: z.array(z.string()).optional(),
});

export type Dataset = z.infer<typeof DatasetSchema>;
export const DatasetSchema = z.object({
    name: z.string(),
    transactions: z.array(TransactionSchema),
});

export type Tag = z.infer<typeof TagSchema>;
export const TagSchema = z.object({
    category: z.string(),
    subCategory: z.string(),
    spreadOverMonths: z.number().optional(),
});

export type PartialTagMatcher = Partial<TagMatcher>;
export type TagMatcher = z.infer<typeof TagMatcherSchema>;
export const TagMatcherSchema = z.object({
    id: z.string(),
    name: z.string(),
    filters: z.array(
        z.object({
            attribute: z.enum([
                "accountName",
                "accountIban",
                "accountBic",
                "bankName",
                "bookingDate",
                "valueDate",
                "paymentParticipant",
                "paymentParticipantIban",
                "paymentParticipantBic",
                "transactionType",
                "purpose",
                "amount",
                "currency",
                "balanceAfterTransaction",
                "note",
                "markedTransaction",
                "creditorId",
                "mandateReference",
                "tags",
            ]),
            operator: z.string(),
            value: z.union([z.string(), z.number(), z.date()]),
        })
    ),
    tags: TagSchema,
});

export type TagMatcherList = z.infer<typeof TagMatcherListSchema>;
export const TagMatcherListSchema = z.array(TagMatcherSchema);

export const MAIN_CATEGORIES = [
    "Groceries",
    "Transportation",
    "Healthcare",
    "Entertainment",
    "Utilities",
    "Housing",
    "Insurance",
    "Education",
    "Professional",
    "Investments",
    "Income",
    "Other",
] as const;

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
