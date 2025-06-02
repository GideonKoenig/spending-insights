import { type Transaction } from "@/lib/types";

export type SortOption =
    | "newest"
    | "oldest"
    | "highest-amount"
    | "lowest-amount"
    | "participant";

export const SORT_OPTIONS = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "highest-amount", label: "Highest Amount" },
    { value: "lowest-amount", label: "Lowest Amount" },
    { value: "participant", label: "Participant" },
] as const;

export function sortTransactions(
    transactions: Transaction[],
    sortBy: SortOption
): Transaction[] {
    const sorted = [...transactions];

    switch (sortBy) {
        case "newest":
            return sorted.sort(
                (a, b) => b.bookingDate.getTime() - a.bookingDate.getTime()
            );
        case "oldest":
            return sorted.sort(
                (a, b) => a.bookingDate.getTime() - b.bookingDate.getTime()
            );
        case "highest-amount":
            return sorted.sort(
                (a, b) => Math.abs(b.amount) - Math.abs(a.amount)
            );
        case "lowest-amount":
            return sorted.sort(
                (a, b) => Math.abs(a.amount) - Math.abs(b.amount)
            );
        case "participant":
            return sorted.sort((a, b) =>
                a.paymentParticipant.localeCompare(b.paymentParticipant)
            );
        default:
            return sorted;
    }
}
