import { TagSchema } from "@/lib/tag-rule-engine/types";
import { EnrichmentSchema } from "@/lib/transaction-enrichment/types";
import { z } from "zod";

export type Transaction = z.infer<typeof TransactionSchema>;
export const TransactionSchema = z.object({
    hash: z.string(),
    bookingDate: z.date(),
    valueDate: z.date(),
    participantName: z.string(),
    transactionType: z.string(),
    purpose: z.string(),
    amount: z.number(),
    currency: z.string(),
    balanceAfterTransaction: z.number(),
    participantIban: z.string().optional(),
    participantBic: z.string().optional(),
    // Category is added as extra field, because the filter operator needs to be able to access it directly
    category: z.string().optional(),
    tag: TagSchema.optional(),
    enrichment: EnrichmentSchema.optional(),
});

export type Account = z.infer<typeof AccountSchema>;
export const AccountSchema = z.object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    name: z.string(),
    bankName: z.string(),
    startingBalance: z.number(),
    transactions: z.array(TransactionSchema),
});
