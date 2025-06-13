import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SuperJSON } from "superjson";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatEuro(amount: number) {
    const isNegative = amount < 0;
    const absoluteAmount = Math.abs(amount);

    const formatter = new Intl.NumberFormat("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const formatted = formatter.format(absoluteAmount);
    return `${isNegative ? "-" : "+"}${formatted} EUR`;
}

export type CustomError = { success: false; error: string };
export type CustomSuccess<T> = { success: true; value: T; warnings?: string[] };
export type Result<T> = CustomSuccess<T> | CustomError;

export function tryCatch<T>(fn: () => T): Result<T> {
    try {
        const value = fn();
        return { success: true, value };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

export async function tryCatchAsync<T>(
    fn: () => Promise<T>
): Promise<Result<T>> {
    try {
        const value = await fn();
        return { success: true, value };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

export function newError(error: string) {
    return { success: false, error } as CustomError;
}

export function newSuccess<T>(value: T, warnings?: string[]) {
    return {
        success: true,
        value,
        ...(warnings && { warnings }),
    } as CustomSuccess<T>;
}

export function storeLocal<T>(key: string, value: T) {
    if (typeof window === "undefined")
        return newError("You tryed to store a local value on the server");
    return tryCatch(() => {
        localStorage.setItem(key, SuperJSON.stringify(value));
    });
}

export function getLocal<T>(key: string): Result<T> {
    if (typeof window === "undefined")
        return newError("You tryed to get a local value on the server");
    const stored = tryCatch(() => localStorage.getItem(key));
    if (!stored.success) return stored;
    if (stored.value === null)
        return newError("No value found for key: " + key);

    const result = tryCatch(() => SuperJSON.parse<T>(stored.value!));
    if (!result.success) return result;
    return newSuccess(result.value);
}
