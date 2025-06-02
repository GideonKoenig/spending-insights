"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import { csvParser } from "@/lib/csv-parser/parser";
import { fileHandleStore } from "@/lib/file-handle-store";
import { type Result, tryCatchAsync, newError } from "@/lib/utils";
import { TransactionSchema, type Dataset } from "@/lib/types";

const ALL_DATASET_NAMES_KEY = "bank-history_all_dataset_names";
const ACTIVE_DATASET_KEY = "bank-history_active_dataset";

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
    datasets: Dataset[];
    activeDataset: string | true | null;
    loading: boolean;
    error: string | null;
    setError: (error: string | null) => void;
    setActiveDataset: (dataset: string | true | null) => void;
    needsFileHandle: boolean;
    needsPermission: boolean;
    requestPermissions: () => Promise<void>;
    selectFiles: () => Promise<void>;
    clearFiles: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData(): Result<DataContextType> {
    const context = useContext(DataContext);
    if (!context) {
        return newError("useData must be used within a DataProvider");
    }
    return { success: true, value: context };
}

async function loadDataset(
    handle: FileSystemFileHandle
): Promise<Result<Dataset>> {
    const fileResult = await tryCatchAsync(async () => await handle.getFile());
    if (!fileResult.success) return fileResult;

    const contentResult = await tryCatchAsync(
        async () => await fileResult.value.text()
    );
    if (!contentResult.success) return contentResult;

    const parseResult = await csvParser.parse(
        contentResult.value,
        TransactionSchema
    );
    if (!parseResult.success) return parseResult;

    return {
        success: true,
        value: {
            name: handle.name.replace(".csv", ""),
            transactions: parseResult.value,
        },
    };
}

export function DataProvider(props: { children: ReactNode }) {
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fileHandles, setFileHandles] = useState<FileSystemFileHandle[]>([]);
    const [hasPermission, setHasPermission] = useState<boolean[]>([]);
    const [activeDataset, setActiveDataset] = useState<string | true | null>(
        null
    );

    const needsFileHandle = fileHandles.length === 0;
    const needsPermission = hasPermission.some(
        (permission, index) => fileHandles[index] && !permission
    );

    async function setNewFileHandles(handles: FileSystemFileHandle[]) {
        setFileHandles(handles);

        const permissions = await Promise.all(
            handles.map((handle) => fileHandleStore.hasAccess(handle))
        );

        const permissionStates = permissions.map((result) => {
            if (!result.success)
                setError((prev) => `${prev ?? ""}\n${result.error}`);
            return result.success ? result.value : false;
        });
        setHasPermission(permissionStates);

        if (!permissionStates.every((permission) => permission)) return;

        const datasetResults = await Promise.all(
            handles.map((handle) => loadDataset(handle))
        );
        const datasets = datasetResults
            .map((result) => {
                if (!result.success) {
                    setError((prev) => `${prev ?? ""}\n${result.error}`);
                    return null;
                }
                return result.value;
            })
            .filter((dataset) => dataset !== null);
        setDatasets(datasets);
    }

    useEffect(() => {
        async function initializeDatasets() {
            setLoading(true);

            const activeDataset = localStorage.getItem(ACTIVE_DATASET_KEY);
            if (activeDataset) {
                setActiveDataset(JSON.parse(activeDataset));
            }

            const datasetNamesJson = localStorage.getItem(
                ALL_DATASET_NAMES_KEY
            );
            if (!datasetNamesJson) {
                setLoading(false);
                return;
            }

            const datasetNames: string[] = JSON.parse(datasetNamesJson);
            const handles = (
                await Promise.all(
                    datasetNames.map(async (name) =>
                        fileHandleStore.load(`dataset_${name}`)
                    )
                )
            )
                .filter((result) => result.success)
                .map((result) => result.value);

            await setNewFileHandles(handles);
            setLoading(false);
        }

        initializeDatasets();
    }, []);

    async function requestPermissions() {
        if (fileHandles.length === 0) return;

        setLoading(true);
        setError(null);

        const permissionPromises = fileHandles
            .map((handle, index) => ({
                handle,
                hasPermission: !hasPermission[index],
                index,
            }))
            .filter(({ hasPermission }) => !hasPermission)
            .map(async ({ handle, index }) => ({
                result: await fileHandleStore.requestAccess(handle),
                index,
            }));

        const permissionResults = (
            await Promise.all(permissionPromises)
        ).filter((item) => {
            const { result, index } = item;
            if (!result.success) {
                setError((prev) => `${prev ?? ""}\n${result.error}`);
            }
            return result.success;
        });

        const newPermissions = hasPermission.map((value, index) => {
            return (
                permissionResults.find(
                    ({ index: resultIndex }) => resultIndex === index
                )?.result.success ?? value
            );
        });
        setHasPermission(newPermissions);
        if (!newPermissions.every((permission) => permission)) return;

        const datasetResults = await Promise.all(
            fileHandles.map((handle) => loadDataset(handle))
        );
        const datasets = datasetResults
            .map((result) => {
                if (!result.success) {
                    setError((prev) => `${prev ?? ""}\n${result.error}`);
                    return null;
                }
                return result.value;
            })
            .filter((dataset) => dataset !== null);
        setDatasets(datasets);
        setLoading(false);
    }

    async function selectFiles() {
        setLoading(true);
        setError(null);

        const pickerResult = await tryCatchAsync(async () => {
            return await window.showOpenFilePicker({
                types: [
                    {
                        description: "CSV files",
                        accept: { "text/csv": [".csv"] },
                    },
                ],
                multiple: true,
            });
        });

        if (!pickerResult.success) {
            if (!pickerResult.error.includes("The user aborted a request")) {
                setError(pickerResult.error);
            }
            setLoading(false);
            return;
        }

        const handles = pickerResult.value;
        const saveResults = (
            await Promise.all(
                handles.map((handle) =>
                    fileHandleStore.save(
                        `dataset_${handle.name.replace(".csv", "")}`,
                        handle
                    )
                )
            )
        ).map((result) => {
            if (!result.success) {
                setError((prev) => `${prev ?? ""}\n${result.error}`);
            }
            return result.success;
        });
        if (!saveResults.every((result) => result)) {
            setLoading(false);
            return;
        }

        const datasetNames = handles.map((h) => h.name.replace(".csv", ""));
        localStorage.setItem(
            ALL_DATASET_NAMES_KEY,
            JSON.stringify(datasetNames)
        );

        await setNewFileHandles(handles);
        setLoading(false);
    }

    async function clearFiles() {
        const datasetNamesJson = localStorage.getItem(ALL_DATASET_NAMES_KEY);
        if (!datasetNamesJson) return;

        const datasetNames: string[] = JSON.parse(datasetNamesJson);
        datasetNames.forEach(async (name) => {
            await fileHandleStore.remove(`dataset_${name}`);
        });

        localStorage.removeItem(ALL_DATASET_NAMES_KEY);
        setFileHandles([]);
        setHasPermission([]);
        setDatasets([]);
        setError(null);
    }

    function handleSetActiveDataset(dataset: string | true | null) {
        setActiveDataset(dataset);
        localStorage.setItem(ACTIVE_DATASET_KEY, JSON.stringify(dataset));
    }

    const value: DataContextType = {
        datasets,
        activeDataset,
        loading,
        error,
        setError,
        setActiveDataset: handleSetActiveDataset,
        needsFileHandle,
        needsPermission,
        requestPermissions,
        selectFiles,
        clearFiles,
    };

    return (
        <DataContext.Provider value={value}>
            {props.children}
        </DataContext.Provider>
    );
}
