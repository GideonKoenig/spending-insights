"use client";

import { useData } from "@/contexts/data-provider";
import { FileSelector } from "@/components/file-selector";
import { AnalyticsCardSummary } from "@/components/analytics-card-summary";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "lucide-react";
import { summarize } from "@/app/analytics/utilts";
import { AnalyticsHeader } from "@/app/analytics/header";
import { BalanceChart } from "@/app/analytics/balance-chart";

export default function AnalyticsPage() {
    const dataResult = useData();

    if (!dataResult.success) {
        return (
            <p className="p-4 text-destructive">
                Unexpected state: DataProvider not found
            </p>
        );
    }

    const { needsFileHandle, needsPermission, loading, transactions } =
        dataResult.value;
    if (needsFileHandle || needsPermission || loading) {
        return <FileSelector />;
    }

    const monthSummaries = summarize(transactions, "monthly").sort(
        (a, b) => new Date(b.title).getTime() - new Date(a.title).getTime()
    );
    const yearSummaries = summarize(transactions, "yearly").sort(
        (a, b) => new Date(b.title).getTime() - new Date(a.title).getTime()
    );

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
                <AnalyticsHeader transactions={transactions} />

                {/* Months Row */}
                <div className="grid grid-cols-3 gap-4">
                    {monthSummaries
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
                    {yearSummaries
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

                <BalanceChart transactions={transactions} />
            </div>
        </ScrollArea>
    );
}
