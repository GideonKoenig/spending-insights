"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import { fileHandleStore } from "@/lib/file-handle-store";
import { tryCatchAsync } from "@/lib/utils";
import { type Dataset } from "@/lib/types";
import { useNotifications } from "@/contexts/notification/provider";
import superjson from "superjson";
import {
    createHandles,
    loadDatasetsFromHandles,
    type Handle,
} from "@/contexts/data/utils";

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
    activeDataset: string | true;
    loading: boolean;
    setActiveDataset: (dataset: string | true) => void;
    needsFileHandle: boolean;
    needsPermission: boolean;
    requestPermissions: () => Promise<void>;
    selectFiles: () => Promise<void>;
    clearFiles: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
}

export function DataProvider(props: { children: ReactNode }) {
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [activeDataset, setActiveDataset] = useState<string | true>(true);
    const [loading, setLoading] = useState(true);
    const [fileHandles, setFileHandles] = useState<Handle[]>([]);
    const { addError } = useNotifications();

    const needsFileHandle = fileHandles.length === 0;
    const needsPermission = fileHandles.some((info) => !info.hasPermission);

    async function setNewFileHandles(handles: FileSystemFileHandle[]) {
        const { newHandles, errors: createErrors } = await createHandles(
            handles
        );

        createErrors.forEach((error) => {
            addError("DataProvider - setNewFileHandles", error);
        });

        setFileHandles(newHandles);

        if (!newHandles.every((handle) => handle.hasPermission)) return;

        const { datasets, errors: loadErrors } = await loadDatasetsFromHandles(
            newHandles
        );

        loadErrors.forEach((error) => {
            addError("DataProvider - setNewFileHandles", error);
        });

        setDatasets(datasets);
    }

    useEffect(() => {
        async function initializeDatasets() {
            setLoading(true);

            const activeDataset = localStorage.getItem(ACTIVE_DATASET_KEY);
            if (activeDataset) {
                setActiveDataset(superjson.parse<string | true>(activeDataset));
            }

            const datasetNamesJson = localStorage.getItem(
                ALL_DATASET_NAMES_KEY
            );
            if (!datasetNamesJson) {
                setLoading(false);
                return;
            }

            const datasetNames = superjson.parse<string[]>(datasetNamesJson);
            const handles: FileSystemFileHandle[] = [];

            for (const name of datasetNames) {
                const result = await fileHandleStore.load(`dataset_${name}`);
                if (result.success) {
                    handles.push(result.value);
                } else {
                    addError(
                        "DataProvider - initializeDatasets",
                        `Failed to load dataset ${name}: ${result.error}`
                    );
                }
            }

            await setNewFileHandles(handles);
            setLoading(false);
        }

        initializeDatasets();
    }, []);

    async function requestPermissions() {
        if (fileHandles.length === 0) return;
        setLoading(true);

        const updatedHandles = [...fileHandles];

        for (let i = 0; i < updatedHandles.length; i++) {
            const handle = updatedHandles[i];
            if (!handle.hasPermission) {
                const result = await fileHandleStore.requestAccess(
                    handle.handle
                );
                if (!result.success) {
                    addError(
                        "DataProvider - requestPermissions",
                        `Failed to request permission for ${handle.handle.name}: ${result.error}`
                    );
                } else {
                    updatedHandles[i] = {
                        ...handle,
                        hasPermission: result.value,
                    };
                }
            }
        }

        setFileHandles(updatedHandles);
        if (!updatedHandles.every((handle) => handle.hasPermission)) {
            setLoading(false);
            return;
        }

        const { datasets, errors: loadErrors } = await loadDatasetsFromHandles(
            updatedHandles
        );

        loadErrors.forEach((error) => {
            addError("DataProvider - requestPermissions", error);
        });

        setDatasets(datasets);
        setLoading(false);
    }

    async function selectFiles() {
        setLoading(true);

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
                addError(
                    "DataProvider - selectFiles",
                    `File selection failed: ${pickerResult.error}`
                );
            }
            setLoading(false);
            return;
        }

        const handles = pickerResult.value;

        let allSaveSuccessful = true;
        for (const handle of handles) {
            const name = handle.name.replace(".csv", "");
            const result = await fileHandleStore.save(
                `dataset_${name}`,
                handle
            );
            if (!result.success) {
                addError(
                    "DataProvider - selectFiles",
                    `Failed to save ${handle.name}: ${result.error}`
                );
                allSaveSuccessful = false;
            }
        }

        if (!allSaveSuccessful) {
            setLoading(false);
            return;
        }

        const datasetNames = handles.map((handle) =>
            handle.name.replace(".csv", "")
        );
        localStorage.setItem(
            ALL_DATASET_NAMES_KEY,
            superjson.stringify(datasetNames)
        );

        await setNewFileHandles(handles);
        setLoading(false);
    }

    async function clearFiles() {
        const datasetNamesJson = localStorage.getItem(ALL_DATASET_NAMES_KEY);
        if (!datasetNamesJson) return;

        const datasetNames = superjson.parse<string[]>(datasetNamesJson);
        for (const name of datasetNames) {
            await fileHandleStore.remove(`dataset_${name}`);
        }

        localStorage.removeItem(ALL_DATASET_NAMES_KEY);
        setFileHandles([]);
        setDatasets([]);
    }

    function handleSetActiveDataset(dataset: string | true) {
        setActiveDataset(dataset);
        localStorage.setItem(ACTIVE_DATASET_KEY, superjson.stringify(dataset));
    }

    const value: DataContextType = {
        datasets,
        activeDataset,
        loading,
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
