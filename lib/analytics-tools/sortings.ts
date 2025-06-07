import { getDateKey } from "@/lib/analytics-tools/utilts";
import { Transaction } from "@/lib/types";
import { newError, newSuccess } from "@/lib/utils";

export function orderTransactionsByDomino(transactions: Transaction[]) {
    if (transactions.length === 0) return newSuccess([]);
    const warnings: string[] = [];

    const sortedTransactions = [...transactions].sort(
        (a, b) => a.bookingDate.getTime() - b.bookingDate.getTime()
    );

    const oldestDate = sortedTransactions[0].bookingDate;
    const firstDayTransactions = sortedTransactions.filter(
        (t) => t.bookingDate.getTime() === oldestDate.getTime()
    );
    const startTransaction = firstDayTransactions.reduce((lowest, curr) => {
        const lowestBefore = lowest.balanceAfterTransaction - lowest.amount;
        const currBefore = curr.balanceAfterTransaction - curr.amount;
        return currBefore < lowestBefore ? curr : lowest;
    });

    const remaining = sortedTransactions.filter((t) => t !== startTransaction);
    const ordered: Transaction[] = [startTransaction];
    let current = startTransaction;

    while (remaining.length > 0) {
        const currentAfterBalance = current.balanceAfterTransaction;

        const nextIndex = remaining.findIndex(
            (t) =>
                Math.abs(
                    t.balanceAfterTransaction - t.amount - currentAfterBalance
                ) < 0.01
        );

        if (nextIndex !== -1) {
            const candidate = remaining[nextIndex];

            if (
                candidate.bookingDate.getTime() < current.bookingDate.getTime()
            ) {
                warnings.push(
                    `Skipping transaction that should have come before current transaction: ${candidate.bookingDate.toDateString()} < ${current.bookingDate.toDateString()}`
                );
                remaining.splice(nextIndex, 1);
                continue;
            }

            current = candidate;
            ordered.push(current);
            remaining.splice(nextIndex, 1);
        } else {
            break;
        }
    }

    for (const remainingTransaction of remaining) {
        if (
            getDateKey(remainingTransaction.bookingDate) ===
            getDateKey(oldestDate)
        ) {
            warnings.push(
                `Disregarding transaction from start date that doesn't fit the domino chain: ${remainingTransaction.bookingDate.toDateString()}`
            );
        } else {
            return newError(
                `Unexpected transaction from ${remainingTransaction.bookingDate.toDateString()}. Expected all remaining transactions to be from start date ${oldestDate.toDateString()}`
            );
        }
    }

    return newSuccess(ordered, warnings);
}
