import { Account, Transaction } from "@/lib/types";
import { newError, newSuccess } from "@/lib/utils";

export function dominoSort(accounts: Account[]) {
    if (accounts.length === 0) return newSuccess([]);
    const accountsSorted: Account[] = [];
    const warnings: string[] = [];

    for (const account of accounts) {
        const transactions = account.transactions;

        const sorted = transactions.sort(
            (a, b) => a.bookingDate.getTime() - b.bookingDate.getTime()
        );
        const oldestDate = sorted[0].bookingDate;
        const firstOfSecondDay = sorted.findIndex(
            (t) => t.bookingDate.getTime() !== oldestDate.getTime()
        );

        const remaining = sorted.slice(firstOfSecondDay);
        const ordered: Transaction[] = [sorted[firstOfSecondDay - 1]];
        const skipped = sorted.slice(0, firstOfSecondDay - 1);

        const forwardResult = processTransactionChain(
            remaining,
            ordered[0],
            true
        );
        if (forwardResult.warnings) warnings.push(...forwardResult.warnings);
        ordered.push(...forwardResult.value.chain);

        const backwardResult = processTransactionChain(
            skipped,
            ordered[0],
            false
        );
        if (backwardResult.warnings) warnings.push(...backwardResult.warnings);
        ordered.unshift(...backwardResult.value.chain);

        const totalRemaining =
            forwardResult.value.remaining.length +
            backwardResult.value.remaining.length;

        if (totalRemaining > 0) {
            return newError(
                `Unable to sort transactions for account ${account.name}.\nFound ${totalRemaining} transactions that don't fit the domino chain.`
            );
        }

        accountsSorted.push({
            ...account,
            transactions: ordered,
        });
    }

    return newSuccess(accountsSorted, warnings);
}

function processTransactionChain(
    remaining: Transaction[],
    current: Transaction,
    isForward: boolean
) {
    const chain: Transaction[] = [];
    const warnings: string[] = [];

    while (remaining.length > 0) {
        const targetBalance = isForward
            ? current.balanceAfterTransaction
            : current.balanceAfterTransaction - current.amount;

        const matchIndex = remaining.findIndex((t) => {
            const candidateBalance = isForward
                ? t.balanceAfterTransaction - t.amount
                : t.balanceAfterTransaction;
            return Math.abs(candidateBalance - targetBalance) < 0.01;
        });

        if (matchIndex !== -1) {
            const candidate = remaining[matchIndex];
            const dateComparison = isForward
                ? candidate.bookingDate.getTime() <
                  current.bookingDate.getTime()
                : candidate.bookingDate.getTime() >
                  current.bookingDate.getTime();

            if (dateComparison) {
                const direction = isForward ? "before" : "after";
                const operator = isForward ? "<" : ">";
                warnings.push(
                    `Skipping transaction that should have come ${direction} current transaction: ${candidate.bookingDate.toDateString()} ${operator} ${current.bookingDate.toDateString()}`
                );
                remaining.splice(matchIndex, 1);
                continue;
            }

            current = candidate;
            chain.push(current);
            remaining.splice(matchIndex, 1);
        } else {
            break;
        }
    }

    return newSuccess({ chain, remaining }, warnings);
}
