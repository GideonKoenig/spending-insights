import { Month } from "@/lib/analytics-tools/types";
import { getMonthById } from "@/lib/analytics-tools/utilts";
import { Transaction, Account } from "@/lib/types";
import { startOfWeek, getISOWeek, getISOWeekYear, endOfWeek } from "date-fns";

export type Insights = {
    overall: {
        income: number;
        expense: number;
        balance: number;
        countMonths: number;
        countYears: number;
        countWeeks: number;
        avgIncomePerMonth: number;
        avgExpensePerMonth: number;
        avgBalancePerMonth: number;
        avgIncomePerYear: number;
        avgExpensePerYear: number;
        avgBalancePerYear: number;
        avgIncomePerWeek: number;
        avgExpensePerWeek: number;
        avgBalancePerWeek: number;
        transactionCount: number;
        incomeTransactionCount: number;
        expenseTransactionCount: number;
        balanceBefore: number;
        balanceAfter: number;
    };
    daily: {
        date: Date;
        income: number;
        expense: number;
        balance: number;
        transactionCount: number;
        incomeTransactionCount: number;
        expenseTransactionCount: number;
        balanceBefore: number;
        balanceAfter: number;
    }[];
    weekly: {
        weekStartDate: Date;
        weekEndDate: Date;
        year: number;
        week: number;
        income: number;
        expense: number;
        balance: number;
        transactionCount: number;
        incomeTransactionCount: number;
        expenseTransactionCount: number;
        balanceBefore: number;
        balanceAfter: number;
    }[];
    monthly: {
        month: Month;
        year: number;
        income: number;
        expense: number;
        balance: number;
        transactionCount: number;
        incomeTransactionCount: number;
        expenseTransactionCount: number;
        balanceBefore: number;
        balanceAfter: number;
    }[];
    yearly: {
        year: number;
        income: number;
        expense: number;
        balance: number;
        transactionCount: number;
        incomeTransactionCount: number;
        expenseTransactionCount: number;
        balanceBefore: number;
        balanceAfter: number;
    }[];
};

type AccountBalanceMap = Map<
    string,
    Map<number, { first: Transaction; last: Transaction }>
>;

