export type FilterOperator =
    | "equals"
    | "contains"
    | "includes"
    | "greater"
    | "less"
    | "greaterEqual"
    | "lessEqual";

export const operators = {
    equals: (value: any, conditionValue: any): boolean =>
        String(value).toLowerCase() === String(conditionValue).toLowerCase(),

    contains: (value: any, conditionValue: any): boolean =>
        String(value)
            .toLowerCase()
            .includes(String(conditionValue).toLowerCase()),

    includes: (value: any, conditionValue: any): boolean => {
        if (Array.isArray(conditionValue)) {
            return conditionValue.some((val) =>
                String(value).toLowerCase().includes(String(val).toLowerCase())
            );
        }
        return String(value)
            .toLowerCase()
            .includes(String(conditionValue).toLowerCase());
    },

    greater: (value: any, conditionValue: any): boolean => {
        if (typeof value !== "number" || typeof conditionValue !== "number")
            return false;
        return value > conditionValue;
    },

    less: (value: any, conditionValue: any): boolean => {
        if (typeof value !== "number" || typeof conditionValue !== "number")
            return false;
        return value < conditionValue;
    },

    greaterEqual: (value: any, conditionValue: any): boolean => {
        if (typeof value !== "number" || typeof conditionValue !== "number")
            return false;
        return value >= conditionValue;
    },

    lessEqual: (value: any, conditionValue: any): boolean => {
        if (typeof value !== "number" || typeof conditionValue !== "number")
            return false;
        return value <= conditionValue;
    },
} as const;

export type OperatorFunction = (value: any, conditionValue: any) => boolean;
export type Operators = typeof operators;
