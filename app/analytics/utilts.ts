import { Summary } from "@/components/analytics-card-summary";
import { sortTransactions } from "@/lib/transaction-sorter";
import { Dataset, Transaction } from "@/lib/types";

export type Datapoint = {
    date: string;
    balance: number;
    fullDate: Date;
};

export function summarize(
    transactions: Transaction[],
    mode: "monthly" | "yearly"
) {
    const summaries = transactions
        .map((t) => ({ amount: t.amount, bookingDate: t.bookingDate }))
        .reduce((acc, curr) => {
            const month = curr.bookingDate.toLocaleDateString("en-US", {
                month: "long",
            });
            const year = curr.bookingDate.toLocaleDateString("en-US", {
                year: "numeric",
            });
            const title = mode === "monthly" ? `${month} ${year}` : year;
            const isPositive = curr.amount > 0;
            const amount = Math.abs(curr.amount);

            const existing = acc.find((item) => item.title === title);
            if (existing) {
                existing.income += isPositive ? amount : 0;
                existing.expense += !isPositive ? amount : 0;
            } else {
                acc.push({
                    title,
                    income: isPositive ? amount : 0,
                    expense: !isPositive ? amount : 0,
                    average: 0,
                });
            }

            return acc;
        }, [] as Summary[]);

    const sum = summaries.reduce(
        (acc, curr) => acc + curr.income - curr.expense,
        0
    );
    const average = sum / summaries.length;

    return summaries.map((summary) => ({ ...summary, average }));
}

function orderTransactionsByDomino(transactions: Transaction[]) {
    if (transactions.length === 0) return [];

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
                console.warn(
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
            console.warn(
                `Disregarding transaction from start date that doesn't fit the domino chain: ${remainingTransaction.bookingDate.toDateString()}`
            );
        } else {
            throw new Error(
                `Unable to process transaction from ${remainingTransaction.bookingDate.toDateString()}. Expected all remaining transactions to be from start date ${oldestDate.toDateString()}`
            );
        }
    }

    return ordered;
}

function getDateKey(date: Date) {
    return date.toDateString();
}

function getDayClosingBalances(transactions: Transaction[]) {
    const orderedTransactions = orderTransactionsByDomino(transactions);
    const dayBalances = new Map<string, number>();

    for (const transaction of orderedTransactions) {
        const dateKey = getDateKey(transaction.bookingDate);
        dayBalances.set(dateKey, transaction.balanceAfterTransaction);
    }

    return dayBalances;
}

export function transformDatapoints(datasets: Dataset[]) {
    const allDates = new Set<string>();
    const datasetDayBalances = new Map<string, Map<string, number>>();

    for (const dataset of datasets) {
        const dayBalances = getDayClosingBalances(dataset.transactions);
        datasetDayBalances.set(dataset.name, dayBalances);

        for (const date of dayBalances.keys()) {
            allDates.add(date);
        }
    }

    const sortedDates = Array.from(allDates).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    const datapoints: Datapoint[] = [];
    const lastKnownBalance = new Map<string, number>();

    for (const dataset of datasets) {
        const dayBalances = datasetDayBalances.get(dataset.name)!;
        const firstDate = Array.from(dayBalances.keys()).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
        )[0];

        if (firstDate) {
            const firstTransaction = dataset.transactions.find(
                (t) => getDateKey(t.bookingDate) === firstDate
            );
            if (firstTransaction) {
                lastKnownBalance.set(
                    dataset.name,
                    firstTransaction.balanceAfterTransaction -
                        firstTransaction.amount
                );
            }
        }
    }

    for (const dateStr of sortedDates) {
        const date = new Date(dateStr);
        let totalBalance = 0;

        for (const dataset of datasets) {
            const dayBalances = datasetDayBalances.get(dataset.name)!;

            if (dayBalances.has(dateStr)) {
                const balance = dayBalances.get(dateStr)!;
                lastKnownBalance.set(dataset.name, balance);
                totalBalance += balance;
            } else {
                totalBalance += lastKnownBalance.get(dataset.name) || 0;
            }
        }

        datapoints.push({
            date: formatDate(date),
            balance: totalBalance,
            fullDate: date,
        });
    }

    return datapoints;
}

export function formatDate(date: Date) {
    return (
        date.toLocaleDateString("en-US", {
            month: "short",
        }) +
        " " +
        date.getFullYear().toString().slice(-2)
    );
}
