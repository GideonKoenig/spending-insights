"use client";

import { useData } from "@/contexts/data/provider";
import { FileSelector } from "@/components/file-selector";
import { AnalyticsCardSummary } from "@/components/analytics-card-summary";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "lucide-react";
import { summarize } from "@/app/analytics/utilts";
import { AnalyticsHeader } from "@/app/analytics/header";
import { BalanceChart } from "@/app/analytics/balance-chart";
import { getActiveDatasets, getActiveTransactions } from "@/lib/utils";

export default function AnalyticsPage() {
    const {
        needsFileHandle,
        needsPermission,
        loading,
        datasets,
        activeDataset,
    } = useData();

    if (needsFileHandle || needsPermission || loading) {
        return <FileSelector />;
    }

    const activeDatasets = getActiveDatasets(datasets, activeDataset);
    const transactions = getActiveTransactions(datasets, activeDataset).sort(
        (a, b) =>
            new Date(a.bookingDate).getTime() -
            new Date(b.bookingDate).getTime()
    );
    const monthlySummaries = summarize(transactions, "monthly");
    const yearlySummaries = summarize(transactions, "yearly");

    return (
        <ScrollArea className="h-full">
            <div className="mx-auto flex flex-col gap-6 max-w-7xl px-4 py-8">
                <div>
                    <h1 className="text-3xl font-bold">Analytics</h1>
                    <p className="text-muted-foreground">
                        Overview of your transaction data and spending patterns
                    </p>
                </div>

                {/* Meta Information Row */}
                <AnalyticsHeader
                    transactions={transactions}
                    monthSummaries={monthlySummaries}
                    yearSummaries={yearlySummaries}
                />

                {/* Months Row */}
                <div className="grid grid-cols-3 gap-4">
                    {monthlySummaries
                        .slice(0, 3)
                        .reverse()
                        .map((month) => (
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

                {/* Years Row */}
                <div className="grid grid-cols-3 gap-4">
                    {yearlySummaries
                        .slice(0, 3)
                        .reverse()
                        .map((year) => (
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

                <BalanceChart datasets={activeDatasets} />
            </div>
        </ScrollArea>
    );
}
