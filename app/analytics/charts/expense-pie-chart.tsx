"use client";

import { Pie, PieChart, Cell } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
} from "@/components/ui/chart";
import {
    CategoryStats,
    getCategoryInsights,
} from "@/lib/analytics-tools/grouping-category";
import { sortCategoryInsights } from "@/lib/analytics-tools/sortings";
import { generateCategoryColor } from "@/lib/tag-rule-engine/utils";
import { useGraph } from "@/contexts/graph/provider";
import { filterAccountsByTimeRange } from "@/lib/analytics-tools/filtering";
import { Account } from "@/lib/types";
import { Fragment } from "react";
import {
    differenceInDays,
    differenceInMonths,
    differenceInWeeks,
    differenceInYears,
} from "date-fns";
import { getDateRange } from "@/lib/operations-account";

export function ExpensePieChart(props: { accounts: Account[] }) {
    const graphContext = useGraph();
    const filteredAccounts = filterAccountsByTimeRange(
        props.accounts,
        graphContext.settings.timeRange
    );

    const insights = sortCategoryInsights(
        getCategoryInsights(filteredAccounts)
    );

    const granularize = (value: number) => {
        const { granularity } = graphContext.settings;
        const { start, end } = getDateRange(filteredAccounts);

        const days = differenceInDays(end, start) + 1;
        const weeks = differenceInWeeks(end, start) + 1;
        const months = differenceInMonths(end, start) + 1;
        const years = differenceInYears(end, start) + 1;

        switch (granularity) {
            case "day":
                return value / days;
            case "week":
                return value / weeks;
            case "month":
                return value / months;
            case "year":
                return value / years;
            default:
                return value;
        }
    };

    const getChartData = () => {
        return Array.from(insights.expense.entries()).map(([name, stats]) => ({
            name,
            value: granularize(stats.amount),
            stats,
        }));
    };

    const chartConfig = Array.from(insights.expense.keys()).reduce(
        (acc, name) => {
            acc[name] = {
                label: name,
                color: generateCategoryColor(name),
            };
            return acc;
        },
        {} as ChartConfig
    );

    if (insights.expense.size === 0) {
        return (
            <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                No expense data available for the selected time range
            </div>
        );
    }

    return (
        <ChartContainer config={chartConfig} className="w-full h-[500px]">
            <PieChart>
                <ChartTooltip
                    content={({ active, payload }) => {
                        if (!active || !payload || !payload[0]) return null;
                        const data = payload[0].payload;
                        const stats = data.stats as CategoryStats;

                        return (
                            <div className="rounded-lg border bg-background p-3 shadow-md">
                                <h2 className="mb-2 font-semibold text-lg">
                                    {`${data.name} - ${data.value.toFixed(
                                        2
                                    )} EUR (${(
                                        stats.ratioOfTotal * 100
                                    ).toFixed(1)}%)`}
                                </h2>

                                <div className="grid grid-cols-[10rem_4rem_auto] gap-1">
                                    {Array.from(
                                        stats.subcategories.entries()
                                    ).map(([subName, subStats]) => (
                                        <Fragment key={subName}>
                                            <p>{subName}</p>
                                            <p>
                                                {(
                                                    subStats.ratioOfTotal * 100
                                                ).toFixed(2)}
                                                %
                                            </p>
                                            <p>
                                                {granularize(
                                                    subStats.amount
                                                ).toLocaleString("de-DE", {
                                                    style: "currency",
                                                    currency: "EUR",
                                                })}
                                            </p>
                                        </Fragment>
                                    ))}
                                </div>
                            </div>
                        );
                    }}
                />
                <Pie
                    data={getChartData()}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={180}
                    animationDuration={400}
                >
                    {Object.keys(chartConfig).map((key, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={chartConfig[key].color}
                        />
                    ))}
                </Pie>
            </PieChart>
        </ChartContainer>
    );
}
