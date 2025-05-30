import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type Result<T> =
    | { success: true; value: T }
    | { success: false; error: string };

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

export function newError<T>(error: string): Result<T> {
    return { success: false, error };
}
