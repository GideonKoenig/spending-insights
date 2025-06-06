import { Summary } from "@/components/analytics-card-summary";
import { type Account, type Transaction } from "@/lib/types";

export type Datapoint = {
    date: string;
    balance: number;
    fullDate: Date;
};

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export function summarize(
    transactions: Transaction[],
    mode: "monthly" | "yearly"
) {
    const summaryMap = new Map<string, { income: number; expense: number }>();
    let totalSum = 0;

    for (const transaction of transactions) {
        const date = transaction.bookingDate;
        const title =
            mode === "monthly"
                ? `${monthNames[date.getMonth()]} ${date.getFullYear()}`
                : String(date.getFullYear());

        const amount = Math.abs(transaction.amount);
        const isIncome = transaction.amount > 0;

        const existing = summaryMap.get(title);
        if (existing) {
            if (isIncome) {
                existing.income += amount;
            } else {
                existing.expense += amount;
            }
        } else {
            summaryMap.set(title, {
                income: isIncome ? amount : 0,
                expense: isIncome ? 0 : amount,
            });
        }

        totalSum += transaction.amount;
    }

    const summaries = Array.from(summaryMap.entries()).map(([title, data]) => ({
        title,
        income: data.income,
        expense: data.expense,
        average: totalSum / summaryMap.size,
    }));

    return summaries;
}

function orderTransactionsByDomino(
    transactions: Transaction[],
    addWarning?: (origin: string, message: string) => void,
    addError?: (origin: string, message: string) => void
) {
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
                if (addWarning) {
                    addWarning(
                        "Analytics",
                        `Skipping transaction that should have come before current transaction: ${candidate.bookingDate.toDateString()} < ${current.bookingDate.toDateString()}`
                    );
                }
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
            if (addWarning) {
                addWarning(
                    "Analytics - orderTransactionsByDomino",
                    `Disregarding transaction from start date that doesn't fit the domino chain: ${remainingTransaction.bookingDate.toDateString()}`
                );
            }
        } else {
            if (addError) {
                addError(
                    "Analytics - orderTransactionsByDomino",
                    `Unexpected transaction from ${remainingTransaction.bookingDate.toDateString()}. Expected all remaining transactions to be from start date ${oldestDate.toDateString()}`
                );
            }
            return ordered;
        }
    }

    return ordered;
}

function getDateKey(date: Date) {
    return date.getTime();
}

function getDayClosingBalances(
    transactions: Transaction[],
    addWarning?: (origin: string, message: string) => void,
    addError?: (origin: string, message: string) => void,
    addDebug?: (origin: string, message: string) => void
) {
    const orderedTransactions = orderTransactionsByDomino(
        transactions,
        addWarning,
        addError
    );
    const dayBalances = new Map<number, number>();
    const dayToDate = new Map<number, Date>();

    for (const transaction of orderedTransactions) {
        const dateKey = getDateKey(transaction.bookingDate);
        dayBalances.set(dateKey, transaction.balanceAfterTransaction);
        if (!dayToDate.has(dateKey)) {
            dayToDate.set(dateKey, transaction.bookingDate);
        }
    }

    return { dayBalances, dayToDate };
}

export function transformDatapoints(
    accounts: Account[],
    addWarning?: (origin: string, message: string) => void,
    addError?: (origin: string, message: string) => void,
    addDebug?: (origin: string, message: string) => void
) {
    const allDateKeys = new Set<number>();
    const accountDayBalances = new Map<string, Map<number, number>>();
    const dayToDate = new Map<number, Date>();

    for (const account of accounts) {
        const result = getDayClosingBalances(
            account.transactions,
            addWarning,
            addError,
            addDebug
        );
        accountDayBalances.set(account.name, result.dayBalances);

        for (const [dateKey, date] of result.dayToDate) {
            allDateKeys.add(dateKey);
            dayToDate.set(dateKey, date);
        }
    }

    const sortedDateKeys = Array.from(allDateKeys).sort((a, b) => a - b);

    const datapoints: Datapoint[] = [];
    const lastKnownBalance = new Map<string, number>();

    for (const account of accounts) {
        const dayBalances = accountDayBalances.get(account.name)!;
        if (dayBalances.size === 0) continue;

        const firstDateKey = sortedDateKeys.find((dateKey) =>
            dayBalances.has(dateKey)
        );
        if (firstDateKey) {
            const firstTransaction = account.transactions.find(
                (t) => getDateKey(t.bookingDate) === firstDateKey
            );
            if (firstTransaction) {
                lastKnownBalance.set(
                    account.name,
                    firstTransaction.balanceAfterTransaction -
                        firstTransaction.amount
                );
            }
        }
    }

    for (const dateKey of sortedDateKeys) {
        const dateObj = dayToDate.get(dateKey)!;
        let totalBalance = 0;

        for (const account of accounts) {
            const dayBalances = accountDayBalances.get(account.name)!;

            if (dayBalances.has(dateKey)) {
                const balance = dayBalances.get(dateKey)!;
                lastKnownBalance.set(account.name, balance);
                totalBalance += balance;
            } else {
                totalBalance += lastKnownBalance.get(account.name) || 0;
            }
        }

        datapoints.push({
            date: formatDate(dateObj),
            balance: totalBalance,
            fullDate: dateObj,
        });
    }

    return datapoints;
}

const monthAbbrs = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

export function formatDate(date: Date) {
    return (
        monthAbbrs[date.getMonth()] +
        " " +
        date.getFullYear().toString().slice(-2)
    );
}
