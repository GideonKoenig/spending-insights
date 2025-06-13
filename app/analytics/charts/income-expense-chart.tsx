"use client";

import {
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Line,
    ComposedChart,
} from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { Insights } from "@/lib/analytics-tools/grouping";
import { useGraph } from "@/contexts/graph/provider";
import { filterInsightsByTimeRange } from "@/lib/analytics-tools/filtering";
import { format } from "date-fns";
import {
    calculateIncomeExpenseYTicks,
    calculateXTicks,
    createLabelFormatter,
} from "@/app/analytics/charts/utils";

const chartConfig = {
    income: {
        label: "Income",
        color: "var(--positive)",
    },
    expense: {
        label: "Expense",
        color: "var(--negative)",
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
                    incomeTrend: dailyData.income,
                    expenseTrend: -dailyData.expense,
                    fullDate: dailyData.date,
                }));
            case "weekly":
                return filteredInsights.weekly.map((weekData) => ({
                    date: `W${weekData.week}/${String(weekData.year).slice(
                        -2
                    )}`,
                    income: weekData.income,
                    expense: -weekData.expense,
                    incomeTrend: weekData.income,
                    expenseTrend: -weekData.expense,
                    fullDate: weekData.weekStartDate,
                }));
            case "monthly":
                return filteredInsights.monthly.map((monthData) => ({
                    date: `${monthData.month.name.slice(0, 3)} ${
                        monthData.year
                    }`,
                    income: monthData.income,
                    expense: -monthData.expense,
                    incomeTrend: monthData.income,
                    expenseTrend: -monthData.expense,
                    fullDate: new Date(monthData.year, monthData.month.id),
                }));
            case "yearly":
                return filteredInsights.yearly.map((yearData) => ({
                    date: String(yearData.year),
                    income: yearData.income,
                    expense: -yearData.expense,
                    incomeTrend: yearData.income,
                    expenseTrend: -yearData.expense,
                    fullDate: new Date(yearData.year, 0),
                }));
        }
    };

    const chartData = getChartData();

    if (chartData.length === 0) {
        return (
            <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                No data available for the selected time range
            </div>
        );
    }

    const yTicks = calculateIncomeExpenseYTicks(chartData);
    const xTickData = calculateXTicks(chartData);

    return (
        <ChartContainer config={chartConfig} className="w-full">
            <ComposedChart data={chartData} barGap={-25}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="fullDate"
                    type="number"
                    scale="time"
                    domain={["dataMin", "dataMax"]}
                    ticks={xTickData.map((tick) => tick.timestamp)}
                    tickLine={false}
                    axisLine={false}
                    padding={{ left: 50, right: 50 }}
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
                    tickFormatter={(value) =>
                        Math.abs(Math.round(value)).toLocaleString("de-DE")
                    }
                />
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            labelFormatter={createLabelFormatter(
                                graphContext.settings.aggregation
                            )}
                            formatter={(value, name) => {
                                if (name.toString().includes("Trend"))
                                    return null;
                                const absValue = Math.round(
                                    Math.abs(Number(value))
                                );
                                const label =
                                    name === "income" ? "Income" : "Expense";
                                return [
                                    `${absValue.toLocaleString("de-DE")} EUR `,
                                    label,
                                ];
                            }}
                        />
                    }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                    dataKey="income"
                    fill={chartConfig.income.color}
                    radius={[2, 2, 0, 0]}
                    barSize={25}
                />
                <Bar
                    dataKey="expense"
                    fill={chartConfig.expense.color}
                    radius={[2, 2, 0, 0]}
                    barSize={25}
                />
                <Line
                    type="monotone"
                    dataKey="incomeTrend"
                    stroke={chartConfig.income.color}
                    strokeWidth={2}
                    dot={true}
                    strokeDasharray="5 5"
                    legendType="none"
                />
                <Line
                    type="monotone"
                    dataKey="expenseTrend"
                    stroke={chartConfig.expense.color}
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 5"
                    legendType="none"
                />
            </ComposedChart>
        </ChartContainer>
    );
}
