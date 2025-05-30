import type { Transaction } from "@/lib/types";
import { operators } from "./operators";
import type { Filters } from "./types";

export type TransactionFilters = Filters<Transaction>;

export function filterTransactions(
    transactions: Transaction[],
    filters: TransactionFilters
): Transaction[] {
    return transactions.filter((transaction) => {
        // Date range filtering
        if (
            filters.dateRange.from &&
            transaction.bookingDate < filters.dateRange.from
        ) {
            return false;
        }
        if (
            filters.dateRange.to &&
            transaction.bookingDate > filters.dateRange.to
        ) {
            return false;
        }

        // Condition filtering using operators
        return filters.conditions.every((condition) => {
            const value = transaction[condition.field];
            const operator = operators[condition.operator];
            return operator(value, condition.value);
        });
    });
}
