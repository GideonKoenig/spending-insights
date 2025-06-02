import { type Transaction } from "@/lib/types";

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

export type FilterRule = {
    attribute: keyof Transaction;
    operator: string;
    value: string | number | Date;
};

export type FilterOption = {
    attribute: keyof Transaction;
    label: string;
    inputType: InputType;
};
