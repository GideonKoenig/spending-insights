import type { ValueType } from "@/lib/transaction-filter/types";

export function isDate(value: unknown): value is Date {
    return value instanceof Date;
}

export function isNumber(value: unknown): value is number {
    return typeof value === "number" && !isNaN(value);
}

export function isString(value: unknown): value is string {
    return typeof value === "string";
}

export function getValueType(value: unknown): ValueType | null {
    if (isDate(value)) return "date";
    if (isNumber(value)) return "number";
    if (isString(value)) return "string";
    return null;
}
