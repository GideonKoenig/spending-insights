"use client";

import { Sankey, Tooltip, ResponsiveContainer } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { CardContent } from "@/components/ui/card";
import { Insights } from "@/lib/analytics-tools/grouping";
import { useGraph } from "@/contexts/graph/provider";
import { filterInsightsByTimeRange } from "@/lib/analytics-tools/filtering";

const chartConfig = {
    income: {
        label: "Income",
        color: "var(--positive)",
    },
    expense: {
        label: "Expense",
        color: "var(--negative)",
    },
    savings: {
        label: "Savings",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig;

const CustomSankeyNode = (props: any) => {
    const { x, y, width, height, index, payload } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill="var(--chart-1)"
                fillOpacity={0.8}
                stroke="var(--border)"
                strokeWidth={1}
            />
            <text
                x={x < 200 ? x + width + 6 : x - 6}
                y={y + height / 2}
                textAnchor={x < 200 ? "start" : "end"}
                alignmentBaseline="middle"
                fontSize={11}
                fill="var(--foreground)"
                fontWeight={500}
            >
                {payload.name}
            </text>
        </g>
    );
};

export function SankeyDiagram(props: { insights: Insights }) {
    const graphContext = useGraph();
    const filteredInsights = filterInsightsByTimeRange(
        props.insights,
        graphContext.settings.timeRange
    );

    const totalIncome = filteredInsights.overall.income;
    const totalExpense = Math.abs(filteredInsights.overall.expense);
    const totalSavings = filteredInsights.overall.balance;

    const sankeyData = {
        nodes: [
            { name: "Salary" },
            { name: "Freelance" },
            { name: "Investments" },
            { name: "Total Income" },
            { name: "Housing" },
            { name: "Food" },
            { name: "Transportation" },
            { name: "Entertainment" },
            { name: "Utilities" },
            { name: "Other Expenses" },
            { name: "Savings" },
            { name: "Rent" },
            { name: "Maintenance" },
            { name: "Insurance" },
            { name: "Groceries" },
            { name: "Restaurants" },
            { name: "Delivery" },
            { name: "Gas" },
            { name: "Public Transport" },
            { name: "Car Maintenance" },
            { name: "Movies" },
            { name: "Sports" },
            { name: "Games" },
            { name: "Electricity" },
            { name: "Water" },
            { name: "Internet" },
            { name: "Healthcare" },
            { name: "Miscellaneous" },
            { name: "Shopping" },
            { name: "Emergency Fund" },
            { name: "Investment Portfolio" },
            { name: "Retirement" },
        ],
        links: [
            { source: 0, target: 3, value: totalIncome * 0.7 },
            { source: 1, target: 3, value: totalIncome * 0.2 },
            { source: 2, target: 3, value: totalIncome * 0.1 },
            { source: 3, target: 4, value: totalExpense * 0.3 },
            { source: 3, target: 5, value: totalExpense * 0.2 },
            { source: 3, target: 6, value: totalExpense * 0.15 },
            { source: 3, target: 7, value: totalExpense * 0.1 },
            { source: 3, target: 8, value: totalExpense * 0.1 },
            { source: 3, target: 9, value: totalExpense * 0.15 },
            { source: 3, target: 10, value: Math.max(0, totalSavings) },
            { source: 4, target: 11, value: totalExpense * 0.3 * 0.7 },
            { source: 4, target: 12, value: totalExpense * 0.3 * 0.2 },
            { source: 4, target: 13, value: totalExpense * 0.3 * 0.1 },
            { source: 5, target: 14, value: totalExpense * 0.2 * 0.5 },
            { source: 5, target: 15, value: totalExpense * 0.2 * 0.3 },
            { source: 5, target: 16, value: totalExpense * 0.2 * 0.2 },
            { source: 6, target: 17, value: totalExpense * 0.15 * 0.4 },
            { source: 6, target: 18, value: totalExpense * 0.15 * 0.4 },
            { source: 6, target: 19, value: totalExpense * 0.15 * 0.2 },
            { source: 7, target: 20, value: totalExpense * 0.1 * 0.4 },
            { source: 7, target: 21, value: totalExpense * 0.1 * 0.3 },
            { source: 7, target: 22, value: totalExpense * 0.1 * 0.3 },
            { source: 8, target: 23, value: totalExpense * 0.1 * 0.4 },
            { source: 8, target: 24, value: totalExpense * 0.1 * 0.3 },
            { source: 8, target: 25, value: totalExpense * 0.1 * 0.3 },
            { source: 9, target: 26, value: totalExpense * 0.15 * 0.4 },
            { source: 9, target: 27, value: totalExpense * 0.15 * 0.3 },
            { source: 9, target: 28, value: totalExpense * 0.15 * 0.3 },
            { source: 10, target: 29, value: Math.max(0, totalSavings) * 0.5 },
            { source: 10, target: 30, value: Math.max(0, totalSavings) * 0.3 },
            { source: 10, target: 31, value: Math.max(0, totalSavings) * 0.2 },
        ].filter((link) => link.value > 0),
    };

    if (totalIncome === 0) {
        return (
            <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                No data available for the selected time range
            </div>
        );
    }

    return (
        <>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="min-h-[400px] w-full"
                >
                    <ResponsiveContainer width="100%" height={400}>
                        <Sankey
                            data={sankeyData}
                            nodePadding={20}
                            nodeWidth={15}
                            margin={{
                                top: 20,
                                right: 120,
                                bottom: 20,
                                left: 120,
                            }}
                            link={{
                                stroke: "var(--muted-foreground)",
                                strokeOpacity: 0.3,
                            }}
                            node={<CustomSankeyNode />}
                        >
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (!active || !payload?.length)
                                        return null;

                                    const data = payload[0]?.payload;
                                    if (!data) return null;

                                    return (
                                        <div className="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
                                            <div className="font-medium">
                                                {data.name ||
                                                    `${data.source?.name} → ${data.target?.name}`}
                                            </div>
                                            {data.value && (
                                                <div className="text-muted-foreground">
                                                    {Math.round(
                                                        data.value
                                                    ).toLocaleString(
                                                        "de-DE"
                                                    )}{" "}
                                                    EUR
                                                </div>
                                            )}
                                        </div>
                                    );
                                }}
                            />
                        </Sankey>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </>
    );
}
