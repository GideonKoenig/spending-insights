import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

export function newError<T>(error: string): CustomError {
    return { success: false, error };
}

export function newSuccess<T>(value: T, warnings?: string[]): CustomSuccess<T> {
    return { success: true, value, ...(warnings && { warnings }) };
}
