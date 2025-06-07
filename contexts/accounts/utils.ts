import { hashTransaction } from "@/lib/data-injestion/utils";
import { type Account, AccountSchema } from "@/lib/types";
import { tryCatch } from "@/lib/utils";
import SuperJSON from "superjson";

export type AccountDependencies = {
    addError: (origin: string, message: string) => void;
    addWarning: (origin: string, message: string) => void;
    saveAccounts: (updater: (accounts: Account[]) => Account[]) => void;
    accounts: Account[];
};

export function createImportAccounts(dependencies: AccountDependencies) {
    return () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.onchange = async (event) => {
            const files = (event.target as HTMLInputElement).files;
            if (files) {
                if (files.length > 1) {
                    dependencies.addError(
                        "Import Accounts",
                        "Only one file can be imported at a time"
                    );
                    return;
                }
                const file = files[0];
                if (!file) {
                    dependencies.addError(
                        "Import Accounts",
                        "No file provided"
                    );
                    return;
                }

                const text = await file.text();
                const accounts = tryCatch(() =>
                    SuperJSON.parse<Account[]>(text)
                );
                if (!accounts.success) {
                    dependencies.addError(
                        "Internal Error - SuperJSON",
                        "Failed to parse accounts. Did you maybe select the wrong file?"
                    );
                    return;
                }
                const parsedAccounts = AccountSchema.array().safeParse(
                    accounts.value
                );
                if (!parsedAccounts.success) {
                    dependencies.addError(
                        "Internal Error - Zod",
                        `Failed to parse accounts. Did you maybe select the wrong file?\n${parsedAccounts.error.message}`
                    );
                    console.dir(accounts.value, { depth: null });
                    return;
                }
                dependencies.saveAccounts((accounts) => {
                    const matches = parsedAccounts.data.filter((p) =>
                        accounts.some((a) => a.id === p.id)
                    );
                    if (matches.length > 0) {
                        dependencies.addWarning(
                            "Import Accounts",
                            `Skipped ${
                                matches.length
                            } accounts that already exist. If you want to load the ones from the file, please delete the existing accounts first.\nHere are the accounts that were skipped:\n${matches
                                .map((m) => `${m.name} (${m.id})`)
                                .join("\n")}`
                        );
                    }
                    const newAccounts = parsedAccounts.data.filter(
                        (p) => !matches.some((m) => m.id === p.id)
                    );
                    return [...accounts, ...newAccounts];
                });
            }
        };
        input.click();
    };
}

export function createExportAccounts(dependencies: AccountDependencies) {
    return () => {
        const filename = "accounts.json";
        const dataStr = SuperJSON.stringify(dependencies.accounts);
        const dataUri =
            "data:application/json;charset=utf-8," +
            encodeURIComponent(dataStr);

        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", filename);
        linkElement.click();
    };
}

export function createMergeAccounts(dependencies: AccountDependencies) {
    return (targetId: string, account: Account) => {
        const targetAccount = dependencies.accounts.find(
            (acc) => acc.id === targetId
        );
        if (!targetAccount) {
            dependencies.addError(
                "Merge Accounts",
                "Merge unsuccessful. Target account not found."
            );
            return;
        }
        const id = targetAccount.id;
        const name = targetAccount.name;
        const createdAt = targetAccount.createdAt;
        const updatedAt = new Date();
        const existingHashes = new Set(
            targetAccount.transactions.map((t) => t.hash)
        );

        const sourceTransactions = hashTransaction(account.transactions, name);
        const newTransactions = sourceTransactions.filter(
            (t) => !existingHashes.has(t.hash)
        );

        const newAccount: Account = {
            id,
            name,
            createdAt,
            updatedAt,
            transactions: [...targetAccount.transactions, ...newTransactions],
        };

        dependencies.saveAccounts((accounts) => {
            const otherAccounts = accounts.filter((a) => a.id !== targetId);
            return [...otherAccounts, newAccount];
        });
    };
}
