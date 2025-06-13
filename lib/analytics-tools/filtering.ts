import { Insights } from "./grouping";
import {
    getDateRangeFromTimeRange,
    TimeRange,
} from "@/components/analytics/selector-time-range";
import { Account } from "@/lib/types";

export function filterInsightsByTimeRange(
    insights: Insights,
    timeRange: TimeRange
) {
    const { start, end } = getDateRangeFromTimeRange(timeRange);

    const filteredDaily = insights.daily.filter(
        (day) => day.date >= start && day.date <= end
    );

    const filteredWeekly = insights.weekly.filter(
        (week) => week.weekStartDate <= end && week.weekEndDate >= start
    );

    const filteredMonthly = insights.monthly.filter((month) => {
        const monthDate = new Date(month.year, month.month.id);
        return monthDate >= start && monthDate <= end;
    });

    const filteredYearly = insights.yearly.filter(
        (year) =>
            year.year >= start.getFullYear() && year.year <= end.getFullYear()
    );

    const recalculateOverall = () => {
        let income = 0;
        let expense = 0;
        let transactionCount = 0;
        let incomeTransactionCount = 0;
        let expenseTransactionCount = 0;

        filteredDaily.forEach((day) => {
            income += day.income;
            expense += day.expense;
            transactionCount += day.transactionCount;
            incomeTransactionCount += day.incomeTransactionCount;
            expenseTransactionCount += day.expenseTransactionCount;
        });

        const balance = income - expense;
        const countMonths = filteredMonthly.length;
        const countYears = filteredYearly.length;
        const countWeeks = filteredWeekly.length;

        return {
            income,
            expense,
            balance,
            transactionCount,
            incomeTransactionCount,
            expenseTransactionCount,
            countMonths,
            countYears,
            countWeeks,
            avgIncomePerMonth: countMonths > 0 ? income / countMonths : 0,
            avgExpensePerMonth: countMonths > 0 ? expense / countMonths : 0,
            avgBalancePerMonth: countMonths > 0 ? balance / countMonths : 0,
            avgIncomePerYear: countYears > 0 ? income / countYears : 0,
            avgExpensePerYear: countYears > 0 ? expense / countYears : 0,
            avgBalancePerYear: countYears > 0 ? balance / countYears : 0,
            avgIncomePerWeek: countWeeks > 0 ? income / countWeeks : 0,
            avgExpensePerWeek: countWeeks > 0 ? expense / countWeeks : 0,
            avgBalancePerWeek: countWeeks > 0 ? balance / countWeeks : 0,
            balanceBefore:
                filteredDaily.length > 0 ? filteredDaily[0].balanceBefore : 0,
            balanceAfter:
                filteredDaily.length > 0
                    ? filteredDaily[filteredDaily.length - 1].balanceAfter
                    : 0,
        };
    };

    return {
        overall: recalculateOverall(),
        daily: filteredDaily,
        weekly: filteredWeekly,
        monthly: filteredMonthly,
        yearly: filteredYearly,
    };
}

export function filterAccountsByTimeRange(
    accounts: Account[],
    timeRange: TimeRange
) {
    const { start, end } = getDateRangeFromTimeRange(timeRange);
    const result: Account[] = [];

    for (const account of accounts) {
        const filteredTransactions = [];
        for (const transaction of account.transactions) {
            const date = transaction.bookingDate;
            if (date >= start && date <= end) {
                filteredTransactions.push(transaction);
            }
        }
        result.push({
            ...account,
            transactions: filteredTransactions,
        });
    }
    return result;
}
