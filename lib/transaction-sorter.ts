import { type Transaction } from "@/lib/types";

export type TransactionSortOption =
    | "newest"
    | "oldest"
    | "highest-amount"
    | "lowest-amount"
    | "participant-ascending"
    | "participant-descending";

export const TRANSACTION_SORT_OPTIONS = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "highest-amount", label: "Highest Amount" },
    { value: "lowest-amount", label: "Lowest Amount" },
    { value: "participant-ascending", label: "Participant (A-Z)" },
    { value: "participant-descending", label: "Participant (Z-A)" },
] as const;

export function sortTransactions(
    transactions: Transaction[],
    sortBy: TransactionSortOption
): Transaction[] {
    const sorted = [...transactions];

    switch (sortBy) {
        case "newest":
            return sorted.sort(
                (a, b) => b.valueDate.getTime() - a.valueDate.getTime()
            );
        case "oldest":
            return sorted.sort(
                (a, b) => a.valueDate.getTime() - b.valueDate.getTime()
            );
        case "highest-amount":
            return sorted.sort(
                (a, b) => Math.abs(b.amount) - Math.abs(a.amount)
            );
        case "lowest-amount":
            return sorted.sort(
                (a, b) => Math.abs(a.amount) - Math.abs(b.amount)
            );
        case "participant-ascending":
            return sorted.sort((a, b) =>
                a.participantName.localeCompare(b.participantName)
            );
        case "participant-descending":
            return sorted.sort((a, b) =>
                b.participantName.localeCompare(a.participantName)
            );
        default:
            return sorted;
    }
}
