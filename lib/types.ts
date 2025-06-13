import { TagSchema } from "@/lib/tag-rule-engine/types";
import { z } from "zod";

export type Transaction = z.infer<typeof TransactionSchema>;
export const TransactionSchema = z.object({
    hash: z.string(),
    accountName: z.string(),
    accountIban: z.string(),
    accountBic: z.string(),
    bankName: z.string(),
    bookingDate: z.date(),
    valueDate: z.date(),
    paymentParticipant: z.string(),
    paymentParticipantIban: z.string(),
    paymentParticipantBic: z.string(),
    transactionType: z.string(),
    purpose: z.string(),
    amount: z.number(),
    currency: z.string(),
    balanceAfterTransaction: z.number(),
    category: z.string().optional(),
    tag: TagSchema.optional(),
});

export type Account = z.infer<typeof AccountSchema>;
export const AccountSchema = z.object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    name: z.string(),
    transactions: z.array(TransactionSchema),
});
