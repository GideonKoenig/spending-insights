"use client";

import { AnalyticsCardSummary } from "@/components/analytics/analytics-card-summary";
import { AnalyticsCardGeneral } from "@/components/analytics/analytics-card-general";
import { Calendar, BarChart3, Hash, Target } from "lucide-react";
import { Insights } from "@/lib/analytics-tools/insights";
import { formatEuro } from "@/lib/utils";

export function AnalyticsInsights(props: { insights: Insights }) {
    const allMonthly = props.insights.monthly;
    const allYearly = props.insights.yearly;
    const totalBalance = props.insights.overall.balance;

    const monthlySummaries = allMonthly.map((monthly) => ({
        title: `${monthly.month.name} ${monthly.year}`,
        income: monthly.income,
        expense: monthly.expense,
        average: totalBalance / (allMonthly.length || 1),
    }));

    const yearlySummaries = allYearly.map((yearly) => ({
        title: String(yearly.year),
        income: yearly.income,
        expense: yearly.expense,
        average: totalBalance / (allYearly.length || 1),
    }));

    const totalIncome = props.insights.overall.income;
    const totalExpense = props.insights.overall.expense;
    const totalTransactions = props.insights.overall.transactionCount;
    const incomeTransactions = props.insights.overall.incomeTransactionCount;
    const expenseTransactions = props.insights.overall.expenseTransactionCount;

    const balanceLast12Months =
        monthlySummaries
            .slice(0, 12)
            .reduce((sum, month) => sum + month.income - month.expense, 0) / 12;

    const avgYearlyBalance =
        yearlySummaries.reduce(
            (sum, year) => sum + year.income - year.expense,
            0
        ) / yearlySummaries.length;

    const transactionsPerMonth =
        props.insights.overall.countMonths > 0
            ? Math.round(totalTransactions / props.insights.overall.countMonths)
            : 0;

    return (
        <>
            <div className="grid grid-cols-4 gap-4">
                <AnalyticsCardGeneral
                    title="Total Overview"
                    icon={<BarChart3 />}
                >
                    <div className="grid grid-cols-[4.25rem_auto] gap-2 text-sm text-muted-foreground">
                        <p>Income:</p>
                        <p className="text-right text-positive">
                            {formatEuro(totalIncome)}
                        </p>
                        <p>Expenses:</p>
                        <p className="text-right text-negative">
                            {formatEuro(-totalExpense)}
                        </p>
                        <div className="border-t border-border col-span-2" />
                        <p>Net:</p>
                        <p
                            className={`text-right ${
                                totalIncome - totalExpense >= 0
                                    ? "text-positive"
                                    : "text-negative"
                            }`}
                        >
                            {formatEuro(totalIncome - totalExpense)}
                        </p>
                    </div>
                </AnalyticsCardGeneral>

                <AnalyticsCardGeneral title="Transaction Count" icon={<Hash />}>
                    <p className="text-xl font-bold">{totalTransactions}</p>
                    <p className="text-xs mb-1 text-muted-foreground">
                        {`${incomeTransactions} income, ${expenseTransactions} expenses`}
                    </p>
                    <p className="text-xl font-bold">{transactionsPerMonth}</p>
                    <p className="text-xs text-muted-foreground">
                        Average transactions per month
                    </p>
                </AnalyticsCardGeneral>

                <AnalyticsCardGeneral
                    title="Avg Yearly Balance"
                    icon={<Target />}
                >
                    <div
                        className={`text-2xl font-bold ${
                            avgYearlyBalance >= 0
                                ? "text-positive"
                                : "text-negative"
                        }`}
                    >
                        {formatEuro(avgYearlyBalance)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Based on {yearlySummaries.length} year
                        {yearlySummaries.length !== 1 ? "s" : ""}
                    </p>
                </AnalyticsCardGeneral>

                <AnalyticsCardGeneral
                    title="Avg Monthly Balance"
                    icon={<Target />}
                >
                    <div
                        className={`text-2xl font-bold ${
                            balanceLast12Months >= 0
                                ? "text-positive"
                                : "text-negative"
                        }`}
                    >
                        {formatEuro(balanceLast12Months)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Based on last 12 months
                    </p>
                </AnalyticsCardGeneral>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {Array.from(
                    { length: 3 - Math.min(monthlySummaries.length, 3) },
                    (_, i) => (
                        <div key={`empty-month-${i}`} />
                    )
                )}
                {monthlySummaries.slice(-3).map((month) => (
                    <AnalyticsCardSummary
                        key={month.title}
                        summary={{
                            title: month.title,
                            income: month.income,
                            expense: month.expense,
                            average: month.average,
                        }}
                        icon={<Calendar />}
                    />
                ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
                {Array.from(
                    { length: 3 - Math.min(yearlySummaries.length, 3) },
                    (_, i) => (
                        <div key={`empty-year-${i}`} />
                    )
                )}
                {yearlySummaries.slice(-3).map((year) => (
                    <AnalyticsCardSummary
                        key={year.title}
                        summary={{
                            title: year.title,
                            income: year.income,
                            expense: year.expense,
                            average: year.average,
                        }}
                        icon={<Calendar />}
                    />
                ))}
            </div>
        </>
    );
}
