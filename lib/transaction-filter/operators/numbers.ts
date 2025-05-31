import type { FilterOperator } from "@/lib/transaction-filter/types";

export const numberEquals: FilterOperator<number> = {
    name: "number-equals",
    type: "number",
    compare: (userValue, valueToCompare) => valueToCompare === userValue,
};

export const numberGreaterThan: FilterOperator<number> = {
    name: "number-greater-than",
    type: "number",
    compare: (userValue, valueToCompare) => valueToCompare > userValue,
};

export const numberLessThan: FilterOperator<number> = {
    name: "number-less-than",
    type: "number",
    compare: (userValue, valueToCompare) => valueToCompare < userValue,
};
