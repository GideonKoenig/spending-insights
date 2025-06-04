import { filter } from "@/lib/transaction-filter/main";
import { FILTER_OPTIONS } from "@/lib/transaction-filter/transaction-filter-options";
import { TagMatcher, Transaction } from "@/lib/types";

export function getTaggedTransactions(
    transactions: Transaction[],
    tagMatchers: TagMatcher[]
) {
    return transactions.filter((transaction) => {
        return tagMatchers.some((matcher) => {
            return filter([transaction], matcher.filters, FILTER_OPTIONS);
        });
    });
}

export function getUntaggedTransactions(
    transactions: Transaction[],
    tagMatchers: TagMatcher[]
) {
    return transactions.filter((transaction) => {
        return !tagMatchers.some((matcher) => {
            return filter([transaction], matcher.filters, FILTER_OPTIONS);
        });
    });
}
