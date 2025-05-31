import { type Transaction } from "@/lib/types";

export type ValueType = "string" | "number" | "date";

export type FilterOperator<T> = {
    name: string;
    type: ValueType;
    compare: (userValue: T, valueToCompare: T) => boolean;
};

export type FilterRule = {
    attribute: keyof Transaction;
    operator: string;
    value: string | number | Date;
};

export type TypedOperator =
    | FilterOperator<string>
    | FilterOperator<number>
    | FilterOperator<Date>;
