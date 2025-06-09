"use client";

import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
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

const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
];

export function ExpensePieChart(props: { insights: Insights }) {
    const graphContext = useGraph();
    const filteredInsights = filterInsightsByTimeRange(
        props.insights,
        graphContext.settings.timeRange
    );

    // Mock data for expense categories
    // In a real implementation, this would come from categorized transaction data
    const mockExpenseData = [
        { name: "Housing", value: filteredInsights.overall.expense * 0.3 },
        { name: "Food", value: filteredInsights.overall.expense * 0.2 },
        {
            name: "Transportation",
            value: filteredInsights.overall.expense * 0.15,
        },
        {
            name: "Entertainment",
            value: filteredInsights.overall.expense * 0.1,
        },
        { name: "Utilities", value: filteredInsights.overall.expense * 0.1 },
        { name: "Other", value: filteredInsights.overall.expense * 0.15 },
    ].filter((item) => item.value > 0);

    const chartConfig = mockExpenseData.reduce((acc, item, index) => {
        acc[item.name.toLowerCase()] = {
            label: item.name,
            color: colors[index % colors.length],
        };
        return acc;
    }, {} as ChartConfig);

    if (
        mockExpenseData.length === 0 ||
        filteredInsights.overall.expense === 0
    ) {
        return (
            <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                No expense data available for the selected time range
            </div>
        );
    }

    const total = mockExpenseData.reduce((sum, item) => sum + item.value, 0);

    return (
        <>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="min-h-[400px] w-full"
                >
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        formatter={(value) => [
                                            `${Math.round(
                                                Number(value)
                                            ).toLocaleString(
                                                "de-DE"
                                            )} EUR (${Math.round(
                                                (Number(value) / total) * 100
                                            )}%)`,
                                            "",
                                        ]}
                                    />
                                }
                            />
                            <Pie
                                data={mockExpenseData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                    `${name} ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {mockExpenseData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={`var(--color-${entry.name.toLowerCase()})`}
                                    />
                                ))}
                            </Pie>
                            <ChartLegend
                                content={<ChartLegendContent />}
                                className="flex-wrap"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </>
    );
}
