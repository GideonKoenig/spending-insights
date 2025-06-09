"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { CardContent } from "@/components/ui/card";
import { Insights } from "@/lib/analytics-tools/grouping";
import { formatDate } from "@/lib/analytics-tools/utilts";
import { filterInsightsByTimeRange } from "@/lib/analytics-tools/filtering";
import { format } from "date-fns";
import { useGraph } from "@/contexts/graph/provider";

const chartConfig = {
    balance: {
        label: "Balance",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

export function BalanceChart(props: { insights: Insights }) {
    const graphContext = useGraph();
    const filteredInsights = filterInsightsByTimeRange(
        props.insights,
        graphContext.settings.timeRange
    );

    const getChartData = () => {
        switch (graphContext.settings.aggregation) {
            case "daily":
                return filteredInsights.daily.map((dailyData) => ({
                    date: formatDate(dailyData.date),
                    balance: dailyData.balanceAfter,
                    fullDate: dailyData.date,
                }));
            case "monthly":
                return filteredInsights.monthly.map((monthData) => ({
                    date: `${monthData.month.name} ${monthData.year}`,
                    balance: monthData.balanceAfter,
                    fullDate: new Date(monthData.year, monthData.month.id),
                }));
            case "yearly":
                return filteredInsights.yearly.map((yearData) => ({
                    date: String(yearData.year),
                    balance: yearData.balanceAfter,
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

    const maxBalance = Math.max(...chartData.map((d) => d.balance));
    const minBalance = Math.min(...chartData.map((d) => d.balance));
    const yRange = maxBalance - minBalance;
    const yPadding = yRange * 0.1;

    const yTicks = Array.from(
        { length: 6 },
        (_, i) => minBalance - yPadding + (i * (yRange + 2 * yPadding)) / 5
    );

    return (
        <>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="min-h-[400px] w-full"
                >
                    <LineChart data={chartData}>
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
                                Math.round(value).toLocaleString("de-DE")
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
                                        Math.round(
                                            Number(value)
                                        ).toLocaleString("de-DE") + " EUR",
                                        "",
                                    ]}
                                />
                            }
                        />
                        <Line
                            dataKey="balance"
                            type="monotone"
                            stroke="var(--color-balance)"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                                r: 4,
                                stroke: "var(--color-balance)",
                                strokeWidth: 2,
                                fill: "var(--background)",
                            }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </>
    );
}
