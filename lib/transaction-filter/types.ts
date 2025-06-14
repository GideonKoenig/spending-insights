import { type Transaction } from "@/lib/types";
import z from "zod";

export type InputType = "text" | "currency" | "date" | "list";

export type FilterOperator<T> = {
    name: string;
    label: string;
    type: InputType;
    compare: (userValue: T, valueToCompare: T) => boolean;
};

export type TypedOperator =
    | FilterOperator<string>
    | FilterOperator<number>
    | FilterOperator<Date>;

export type FilterRule = z.infer<typeof FilterRuleSchema>;
export const FilterRuleSchema = z.object({
    attribute: z.enum([
        "hash",
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
        "category",
    ]),
    operator: z.string(),
    value: z.union([z.string(), z.number(), z.date()]),
});

export type TransactionFilter = {
    attribute: keyof Omit<Transaction, "tag" | "enrichment">;
    label: string;
    inputType: InputType;
};
