"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { csvParser } from "@/lib/csv-parser";
import { fileHandleStore } from "@/lib/file-handle-store";
import { type Result, tryCatchAsync, newError } from "@/lib/utils";
import { TransactionSchema, type Transaction } from "@/lib/types";

const FILE_HANDLE_KEY = "transactions";

declare global {
    interface Window {
        showOpenFilePicker(options?: {
            types?: Array<{
                description?: string;
                accept?: Record<string, string[]>;
            }>;
            multiple?: boolean;
        }): Promise<FileSystemFileHandle[]>;
    }
}

interface DataContextType {
    transactions: Transaction[];
    loading: boolean;
    error: string | null;
    setError: (error: string | null) => void;
    selectFile: () => Promise<void>;
    clearFile: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData(): Result<DataContextType> {
    const context = useContext(DataContext);
    if (!context) {
        return newError("useData must be used within a DataProvider");
    }
    return { success: true, value: context };
}

async function loadTransactions(
    handle: FileSystemFileHandle
): Promise<Result<Transaction[]>> {
    const fileResult = await tryCatchAsync(async () => await handle.getFile());
    if (!fileResult.success) return fileResult;

    const contentResult = await tryCatchAsync(
        async () => await fileResult.value.text()
    );
    if (!contentResult.success) return contentResult;

    return csvParser.parse(contentResult.value, TransactionSchema);
}

export function DataProvider(props: { children: ReactNode }) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function selectFile() {
        setLoading(true);
        setError(null);

        const pickerResult = await tryCatchAsync(async () => {
            const [handle] = await window.showOpenFilePicker({
                types: [
                    {
                        description: "CSV files",
                        accept: { "text/csv": [".csv"] },
                    },
                ],
            });
            return handle;
        });

        if (!pickerResult.success) {
            if (!pickerResult.error.includes("AbortError")) {
                setError(pickerResult.error);
            }
            setLoading(false);
            return;
        }

        const saveResult = await fileHandleStore.save(
            FILE_HANDLE_KEY,
            pickerResult.value
        );
        if (!saveResult.success) {
            setError(saveResult.error);
            setLoading(false);
            return;
        }

        const parseResult = await loadTransactions(pickerResult.value);
        if (!parseResult.success) {
            setError(parseResult.error);
        } else {
            setTransactions(parseResult.value);
        }

        setLoading(false);
    }

    async function clearFile() {
        const result = await fileHandleStore.delete(FILE_HANDLE_KEY);
        if (!result.success) {
            setError(result.error);
            return;
        }

        setTransactions([]);
        setError(null);
    }

    const value: DataContextType = {
        transactions,
        loading,
        error: error,
        setError,
        selectFile,
        clearFile,
    };

    return (
        <DataContext.Provider value={value}>
            {props.children}
        </DataContext.Provider>
    );
}
