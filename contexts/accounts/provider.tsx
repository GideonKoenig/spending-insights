"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import { type Account } from "@/lib/types";
import { useNotifications } from "@/contexts/notification/provider";
import { SuperJSON } from "superjson";
import { tryCatch } from "@/lib/utils";
import {
    AccountDependencies,
    createExportAccounts,
    createImportAccounts,
    createMergeAccounts,
} from "@/contexts/accounts/utils";

const ACCOUNTS_KEY = "bank-history_accounts";
const ACTIVE_ACCOUNT_KEY = "bank-history_active_account";

export interface AccountsContextType {
    accounts: Account[];
    activeAccount: string | true;
    loading: boolean;
    setActiveAccount: (account: string | true) => void;
    addAccount: (account: Account) => void;
    renameAccount: (oldName: string, newName: string) => void;
    mergeAccounts: (sourceId: string, targetId: string) => void;
    deleteAccount: (name: string) => void;
    importAccounts: () => void;
    exportAccounts: () => void;
}

const AccountsContext = createContext<AccountsContextType | null>(null);

export function useAccounts() {
    const context = useContext(AccountsContext);
    if (!context) {
        throw new Error("useAccounts must be used within an AccountsProvider");
    }
    return context;
}

export function AccountProvider(props: { children: ReactNode }) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [activeAccount, setActiveAccount] = useState<string | true>(true);
    const [loading, setLoading] = useState(true);
    const { addError, addWarning } = useNotifications();

    useEffect(() => {
        setLoading(true);

        const storedAccounts = localStorage.getItem(ACCOUNTS_KEY);
        if (!storedAccounts) return;

        const accounts = tryCatch(() =>
            SuperJSON.parse<Account[]>(storedAccounts)
        );
        if (!accounts.success) {
            addError(
                "Internal Error",
                "Failed to parse stored accounts. Local storage may be corrupted. Contact the me if this persists."
            );
            setLoading(false);
            return;
        }
        setAccounts(accounts.value);

        const storedActiveAccount = localStorage.getItem(ACTIVE_ACCOUNT_KEY);
        if (!storedActiveAccount) return;

        const activeAccount = tryCatch(() =>
            SuperJSON.parse<string | true>(storedActiveAccount)
        );
        if (!activeAccount.success) {
            setLoading(false);
            return;
        }

        setActiveAccount(activeAccount.value);
        setLoading(false);
    }, [addError]);

    function saveAccounts(updater: (accounts: Account[]) => Account[]) {
        setAccounts((prev) => {
            const newAccounts = updater(prev);
            localStorage.setItem(
                ACCOUNTS_KEY,
                SuperJSON.stringify(newAccounts)
            );
            if (!newAccounts.find((acc) => acc.id === activeAccount)) {
                handleSetActiveAccount(true);
            }
            return newAccounts;
        });
    }

    function handleSetActiveAccount(account: string | true) {
        setActiveAccount(account);
        localStorage.setItem(ACTIVE_ACCOUNT_KEY, SuperJSON.stringify(account));
    }

    function addAccount(account: Account) {
        saveAccounts((accounts) => [...accounts, account]);
    }

    function renameAccount(id: string, newName: string) {
        saveAccounts((accounts) =>
            accounts.map((account) =>
                account.id === id ? { ...account, name: newName } : account
            )
        );
    }

    function deleteAccount(id: string) {
        saveAccounts((accounts) => accounts.filter((acc) => acc.id !== id));
    }

    const dependencies: AccountDependencies = {
        addError,
        addWarning,
        saveAccounts,
        accounts,
    };
    const importAccounts = createImportAccounts(dependencies);
    const exportAccounts = createExportAccounts(dependencies);
    const mergeAccounts = createMergeAccounts(dependencies);

    const value: AccountsContextType = {
        accounts,
        activeAccount,
        loading,
        setActiveAccount: handleSetActiveAccount,
        addAccount,
        renameAccount,
        mergeAccounts,
        deleteAccount,
        importAccounts,
        exportAccounts,
    };

    return (
        <AccountsContext.Provider value={value}>
            {props.children}
        </AccountsContext.Provider>
    );
}
