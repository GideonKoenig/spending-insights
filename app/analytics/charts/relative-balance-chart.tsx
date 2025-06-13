"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Insights } from "@/lib/analytics-tools/grouping";
import { formatDate } from "@/lib/analytics-tools/utilts";
import { filterInsightsByTimeRange } from "@/lib/analytics-tools/filtering";
import { format } from "date-fns";
import { useGraph } from "@/contexts/graph/provider";
import {
    calculateRelativeYTicks,
    calculateXTicks,
    createLabelFormatter,
} from "@/app/analytics/charts/utils";

const chartConfig = {
    balance: {
        label: "Balance",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

export function RelativeBalanceChart(props: { insights: Insights }) {
    const graphContext = useGraph();
    const filteredInsights = filterInsightsByTimeRange(
        props.insights,
        graphContext.settings.timeRange
    );

    const getChartData = () => {
        let baseData;
        switch (graphContext.settings.aggregation) {
            case "daily":
                baseData = filteredInsights.daily.map((dailyData) => ({
                    date: formatDate(dailyData.date),
                    balance: dailyData.balanceAfter,
                    fullDate: dailyData.date,
                }));
                break;
            case "weekly":
                baseData = filteredInsights.weekly.map((weekData) => ({
                    date: `Week ${weekData.week}/${weekData.year}`,
                    balance: weekData.balanceAfter,
                    fullDate: weekData.weekStartDate,
                }));
                break;
            case "monthly":
                baseData = filteredInsights.monthly.map((monthData) => ({
                    date: `${monthData.month.name} ${monthData.year}`,
                    balance: monthData.balanceAfter,
                    fullDate: new Date(monthData.year, monthData.month.id),
                }));
                break;
            case "yearly":
                baseData = filteredInsights.yearly.map((yearData) => ({
                    date: String(yearData.year),
                    balance: yearData.balanceAfter,
                    fullDate: new Date(yearData.year, 0),
                }));
                break;
        }

        if (baseData.length === 0) return [];

        const startingBalance = baseData[0].balance;
        return baseData.map((item) => ({
            ...item,
            relativeBalance: item.balance - startingBalance,
            absoluteBalance: item.balance,
        }));
    };

    const chartData = getChartData();

    if (chartData.length === 0) {
        return (
            <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                No data available for the selected time range
            </div>
        );
    }

    const yTicks = calculateRelativeYTicks(chartData);
    const xTickData = calculateXTicks(chartData);

    return (
        <ChartContainer config={chartConfig} className="w-full">
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="fullDate"
                    type="number"
                    scale="time"
                    domain={["dataMin", "dataMax"]}
                    ticks={xTickData.map((tick) => tick.timestamp)}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => {
                        const tick = xTickData.find(
                            (t) => t.timestamp === value
                        );
                        return tick
                            ? tick.label
                            : format(new Date(value), "dd MMM");
                    }}
                />
                <YAxis
                    ticks={yTicks}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => {
                        const sign = value >= 0 ? "+" : "";
                        return `${sign}${Math.round(value).toLocaleString(
                            "de-DE"
                        )}`;
                    }}
                />
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            labelFormatter={createLabelFormatter(
                                graphContext.settings.aggregation
                            )}
                            formatter={(value, name, props) => {
                                const relativeValue = Number(value);
                                const absoluteValue =
                                    props.payload.absoluteBalance;
                                const sign = relativeValue >= 0 ? "+" : "";
                                const colorClass =
                                    relativeValue >= 0
                                        ? "text-positive"
                                        : "text-negative";

                                return [
                                    <p key="balance-tooltip">
                                        {Math.round(
                                            absoluteValue
                                        ).toLocaleString("de-DE")}{" "}
                                        EUR{" "}
                                        <span className={colorClass}>
                                            ({sign}
                                            {Math.round(
                                                relativeValue
                                            ).toLocaleString("de-DE")}{" "}
                                            EUR)
                                        </span>
                                    </p>,
                                    "",
                                ];
                            }}
                        />
                    }
                />
                <Line
                    dataKey="relativeBalance"
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
    );
}
