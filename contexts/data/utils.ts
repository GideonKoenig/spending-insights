import { tryCatchAsync } from "@/lib/utils";
import { csvParser } from "@/lib/csv-parser/parser";
import { TransactionSchema, type Dataset } from "@/lib/types";
import { fileHandleStore } from "@/lib/file-handle-store";

export type Handle = {
    handle: FileSystemFileHandle;
    hasPermission: boolean;
    name: string;
    key: string;
};

export async function loadDataset(handle: FileSystemFileHandle) {
    const fileResult = await tryCatchAsync(async () => await handle.getFile());
    if (!fileResult.success) return fileResult;

    const contentResult = await tryCatchAsync(
        async () => await fileResult.value.text()
    );
    if (!contentResult.success) return contentResult;

    const parseResult = csvParser.parse(contentResult.value, TransactionSchema);
    if (!parseResult.success) return parseResult;

    return {
        success: true as const,
        value: {
            name: handle.name.replace(".csv", ""),
            transactions: parseResult.value,
        },
    };
}

export async function loadDatasetsFromHandles(handles: Handle[]) {
    const datasets: Dataset[] = [];
    const errors: string[] = [];

    for (const info of handles) {
        const result = await loadDataset(info.handle);
        if (!result.success) {
            errors.push(result.error);
        } else {
            datasets.push(result.value);
        }
    }

    return { datasets, errors };
}

export async function createHandles(handles: FileSystemFileHandle[]) {
    const newHandles: Handle[] = [];
    const errors: string[] = [];

    for (const handle of handles) {
        const result = await fileHandleStore.hasAccess(handle);
        if (!result.success) {
            errors.push(result.error);
        }

        const name = handle.name.replace(".csv", "");
        newHandles.push({
            handle,
            hasPermission: result.success ? result.value : false,
            name,
            key: `dataset_${name}`,
        });
    }

    return { newHandles, errors };
}
