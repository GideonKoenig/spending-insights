import { AccountsContextType } from "@/contexts/accounts/provider";
import { NotificationContextType } from "@/contexts/notification/provider";
import { DataInjester } from "@/lib/data-injestion/main";
import { PreparedFile } from "@/lib/data-injestion/types";
import { Dispatch, SetStateAction } from "react";

export interface LoadDataDependencies {
    files: PreparedFile[];
    setFiles: Dispatch<SetStateAction<PreparedFile[]>>;
    notificationContext: NotificationContextType;
    accountsContext: AccountsContextType;
    closeDialog: () => void;
}

export function createIsValid(dependencies: LoadDataDependencies) {
    return () => {
        if (dependencies.files.length === 0) return false;

        return dependencies.files.every((file) => {
            if (!file.name || file.name.trim() === "") return false;
            if (file.action === "merge" && !file.mergeAccount) return false;
            return true;
        });
    };
}

export function createHandleFileSelect(dependencies: LoadDataDependencies) {
    return async (files: FileList | null) => {
        if (!files) return;

        const csvFiles = Array.from(files).filter(
            (file) =>
                file.type === "text/csv" ||
                file.name.toLowerCase().endsWith(".csv")
        );

        const newFiles: PreparedFile[] = await Promise.all(
            csvFiles.map(async (file) => {
                const result = await DataInjester.getFormat(file);
                const error = result.success ? null : result.error;
                const format = result.success ? result.value.value : null;
                return {
                    file,
                    name: file.name.replace(/\.csv$/i, ""),
                    fileName: file.name,
                    error,
                    format,
                    action: "add" as const,
                    targetAccount: undefined,
                };
            })
        );

        dependencies.setFiles((prev) => {
            const result = [...prev];
            for (const file of newFiles) {
                const index = result.findIndex(
                    (f) => f.fileName === file.fileName
                );
                if (index === -1) {
                    result.push(file);
                } else {
                    result[index] = file;
                }
            }
            return result;
        });
    };
}

export function createUpdateFile(dependencies: LoadDataDependencies) {
    return (fileName: string, newFile: PreparedFile) => {
        dependencies.setFiles((prev) =>
            prev.map((f) => (f.fileName === fileName ? newFile : f))
        );
    };
}

export function createRemoveFile(dependencies: LoadDataDependencies) {
    return (fileName: string) => {
        dependencies.setFiles((prev) =>
            prev.filter((f) => f.fileName !== fileName)
        );
    };
}

export function createLoadData(dependencies: LoadDataDependencies) {
    return async () => {
        if (!createIsValid(dependencies)()) return;
        const results = await DataInjester.injest(dependencies.files);
        for (let index = 0; index < results.length; index++) {
            const result = results[index];
            if (!result.success) {
                dependencies.notificationContext.addError(
                    "Load Data",
                    result.error
                );
                continue;
            }
            const preparedFile = dependencies.files[index];
            if (preparedFile.action === "merge") {
                if (!preparedFile.mergeAccount) {
                    dependencies.notificationContext.addError(
                        "Load Data",
                        `Merge was not specified for account ${preparedFile.name}`
                    );
                    continue;
                }
                const account = result.value;
                dependencies.accountsContext.mergeAccounts(
                    preparedFile.mergeAccount,
                    account
                );
            }
            if (preparedFile.action === "add") {
                dependencies.accountsContext.addAccount(result.value);
            }
        }
        dependencies.setFiles([]);
        dependencies.closeDialog();
    };
}
