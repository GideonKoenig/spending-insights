import type { FilterOperator } from "@/lib/transaction-filter/types";

export const listEquals: FilterOperator<string> = {
    name: "list-equals",
    label: "=",
    type: "list",
    compare: (userValue, valueToCompare) => {
        if (!userValue || !valueToCompare) return false;
        return valueToCompare.toLowerCase() === userValue.toLowerCase();
    },
};
