import type { FilterOperator } from "@/lib/transaction-filter/types";

export const currencyEquals: FilterOperator<number> = {
    name: "currency-equals",
    label: "=",
    type: "currency",
    compare: (userValue, valueToCompare) => {
        if (userValue == null || valueToCompare == null) return false;
        return valueToCompare === userValue;
    },
};

export const currencyGreaterThan: FilterOperator<number> = {
    name: "currency-greater-than",
    label: ">",
    type: "currency",
    compare: (userValue, valueToCompare) => {
        if (userValue == null || valueToCompare == null) return false;
        return valueToCompare > userValue;
    },
};

export const currencyLessThan: FilterOperator<number> = {
    name: "currency-less-than",
    label: "<",
    type: "currency",
    compare: (userValue, valueToCompare) => {
        if (userValue == null || valueToCompare == null) return false;
        return valueToCompare < userValue;
    },
};
