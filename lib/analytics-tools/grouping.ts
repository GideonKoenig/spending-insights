import { GraphDatapoint } from "@/lib/analytics-tools/types";
import { formatDate, getMonthById } from "@/lib/analytics-tools/utilts";
import { getDateKey } from "@/lib/analytics-tools/utilts";
import { Account, Transaction } from "@/lib/types";
import { orderTransactionsByDomino } from "@/lib/analytics-tools/sortings";
import { newSuccess } from "@/lib/utils";

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
                ? `${getMonthById(date.getMonth())!.name} ${date.getFullYear()}`
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

function getDayClosingBalances(transactions: Transaction[]) {
    const warnings: string[] = [];
    const orderedTransactions = orderTransactionsByDomino(transactions);
    if (!orderedTransactions.success) return orderedTransactions;
    if (orderedTransactions.warnings)
        warnings.push(...orderedTransactions.warnings);

    const dayBalances = new Map<number, number>();
    const dayToDate = new Map<number, Date>();

    for (const transaction of orderedTransactions.value) {
        const dateKey = getDateKey(transaction.bookingDate);
        dayBalances.set(dateKey, transaction.balanceAfterTransaction);
        if (!dayToDate.has(dateKey)) {
            dayToDate.set(dateKey, transaction.bookingDate);
        }
    }

    return newSuccess({ dayBalances, dayToDate }, warnings);
}

export function transformDatapoints(accounts: Account[]) {
    const allDateKeys = new Set<number>();
    const accountDayBalances = new Map<string, Map<number, number>>();
    const dayToDate = new Map<number, Date>();
    const warnings: string[] = [];

    for (const account of accounts) {
        const result = getDayClosingBalances(account.transactions);
        if (!result.success) return result;
        if (result.warnings) warnings.push(...result.warnings);
        accountDayBalances.set(account.name, result.value.dayBalances);

        for (const [dateKey, date] of result.value.dayToDate) {
            allDateKeys.add(dateKey);
            dayToDate.set(dateKey, date);
        }
    }

    const sortedDateKeys = Array.from(allDateKeys).sort((a, b) => a - b);

    const datapoints: GraphDatapoint[] = [];
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

    return newSuccess(datapoints, warnings);
}
