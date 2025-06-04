import { TransactionSchema, type Transaction } from "@/lib/types";
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
export const FilterRuleSchema = z
    .object({
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
        ]),
        operator: z.string(),
        value: z.union([z.string(), z.number(), z.date()]),
    })
    .transform((data) => {
        if (data.operator.includes("date")) {
            const date = new Date(data.value);
            return {
                ...data,
                value: date,
            };
        }
        return data;
    });

export type FilterOption = {
    attribute: keyof Omit<Transaction, "tag">;
    label: string;
    inputType: InputType;
};
