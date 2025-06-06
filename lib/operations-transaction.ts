import { Transaction } from "@/lib/types";
import { filter } from "@/lib/transaction-filter/main";
import { FilterRule, FilterOption } from "@/lib/transaction-filter/types";

declare global {
    interface Array<T> {
        filterTransactions(
            this: T extends Transaction ? Transaction[] : never,
            rules: FilterRule[],
            options: FilterOption[]
        ): Transaction[];
        getTagged(
            this: T extends Transaction ? Transaction[] : never
        ): Transaction[];
        getUntagged(
            this: T extends Transaction ? Transaction[] : never
        ): Transaction[];
    }
}

if (!Array.prototype.filterTransactions) {
    Array.prototype.filterTransactions = function <T>(
        this: T[],
        rules: FilterRule[],
        options: FilterOption[]
    ) {
        return filterTransactions(this as Transaction[], rules, options);
    };
}

if (!Array.prototype.getTagged) {
    Array.prototype.getTagged = function <T>(this: T[]) {
        return getTagged(this as Transaction[]);
    };
}

if (!Array.prototype.getUntagged) {
    Array.prototype.getUntagged = function <T>(this: T[]) {
        return getUntagged(this as Transaction[]);
    };
}

function filterTransactions(
    transactions: Transaction[],
    rules: FilterRule[],
    options: FilterOption[]
): Transaction[] {
    return filter(transactions, rules, options);
}

function getTagged(transactions: Transaction[]): Transaction[] {
    return transactions.filter((transaction) => transaction.tag);
}

function getUntagged(transactions: Transaction[]): Transaction[] {
    return transactions.filter((transaction) => !transaction.tag);
}
