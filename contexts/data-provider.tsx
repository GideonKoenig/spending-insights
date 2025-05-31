"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
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
    needsFileHandle: boolean;
    needsPermission: boolean;
    requestPermission: () => Promise<void>;
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(
        null
    );
    const [hasPermission, setHasPermission] = useState(false);

    const needsFileHandle = !fileHandle;
    const needsPermission = Boolean(fileHandle && !hasPermission);

    async function setNewFileHandle(handle: FileSystemFileHandle) {
        setFileHandle(handle);

        const accessResult = await fileHandleStore.hasAccess(handle);
        if (!accessResult.success) {
            setError(accessResult.error);
            return;
        }

        setHasPermission(accessResult.value);
        if (accessResult.value) {
            const parseResult = await loadTransactions(handle);
            if (!parseResult.success) {
                setError(parseResult.error);
            } else {
                setTransactions(parseResult.value);
            }
        }
    }

    useEffect(() => {
        async function initializeFileHandle() {
            setLoading(true);
            const handleResult = await fileHandleStore.load(FILE_HANDLE_KEY);
            if (handleResult.success) {
                await setNewFileHandle(handleResult.value);
            } else if (handleResult.error !== "File handle not found") {
                setError(handleResult.error);
            }
            setLoading(false);
        }

        initializeFileHandle();
    }, []);

    async function requestPermission() {
        if (!fileHandle) return;

        setLoading(true);
        setError(null);

        const accessResult = await fileHandleStore.requestAccess(fileHandle);
        if (!accessResult.success) {
            setError(accessResult.error);
            setLoading(false);
            return;
        }

        setHasPermission(accessResult.value);
        if (accessResult.value) {
            const parseResult = await loadTransactions(fileHandle);
            if (!parseResult.success) {
                setError(parseResult.error);
            } else {
                setTransactions(parseResult.value);
            }
        }
        setLoading(false);
    }

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
            if (!pickerResult.error.includes("The user aborted a request")) {
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

        await setNewFileHandle(pickerResult.value);
        setLoading(false);
    }

    async function clearFile() {
        const result = await fileHandleStore.remove(FILE_HANDLE_KEY);
        if (!result.success) {
            setError(result.error);
            return;
        }

        setFileHandle(null);
        setHasPermission(false);
        setTransactions([]);
        setError(null);
    }

    const value: DataContextType = {
        transactions,
        loading,
        error,
        setError,
        needsFileHandle,
        needsPermission,
        requestPermission,
        selectFile,
        clearFile,
    };

    return (
        <DataContext.Provider value={value}>
            {props.children}
        </DataContext.Provider>
    );
}