export function getInsights(accounts: Account[]): Insights {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalTransactionCount = 0;
    let totalIncomeTransactionCount = 0;
    let totalExpenseTransactionCount = 0;
    const allYears = new Set<number>();
    const allMonths = new Set<number>();
    const allWeeks = new Set<number>();
    const allDays = new Set<number>();

    const dailyMap = new Map<
        number,
        {
            date: Date;
            income: number;
            expense: number;
            balance: number;
            transactionCount: number;
            incomeTransactionCount: number;
            expenseTransactionCount: number;
        }
    >();

    const weeklyMap = new Map<
        number,
        {
            weekStartDate: Date;
            weekEndDate: Date;
            year: number;
            week: number;
            income: number;
            expense: number;
            balance: number;
            transactionCount: number;
            incomeTransactionCount: number;
            expenseTransactionCount: number;
        }
    >();

    const monthlyMap = new Map<
        number,
        {
            month: Month;
            year: number;
            income: number;
            expense: number;
            balance: number;
            transactionCount: number;
            incomeTransactionCount: number;
            expenseTransactionCount: number;
        }
    >();

    const yearlyMap = new Map<
        number,
        {
            year: number;
            income: number;
            expense: number;
            balance: number;
            transactionCount: number;
            incomeTransactionCount: number;
            expenseTransactionCount: number;
        }
    >();

    // Track balance info per account for each period
    const accountDailyBalances: AccountBalanceMap = new Map();
    const accountWeeklyBalances: AccountBalanceMap = new Map();
    const accountMonthlyBalances: AccountBalanceMap = new Map();
    const accountYearlyBalances: AccountBalanceMap = new Map();
    const accountFirstTransaction = new Map<string, Transaction>();
    const accountLastTransaction = new Map<string, Transaction>();

    // Process each account to collect transaction data and balance info
    for (const account of accounts) {
        const dailyBalances = new Map<
            number,
            { first: Transaction; last: Transaction }
        >();
        const weeklyBalances = new Map<
            number,
            { first: Transaction; last: Transaction }
        >();
        const monthlyBalances = new Map<
            number,
            { first: Transaction; last: Transaction }
        >();
        const yearlyBalances = new Map<
            number,
            { first: Transaction; last: Transaction }
        >();

        for (const transaction of account.transactions) {
            const date = transaction.valueDate;

            // Track first/last transaction per account
            if (!accountFirstTransaction.has(account.id)) {
                accountFirstTransaction.set(account.id, transaction);
            }
            accountLastTransaction.set(account.id, transaction);

            // Track balance info
            const dayKey = date.getTime();
            if (!dailyBalances.has(dayKey)) {
                dailyBalances.set(dayKey, {
                    first: transaction,
                    last: transaction,
                });
            } else {
                dailyBalances.get(dayKey)!.last = transaction;
            }

            const weekStartDate = startOfWeek(date, { weekStartsOn: 1 });
            // Monday = 1
            const weekKey = weekStartDate.getTime();
            if (!weeklyBalances.has(weekKey)) {
                weeklyBalances.set(weekKey, {
                    first: transaction,
                    last: transaction,
                });
            } else {
                weeklyBalances.get(weekKey)!.last = transaction;
            }

            const monthKey = date.getFullYear() * 100 + date.getMonth();
            if (!monthlyBalances.has(monthKey)) {
                monthlyBalances.set(monthKey, {
                    first: transaction,
                    last: transaction,
                });
            } else {
                monthlyBalances.get(monthKey)!.last = transaction;
            }

            const yearKey = date.getFullYear();
            if (!yearlyBalances.has(yearKey)) {
                yearlyBalances.set(yearKey, {
                    first: transaction,
                    last: transaction,
                });
            } else {
                yearlyBalances.get(yearKey)!.last = transaction;
            }

            allYears.add(yearKey);
            allMonths.add(monthKey);
            allWeeks.add(weekKey);
            allDays.add(dayKey);

            // Aggregation initialization
            if (!dailyMap.has(dayKey)) {
                dailyMap.set(dayKey, {
                    date: date,
                    income: 0,
                    expense: 0,
                    balance: 0,
                    transactionCount: 0,
                    incomeTransactionCount: 0,
                    expenseTransactionCount: 0,
                });
            }
            if (!weeklyMap.has(weekKey)) {
                weeklyMap.set(weekKey, {
                    weekStartDate: weekStartDate,
                    weekEndDate: endOfWeek(weekStartDate, { weekStartsOn: 1 }),
                    year: getISOWeekYear(date),
                    week: getISOWeek(date),
                    income: 0,
                    expense: 0,
                    balance: 0,
                    transactionCount: 0,
                    incomeTransactionCount: 0,
                    expenseTransactionCount: 0,
                });
            }
            const month = getMonthById(date.getMonth())!;
            if (!monthlyMap.has(monthKey)) {
                monthlyMap.set(monthKey, {
                    month,
                    year: yearKey,
                    income: 0,
                    expense: 0,
                    balance: 0,
                    transactionCount: 0,
                    incomeTransactionCount: 0,
                    expenseTransactionCount: 0,
                });
            }
            if (!yearlyMap.has(yearKey)) {
                yearlyMap.set(yearKey, {
                    year: yearKey,
                    income: 0,
                    expense: 0,
                    balance: 0,
                    transactionCount: 0,
                    incomeTransactionCount: 0,
                    expenseTransactionCount: 0,
                });
            }

            // Skip ignored transactions for income/expense/count statistics
            if (transaction.tag?.ignore) continue;

            const amount = Math.abs(transaction.amount);
            const isIncome = transaction.amount > 0;

            // Overall statistics
            totalIncome += isIncome ? amount : 0;
            totalExpense += isIncome ? 0 : amount;
            totalIncomeTransactionCount += isIncome ? 1 : 0;
            totalExpenseTransactionCount += isIncome ? 0 : 1;
            totalTransactionCount += 1;

            // Daily aggregation
            const dayData = dailyMap.get(dayKey)!;
            dayData.income += isIncome ? amount : 0;
            dayData.expense += isIncome ? 0 : amount;
            dayData.balance = dayData.income - dayData.expense;
            dayData.transactionCount += 1;
            dayData.incomeTransactionCount += isIncome ? 1 : 0;
            dayData.expenseTransactionCount += isIncome ? 0 : 1;

            // Weekly aggregation
            const weekData = weeklyMap.get(weekKey)!;
            weekData.income += isIncome ? amount : 0;
            weekData.expense += isIncome ? 0 : amount;
            weekData.balance = weekData.income - weekData.expense;
            weekData.transactionCount += 1;
            weekData.incomeTransactionCount += isIncome ? 1 : 0;
            weekData.expenseTransactionCount += isIncome ? 0 : 1;

            // Monthly aggregation
            const monthData = monthlyMap.get(monthKey)!;
            monthData.income += isIncome ? amount : 0;
            monthData.expense += isIncome ? 0 : amount;
            monthData.balance = monthData.income - monthData.expense;
            monthData.transactionCount += 1;
            monthData.incomeTransactionCount += isIncome ? 1 : 0;
            monthData.expenseTransactionCount += isIncome ? 0 : 1;

            // Yearly aggregation
            const yearData = yearlyMap.get(yearKey)!;
            yearData.income += isIncome ? amount : 0;
            yearData.expense += isIncome ? 0 : amount;
            yearData.balance = yearData.income - yearData.expense;
            yearData.transactionCount += 1;
            yearData.incomeTransactionCount += isIncome ? 1 : 0;
            yearData.expenseTransactionCount += isIncome ? 0 : 1;
        }

        accountDailyBalances.set(account.id, dailyBalances);
        accountWeeklyBalances.set(account.id, weeklyBalances);
        accountMonthlyBalances.set(account.id, monthlyBalances);
        accountYearlyBalances.set(account.id, yearlyBalances);
    }

    // Sort period keys chronologically
    const sortedDayKeys = Array.from(allDays).sort();
    const sortedWeekKeys = Array.from(allWeeks).sort();
    const sortedMonthKeys = Array.from(allMonths).sort();
    const sortedYearKeys = Array.from(allYears).sort((a, b) => a - b);

    // Calculate balances for each period type
    const dailyBalanceResults = calculatePeriodBalances(
        sortedDayKeys,
        accountDailyBalances,
        accountFirstTransaction
    );

    const weeklyBalanceResults = calculatePeriodBalances(
        sortedWeekKeys,
        accountWeeklyBalances,
        accountFirstTransaction
    );

    const monthlyBalanceResults = calculatePeriodBalances(
        sortedMonthKeys,
        accountMonthlyBalances,
        accountFirstTransaction
    );

    const yearlyBalanceResults = calculatePeriodBalances(
        sortedYearKeys,
        accountYearlyBalances,
        accountFirstTransaction
    );

    // Add balance info to results
    const daily = Array.from(dailyMap.values())
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((dayData) => {
            const dayKey = dayData.date.getTime();
            const balanceInfo = dailyBalanceResults.get(dayKey)!;
            return { ...dayData, ...balanceInfo };
        });

    const weekly = Array.from(weeklyMap.values())
        .sort((a, b) => a.weekStartDate.getTime() - b.weekStartDate.getTime())
        .map((weekData) => {
            const weekKey = weekData.weekStartDate.getTime();
            const balanceInfo = weeklyBalanceResults.get(weekKey)!;
            return { ...weekData, ...balanceInfo };
        });

    const monthly = Array.from(monthlyMap.values())
        .sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month.id - b.month.id;
        })
        .map((monthData) => {
            const monthKey = monthData.year * 100 + monthData.month.id;
            const balanceInfo = monthlyBalanceResults.get(monthKey)!;
            return { ...monthData, ...balanceInfo };
        });

    const yearly = Array.from(yearlyMap.values())
        .sort((a, b) => a.year - b.year)
        .map((yearData) => {
            const balanceInfo = yearlyBalanceResults.get(yearData.year)!;
            return { ...yearData, ...balanceInfo };
        });

    // Calculate overall balance before/after
    const overallBalanceBefore =
        accountFirstTransaction.size > 0
            ? Array.from(accountFirstTransaction.values()).reduce(
                  (sum, t) => sum + (t.balanceAfterTransaction - t.amount),
                  0
              )
            : 0;
    const overallBalanceAfter =
        accountLastTransaction.size > 0
            ? Array.from(accountLastTransaction.values()).reduce(
                  (sum, t) => sum + t.balanceAfterTransaction,
                  0
              )
            : 0;

    const totalBalance = totalIncome - totalExpense;

    return {
        overall: {
            income: totalIncome,
            expense: totalExpense,
            balance: totalBalance,
            transactionCount: totalTransactionCount,
            countMonths: allMonths.size,
            countYears: allYears.size,
            countWeeks: allWeeks.size,
            avgIncomePerMonth:
                allMonths.size > 0 ? totalIncome / allMonths.size : 0,
            avgExpensePerMonth:
                allMonths.size > 0 ? totalExpense / allMonths.size : 0,
            avgBalancePerMonth:
                allMonths.size > 0 ? totalBalance / allMonths.size : 0,
            avgIncomePerYear:
                allYears.size > 0 ? totalIncome / allYears.size : 0,
            avgExpensePerYear:
                allYears.size > 0 ? totalExpense / allYears.size : 0,
            avgBalancePerYear:
                allYears.size > 0 ? totalBalance / allYears.size : 0,
            avgIncomePerWeek:
                allWeeks.size > 0 ? totalIncome / allWeeks.size : 0,
            avgExpensePerWeek:
                allWeeks.size > 0 ? totalExpense / allWeeks.size : 0,
            avgBalancePerWeek:
                allWeeks.size > 0 ? totalBalance / allWeeks.size : 0,
            incomeTransactionCount: totalIncomeTransactionCount,
            expenseTransactionCount: totalExpenseTransactionCount,
            balanceBefore: overallBalanceBefore,
            balanceAfter: overallBalanceAfter,
        },
        daily,
        weekly,
        monthly,
        yearly,
    };
}

