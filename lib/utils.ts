import { tagTransactions } from "@/lib/transaction-tags/main";
import { TagRule } from "@/lib/transaction-tags/types";
import { Transaction } from "@/lib/types";
import { Dataset } from "@/lib/types";
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

export function getActiveTransactions(
    datasets: Dataset[],
    activeDataset: string | true | null
) {
    if (activeDataset === true)
        return datasets.flatMap((dataset) => dataset.transactions);

    if (activeDataset === null) return [];

    const dataset = datasets.find((d) => d.name === activeDataset);
    if (!dataset) return [];

    return dataset.transactions;
}

export function getActiveDatasets(
    datasets: Dataset[],
    activeDataset: string | true | null
) {
    if (activeDataset === true) return datasets;
    if (activeDataset === null) return [];
    return datasets.filter((d) => d.name === activeDataset);
}

export function preprocessDatasets(
    datasets: Dataset[],
    tagRules: TagRule[],
    addDebug?: (origin: string, message: string) => void
) {
    return datasets.map((dataset) => ({
        ...dataset,
        transactions: preprocessTransactions(
            dataset.transactions,
            tagRules,
            addDebug
        ),
    }));
}

export function preprocessTransactions(
    transactions: Transaction[],
    tagRules: TagRule[],
    addDebug?: (origin: string, message: string) => void
) {
    return tagTransactions(transactions, tagRules, addDebug);
}

export function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

export function generateCategoryColor(category: string): string {
    const hash = hashString(category);
    const hue = hash % 360;
    const saturation = 50 + (hash % 30);
    const lightness = 35;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
