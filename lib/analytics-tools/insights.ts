import { Month } from "@/lib/analytics-tools/types";
import { getMonthById } from "@/lib/analytics-tools/utilts";
import { Transaction, Account } from "@/lib/types";

export type Insights = {
    overall: {
        income: number;
        expense: number;
        balance: number;
        countMonths: number;
        countYears: number;
        avgIncomePerMonth: number;
        avgExpensePerMonth: number;
        avgIncomePerYear: number;
        avgExpensePerYear: number;
        transactionCount: number;
        incomeTransactionCount: number;
        expenseTransactionCount: number;
    };
    monthly: {
        month: Month;
        year: number;
        income: number;
        expense: number;
        balance: number;
        transactionCount: number;
        incomeTransactionCount: number;
        expenseTransactionCount: number;
    }[];
    yearly: {
        year: number;
        income: number;
        expense: number;
        balance: number;
        transactionCount: number;
        incomeTransactionCount: number;
        expenseTransactionCount: number;
    }[];
};

export function getInsights(accounts: Account[]): Insights {
    // Combined statistics
    let totalIncome = 0;
    let totalExpense = 0;
    let totalTransactionCount = 0;
    let totalIncomeTransactionCount = 0;
    let totalExpenseTransactionCount = 0;
    const allYears = new Set<number>();
    const allMonths = new Set<string>();

    // Aggregation maps
    const monthlyMap = new Map<
        string,
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

    for (const account of accounts) {
        totalTransactionCount += account.transactions.length;

        for (const transaction of account.transactions) {
            if (transaction.tag?.ignore) continue;
            const date = transaction.bookingDate;
            const amount = Math.abs(transaction.amount);
            const isIncome = transaction.amount > 0;

            // Overall statistics
            totalIncome += isIncome ? amount : 0;
            totalExpense += isIncome ? 0 : amount;
            totalIncomeTransactionCount += isIncome ? 1 : 0;
            totalExpenseTransactionCount += isIncome ? 0 : 1;
            allYears.add(date.getFullYear());
            allMonths.add(`${date.getFullYear()}-${date.getMonth()}`);

            // Monthly aggregation
            const month = getMonthById(date.getMonth())!;
            const year = date.getFullYear();
            const monthKey = `${year}-${month.id}`;

            if (!monthlyMap.has(monthKey)) {
                monthlyMap.set(monthKey, {
                    month,
                    year,
                    income: 0,
                    expense: 0,
                    balance: 0,
                    transactionCount: 0,
                    incomeTransactionCount: 0,
                    expenseTransactionCount: 0,
                });
            }
            const monthData = monthlyMap.get(monthKey)!;
            monthData.income += isIncome ? amount : 0;
            monthData.expense += isIncome ? 0 : amount;
            monthData.balance = monthData.income - monthData.expense;
            monthData.transactionCount += 1;
            monthData.incomeTransactionCount += isIncome ? 1 : 0;
            monthData.expenseTransactionCount += isIncome ? 0 : 1;

            // Yearly aggregation
            if (!yearlyMap.has(year)) {
                yearlyMap.set(year, {
                    year,
                    income: 0,
                    expense: 0,
                    balance: 0,
                    transactionCount: 0,
                    incomeTransactionCount: 0,
                    expenseTransactionCount: 0,
                });
            }
            const yearData = yearlyMap.get(year)!;
            yearData.income += isIncome ? amount : 0;
            yearData.expense += isIncome ? 0 : amount;
            yearData.balance = yearData.income - yearData.expense;
            yearData.transactionCount += 1;
            yearData.incomeTransactionCount += isIncome ? 1 : 0;
            yearData.expenseTransactionCount += isIncome ? 0 : 1;
        }
    }

    // Sort results
    const monthly = Array.from(monthlyMap.values()).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month.id - b.month.id;
    });
    const yearly = Array.from(yearlyMap.values()).sort(
        (a, b) => a.year - b.year
    );

    return {
        overall: {
            income: totalIncome,
            expense: totalExpense,
            balance: totalIncome - totalExpense,
            transactionCount: totalTransactionCount,
            countMonths: allMonths.size,
            countYears: allYears.size,
            avgIncomePerMonth:
                allMonths.size > 0 ? totalIncome / allMonths.size : 0,
            avgExpensePerMonth:
                allMonths.size > 0 ? totalExpense / allMonths.size : 0,
            avgIncomePerYear:
                allYears.size > 0 ? totalIncome / allYears.size : 0,
            avgExpensePerYear:
                allYears.size > 0 ? totalExpense / allYears.size : 0,
            incomeTransactionCount: totalIncomeTransactionCount,
            expenseTransactionCount: totalExpenseTransactionCount,
        },
        monthly,
        yearly,
    };
}
