"use client";

import { type Result, newError } from "@/lib/utils";

const PROJECT_PREFIX = "bank-history";
const DB_NAME = `${PROJECT_PREFIX}_fileHandleDB`;
const STORE_NAME = `${PROJECT_PREFIX}_fileHandles`;
const DB_VERSION = 1;

interface FileSystemHandlePermissionDescriptor {
    mode?: "read" | "readwrite";
}

declare global {
    interface FileSystemHandle {
        queryPermission(
            descriptor: FileSystemHandlePermissionDescriptor
        ): Promise<PermissionState>;
        requestPermission(
            descriptor: FileSystemHandlePermissionDescriptor
        ): Promise<PermissionState>;
    }
}

const isClient = typeof window !== "undefined" && window.indexedDB;

async function openDatabase(): Promise<Result<IDBDatabase>> {
    if (!isClient) {
        return newError("IndexedDB is not available");
    }

    return new Promise((resolve) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () =>
            resolve(
                newError(request.error?.message ?? "Failed to open database")
            );

        request.onsuccess = () =>
            resolve({
                success: true,
                value: request.result,
            });

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
}

async function hasAccess(
    handle: FileSystemFileHandle
): Promise<Result<boolean>> {
    try {
        const permission = await handle.queryPermission({ mode: "read" });
        return { success: true, value: permission === "granted" };
    } catch (error) {
        return newError(
            error instanceof Error
                ? error.message
                : "Failed to check file permission"
        );
    }
}

async function requestAccess(
    handle: FileSystemFileHandle
): Promise<Result<boolean>> {
    try {
        const permission = await handle.requestPermission({ mode: "read" });
        return { success: true, value: permission === "granted" };
    } catch (error) {
        return newError(
            error instanceof Error
                ? error.message
                : "Failed to request file permission"
        );
    }
}

async function save(
    key: string,
    handle: FileSystemFileHandle
): Promise<Result<void>> {
    if (!isClient) {
        return newError("IndexedDB is not available");
    }

    const dbResult = await openDatabase();
    if (!dbResult.success) return dbResult;

    return new Promise((resolve) => {
        const transaction = dbResult.value.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(handle, key);

        request.onerror = () =>
            resolve(
                newError(request.error?.message ?? "Failed to save file handle")
            );

        request.onsuccess = () => resolve({ success: true, value: undefined });

        transaction.oncomplete = () => dbResult.value.close();
    });
}

async function load(key: string): Promise<Result<FileSystemFileHandle>> {
    if (!isClient) {
        return newError("IndexedDB is not available");
    }

    const dbResult = await openDatabase();
    if (!dbResult.success) return dbResult;

    const handleResult = await new Promise<Result<FileSystemFileHandle | null>>(
        (resolve) => {
            const transaction = dbResult.value.transaction(
                STORE_NAME,
                "readonly"
            );
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(key);

            request.onerror = () =>
                resolve(
                    newError(
                        request.error?.message ?? "Failed to get file handle"
                    )
                );

            request.onsuccess = () => {
                const handle = request.result as FileSystemFileHandle;
                resolve({ success: true, value: handle || null });
            };

            transaction.oncomplete = () => dbResult.value.close();
        }
    );

    if (!handleResult.success) return handleResult;
    if (!handleResult.value) {
        return newError("File handle not found");
    }

    return { success: true, value: handleResult.value };
}

async function remove(key: string): Promise<Result<void>> {
    if (!isClient) {
        return newError("IndexedDB is not available");
    }

    const dbResult = await openDatabase();
    if (!dbResult.success) return dbResult;

    return new Promise((resolve) => {
        const transaction = dbResult.value.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);

        request.onerror = () =>
            resolve(
                newError(
                    request.error?.message ?? "Failed to delete file handle"
                )
            );

        request.onsuccess = () => resolve({ success: true, value: undefined });

        transaction.oncomplete = () => dbResult.value.close();
    });
}

export const fileHandleStore = {
    save,
    load,
    remove,
    hasAccess,
    requestAccess,
} as const;
