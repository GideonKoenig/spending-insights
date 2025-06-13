"use client";

import { Insights } from "@/lib/analytics-tools/grouping";
import { AnalyticsCardSummary } from "@/components/analytics/analytics-card-summary";
import { AnalyticsCardGeneral } from "@/components/analytics/analytics-card-general";
import { BarChart3, Calendar, Hash, Target } from "lucide-react";
import { formatEuro } from "@/lib/utils";

export function DashboardTab(props: { insights: Insights }) {
    const { overall, monthly, yearly } = props.insights;

    const monthlySummaries = monthly.map((monthData) => ({
        title: `${monthData.month.name} ${monthData.year}`,
        income: monthData.income,
        expense: monthData.expense,
        average: overall.avgBalancePerMonth,
    }));

    const yearlySummaries = yearly.map((yearData) => ({
        title: String(yearData.year),
        income: yearData.income,
        expense: yearData.expense,
        average: overall.avgBalancePerYear,
    }));

    const balanceLast12Months =
        monthly.length > 0
            ? monthly
                  .slice(-12)
                  .reduce((sum, month) => sum + month.balance, 0) /
              Math.min(monthly.length, 12)
            : 0;
    const avgYearlyBalance = overall.avgBalancePerYear;
    const transactionsPerMonth = Math.round(
        overall.transactionCount / overall.countMonths
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-4">
                <AnalyticsCardGeneral
                    title="Total Overview"
                    icon={<BarChart3 />}
                >
                    <div className="grid grid-cols-[4.25rem_auto] gap-2 text-sm text-muted-foreground">
                        <p>Income:</p>
                        <p className="text-right text-positive">
                            {formatEuro(overall.income)}
                        </p>
                        <p>Expenses:</p>
                        <p className="text-right text-negative">
                            {formatEuro(-overall.expense)}
                        </p>
                        <div className="border-t border-border col-span-2" />
                        <p>Net:</p>
                        <p
                            className={`text-right ${
                                overall.balance >= 0
                                    ? "text-positive"
                                    : "text-negative"
                            }`}
                        >
                            {formatEuro(overall.balance)}
                        </p>
                    </div>
                </AnalyticsCardGeneral>

                <AnalyticsCardGeneral title="Transaction Count" icon={<Hash />}>
                    <p className="text-xl font-bold">
                        {overall.transactionCount}
                    </p>
                    <p className="text-xs mb-1 text-muted-foreground">
                        {`${overall.incomeTransactionCount} income, ${overall.expenseTransactionCount} expenses`}
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
                        Based on {overall.countYears} year
                        {overall.countYears !== 1 ? "s" : ""}
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
                        Based on {overall.countMonths} months
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
        </div>
    );
}
