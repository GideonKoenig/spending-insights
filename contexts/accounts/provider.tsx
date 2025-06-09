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
import { dominoSort } from "@/lib/analytics-tools/sortings";
import {
    AccountDependencies,
    createExportAccounts,
    createImportAccounts,
    createMergeAccounts,
} from "@/contexts/accounts/utils";
import { handleResult } from "@/contexts/notification/utils";

const ACCOUNTS_KEY = "bank-history_accounts";
const ACTIVE_ACCOUNT_KEY = "bank-history_active_account";

export interface AccountsContextType {
    accounts: Account[];
    activeAccount: string | true;
    loading: boolean;
    setActiveAccount: (account: string | true) => void;
    addAccount: (account: Account) => void;
    renameAccount: (oldName: string, newName: string) => void;
    mergeAccounts: (targetId: string, account: Account) => void;
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
    const notificationContext = useNotifications();

    useEffect(() => {
        setLoading(true);

        const storedAccounts = localStorage.getItem(ACCOUNTS_KEY);
        if (!storedAccounts) {
            setLoading(false);
            return;
        }

        const parseResult = tryCatch(() =>
            SuperJSON.parse<Account[]>(storedAccounts)
        );
        const accounts = handleResult(
            parseResult,
            "Parsing accounts",
            notificationContext,
            []
        );

        const sortedResult = dominoSort(accounts);
        const sortedAccounts = handleResult(
            sortedResult,
            "Sorting accounts",
            notificationContext,
            []
        );
        setAccounts(sortedAccounts);

        const storedActiveAccount = localStorage.getItem(ACTIVE_ACCOUNT_KEY);
        if (!storedActiveAccount) {
            setLoading(false);
            return;
        }
        const activeResult = tryCatch(() =>
            SuperJSON.parse<string | true>(storedActiveAccount)
        );
        const activeAccount = handleResult(
            activeResult,
            "Parsing active account",
            notificationContext,
            true
        );
        setActiveAccount(activeAccount);
        setLoading(false);
    }, [notificationContext]);

    function saveAccounts(updater: (accounts: Account[]) => Account[]) {
        setAccounts((prev) => {
            const newAccounts = updater(prev);

            const sortedResult = dominoSort(newAccounts);
            const sortedAccounts = handleResult(
                sortedResult,
                "Sorting accounts",
                notificationContext,
                []
            );

            localStorage.setItem(
                ACCOUNTS_KEY,
                SuperJSON.stringify(sortedAccounts)
            );
            if (!sortedAccounts.find((acc) => acc.id === activeAccount)) {
                handleSetActiveAccount(true);
            }
            return sortedAccounts;
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
        notificationContext,
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
