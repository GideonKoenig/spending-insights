import type { FilterOperator } from "@/lib/transaction-filter/types";

export const stringEquals: FilterOperator<string> = {
    name: "string-equals",
    type: "string",
    compare: (userValue, valueToCompare) =>
        valueToCompare.toLowerCase() === userValue.toLowerCase(),
};

export const stringIncludes: FilterOperator<string> = {
    name: "string-includes",
    type: "string",
    compare: (userValue, valueToCompare) =>
        valueToCompare.toLowerCase().includes(userValue.toLowerCase()),
};
