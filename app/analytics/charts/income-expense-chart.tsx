"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { CardContent } from "@/components/ui/card";
import { Insights } from "@/lib/analytics-tools/grouping";
import { useGraph } from "@/contexts/graph/provider";
import { filterInsightsByTimeRange } from "@/lib/analytics-tools/filtering";
import { format } from "date-fns";

const chartConfig = {
    income: {
        label: "Income",
        color: "hsl(var(--chart-2))",
    },
    expense: {
        label: "Expense",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig;

export function IncomeExpenseChart(props: { insights: Insights }) {
    const graphContext = useGraph();
    const filteredInsights = filterInsightsByTimeRange(
        props.insights,
        graphContext.settings.timeRange
    );

    const getChartData = () => {
        switch (graphContext.settings.aggregation) {
            case "daily":
                return filteredInsights.daily.map((dailyData) => ({
                    date: format(dailyData.date, "dd MMM"),
                    income: dailyData.income,
                    expense: -dailyData.expense,
                    fullDate: dailyData.date,
                }));
            case "monthly":
                return filteredInsights.monthly.map((monthData) => ({
                    date: `${monthData.month.name.slice(0, 3)} ${
                        monthData.year
                    }`,
                    income: monthData.income,
                    expense: -monthData.expense,
                    fullDate: new Date(monthData.year, monthData.month.id),
                }));
            case "yearly":
                return filteredInsights.yearly.map((yearData) => ({
                    date: String(yearData.year),
                    income: yearData.income,
                    expense: -yearData.expense,
                    fullDate: new Date(yearData.year, 0),
                }));
        }
    };

    const chartData = getChartData();

    if (chartData.length === 0) {
        return (
            <>
                <CardContent>
                    <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                        No data available for the selected time range
                    </div>
                </CardContent>
            </>
        );
    }

    const maxValue = Math.max(
        ...chartData.map((d) => Math.max(d.income, Math.abs(d.expense)))
    );
    const yTicks = Array.from(
        { length: 9 },
        (_, i) => -maxValue + (i * 2 * maxValue) / 8
    );

    return (
        <>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="min-h-[400px] w-full"
                >
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => {
                                if (
                                    graphContext.settings.aggregation ===
                                        "daily" &&
                                    chartData.length > 30
                                ) {
                                    const index = chartData.findIndex(
                                        (d) => d.date === value
                                    );
                                    return index %
                                        Math.ceil(chartData.length / 10) ===
                                        0
                                        ? value
                                        : "";
                                }
                                return value;
                            }}
                        />
                        <YAxis
                            ticks={yTicks}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) =>
                                Math.abs(Math.round(value)).toLocaleString(
                                    "de-DE"
                                )
                            }
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value, payload) => {
                                        if (
                                            payload &&
                                            payload[0] &&
                                            payload[0].payload
                                        ) {
                                            const formatStr =
                                                graphContext.settings
                                                    .aggregation === "yearly"
                                                    ? "yyyy"
                                                    : graphContext.settings
                                                          .aggregation ===
                                                      "monthly"
                                                    ? "MMMM yyyy"
                                                    : "dd MMM yyyy";
                                            return format(
                                                payload[0].payload.fullDate,
                                                formatStr
                                            );
                                        }
                                        return value;
                                    }}
                                    formatter={(value) => [
                                        Math.abs(
                                            Math.round(Number(value))
                                        ).toLocaleString("de-DE") + " EUR",
                                        "",
                                    ]}
                                />
                            }
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="income" fill="var(--color-income)" />
                        <Bar dataKey="expense" fill="var(--color-expense)" />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </>
    );
}
