import type { FilterOperator } from "@/lib/transaction-filter/types";

export const textEquals: FilterOperator<string> = {
    name: "text-equals",
    label: "=",
    type: "text",
    compare: (userValue, valueToCompare) => {
        if (!userValue || !valueToCompare) return false;
        return valueToCompare.toLowerCase() === userValue.toLowerCase();
    },
};

export const textIncludes: FilterOperator<string> = {
    name: "text-includes",
    label: "includes",
    type: "text",
    compare: (userValue, valueToCompare) => {
        if (!userValue || !valueToCompare) return false;
        return valueToCompare.toLowerCase().includes(userValue.toLowerCase());
    },
};

export const textExcludes: FilterOperator<string> = {
    name: "text-excludes",
    label: "excludes",
    type: "text",
    compare: (userValue, valueToCompare) => {
        if (!userValue || !valueToCompare) return false;
        return !valueToCompare.toLowerCase().includes(userValue.toLowerCase());
    },
};