function calculatePeriodBalances(
    periodKeys: number[],
    accountBalancesMap: AccountBalanceMap,
    accountFirstTransaction: Map<string, Transaction>
) {
    const result = new Map<
        number,
        { balanceBefore: number; balanceAfter: number }
    >();
    const accountLastKnownBalance = new Map<string, number>();

    for (const [accountId, firstTransaction] of accountFirstTransaction) {
        accountLastKnownBalance.set(
            accountId,
            firstTransaction.balanceAfterTransaction - firstTransaction.amount
        );
    }

    for (const periodKey of periodKeys) {
        let totalBalanceBefore = 0;
        let totalBalanceAfter = 0;

        for (const accountId of accountBalancesMap.keys()) {
            const accountBalances = accountBalancesMap.get(accountId);
            const periodData = accountBalances?.get(periodKey);

            if (periodData) {
                const balanceBefore =
                    periodData.first.balanceAfterTransaction -
                    periodData.first.amount;
                const balanceAfter = periodData.last.balanceAfterTransaction;
                totalBalanceBefore += balanceBefore;
                totalBalanceAfter += balanceAfter;
                accountLastKnownBalance.set(accountId, balanceAfter);
            } else {
                const lastBalance = accountLastKnownBalance.get(accountId) ?? 0;
                totalBalanceBefore += lastBalance;
                totalBalanceAfter += lastBalance;
            }
        }

        result.set(periodKey, {
            balanceBefore: totalBalanceBefore,
            balanceAfter: totalBalanceAfter,
        });
    }

    return result;
}
