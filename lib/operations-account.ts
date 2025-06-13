import { TagRuleEngine } from "@/lib/tag-rule-engine/main";
import { TagRule } from "@/lib/tag-rule-engine/types";
import { Account, Transaction } from "@/lib/types";
import { CustomSuccess, newSuccess } from "@/lib/utils";

declare global {
    interface Array<T> {
        getActive(
            this: T extends Account ? Account[] : never,
            activeAccount: string | true | null
        ): Account[];
        preprocessAccounts(
            this: T extends Account ? Account[] : never,
            tagRules: TagRule[]
        ): CustomSuccess<T[]>;
        getTransactions(
            this: T extends Account ? Account[] : never
        ): Transaction[];
    }
}

if (!Array.prototype.getActive) {
    Array.prototype.getActive = function <T>(
        this: T[],
        activeAccount: string | true | null
    ) {
        return getActiveAccounts(this as Account[], activeAccount);
    };
}

if (!Array.prototype.preprocessAccounts) {
    Array.prototype.preprocessAccounts = function <T>(
        this: T[],
        tagRules: TagRule[]
    ) {
        return preprocessAccounts(this as Account[], tagRules);
    };
}

if (!Array.prototype.getTransactions) {
    Array.prototype.getTransactions = function <T>(this: T[]) {
        return getTransactions(this as Account[]);
    };
}

export function getActiveAccounts(
    accounts: Account[],
    activeAccount: string | true | null
) {
    if (activeAccount === true) return accounts;
    if (activeAccount === null) return [];
    return accounts.filter((d) => d.id === activeAccount);
}

export function preprocessAccounts(accounts: Account[], tagRules: TagRule[]) {
    const warnings: string[] = [];
    const processedAccounts = accounts.map((account) => {
        const result = TagRuleEngine.tagAccount(account, tagRules);
        if (result.warnings) warnings.push(...result.warnings);
        return result.value;
    });
    return newSuccess(processedAccounts, warnings);
}

export function getTransactions(accounts: Account[]): Transaction[] {
    return accounts.flatMap((account) => account.transactions);
}

export function getDateRange(accounts: Account[]): { start: Date; end: Date } {
    let start = new Date();
    let end = new Date(1900, 0, 1);

    for (const account of accounts) {
        for (const transaction of account.transactions) {
            if (transaction.bookingDate < start)
                start = transaction.bookingDate;
            if (transaction.bookingDate > end) end = transaction.bookingDate;
        }
    }
    return { start, end };
}
