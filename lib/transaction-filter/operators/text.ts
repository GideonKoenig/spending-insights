import type { FilterOperator } from "@/lib/transaction-filter/types";

export const textEquals: FilterOperator<string> = {
    name: "text-equals",
    label: "=",
    type: "text",
    compare: (userValue, valueToCompare) => {
        if (typeof userValue.toLowerCase !== "function")
            console.log(
                "ISSUE1:\n",
                "userValue",
                userValue,
                "\n",
                "valueToCompare",
                valueToCompare
            );
        return valueToCompare.toLowerCase() === userValue.toLowerCase();
    },
};

export const textIncludes: FilterOperator<string> = {
    name: "text-includes",
    label: "includes",
    type: "text",
    compare: (userValue, valueToCompare) => {
        if (typeof userValue.toLowerCase !== "function")
            console.log(
                "ISSUE2:\n",
                "userValue",
                userValue,
                "\n",
                "valueToCompare",
                valueToCompare
            );
        return valueToCompare.toLowerCase().includes(userValue.toLowerCase());
    },
};

export const textExcludes: FilterOperator<string> = {
    name: "text-excludes",
    label: "excludes",
    type: "text",
    compare: (userValue, valueToCompare) => {
        if (typeof userValue.toLowerCase !== "function")
            console.log(
                "ISSUE3:\n",
                "userValue",
                userValue,
                "\n",
                "valueToCompare",
                valueToCompare
            );
        return !valueToCompare.toLowerCase().includes(userValue.toLowerCase());
    },
};
