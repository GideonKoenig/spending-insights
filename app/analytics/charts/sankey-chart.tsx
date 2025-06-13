"use client";

import { Sankey } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { useGraph } from "@/contexts/graph/provider";
import { filterAccountsByTimeRange } from "@/lib/analytics-tools/filtering";
import {
    CategoryInsights,
    getCategoryInsights,
} from "@/lib/analytics-tools/grouping-category";
import { sortCategoryInsights } from "@/lib/analytics-tools/sortings";
import { generateCategoryColor } from "@/lib/tag-rule-engine/utils";
import { Account } from "@/lib/types";
import {
    differenceInDays,
    differenceInMonths,
    differenceInWeeks,
    differenceInYears,
} from "date-fns";
import { getDateRange } from "@/lib/operations-account";

const CustomSankeyNode = (props: unknown) => {
    const { x, y, width, height, payload } = props as {
        x: number;
        y: number;
        width: number;
        height: number;
        payload: { name: string };
    };
    const name = payload.name.toLowerCase();
    const labelOnLeft =
        name.startsWith("income:") ||
        name === "total income" ||
        name === "deficit";

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
                strokeWidth={0}
            />
            <text
                x={labelOnLeft ? x - 6 : x + width + 6}
                y={y + height / 2}
                textAnchor={labelOnLeft ? "end" : "start"}
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

export function SankeyChart(props: { accounts: Account[] }) {
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

    const sankeyData = buildSankeyData(insights, granularize);

    const chartConfig = Array.from(insights.expense.keys()).reduce(
        (acc, name) => {
            acc[name] = {
                label: name,
                color: generateCategoryColor(name),
            };
            return acc;
        },
        {
            income: {
                label: "Income",
                color: "var(--positive)",
            },
            savings: {
                label: "Savings",
                color: "var(--chart-3)",
            },
        } as ChartConfig
    );

    if (sankeyData.nodes.length === 0) {
        return (
            <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                No data available for the selected time range
            </div>
        );
    }

    return (
        <ChartContainer config={chartConfig} className="w-full">
            <Sankey
                data={sankeyData}
                nodePadding={10}
                nodeWidth={20}
                margin={{
                    top: 0,
                    right: 120,
                    bottom: 10,
                    left: 120,
                }}
                link={{
                    stroke: "var(--muted-foreground)",
                    strokeOpacity: 0.3,
                }}
                node={<CustomSankeyNode />}
            />
        </ChartContainer>
    );
}

type SankeyNode = {
    id: number;
    name: string;
    isIncome: boolean;
};
type SankeyLink = {
    source: number;
    target: number;
    value: number;
};

const buildSankeyData = (
    insights: CategoryInsights,
    granularize: (value: number) => number
) => {
    let id = 0;
    const nodes: SankeyNode[] = [];
    const links: SankeyLink[] = [];
    const income = insights.income.entries().toArray();
    const expense = insights.expense.entries().toArray();

    const addNode = (name: string, isIncome: boolean) => {
        nodes.push({ id: id++, name, isIncome });
    };
    const getNode = (name: string, isIncome?: boolean) => {
        const node = nodes.find(
            (node) => node.name === name && node.isIncome === isIncome
        );
        if (!node) {
            console.error(`Node ${name} not found`);
            return null;
        }
        return node;
    };

    for (const [categoryName] of income) {
        addNode(categoryName, true);
    }
    for (const [categoryName] of expense) {
        addNode(categoryName, false);
    }

    if (insights.overall.balance < 0) {
        addNode("deficit", true);
    }
    if (insights.overall.balance > 0) {
        addNode("savings", false);
        addNode("giro-konto", false);
    }

    addNode("total-income", true);

    for (const [, categoryStats] of expense) {
        const subcategories = categoryStats.subcategories.entries().toArray();
        let isFirst = true;
        for (const [subName, subStats] of subcategories) {
            if (!isFirst && subStats.ratioOfTotal < 0.02) continue;
            addNode(subName, false);
            isFirst = false;
        }
    }

    // Create income category links
    for (const [categoryName, categoryStats] of income) {
        const categoryIndex = getNode(categoryName, true)!.id;
        const categoryValue = granularize(categoryStats.amount);
        links.push({
            source: categoryIndex,
            target: getNode("total-income", true)!.id,
            value: categoryValue,
        });
    }

    // Create deficit link
    if (insights.overall.balance < 0) {
        const deficitValue = granularize(Math.abs(insights.overall.balance));
        links.push({
            source: getNode("deficit", true)!.id,
            target: getNode("total-income", true)!.id,
            value: deficitValue,
        });
    }

    // Create savings links
    if (insights.overall.balance > 0) {
        const savingsValue = granularize(insights.overall.balance);
        links.push({
            source: getNode("total-income", true)!.id,
            target: getNode("savings", false)!.id,
            value: savingsValue,
        });
        links.push({
            source: getNode("savings", false)!.id,
            target: getNode("giro-konto", false)!.id,
            value: savingsValue,
        });
    }

    // Create expense category and subcategory links
    for (const [categoryName, categoryStats] of expense) {
        const categoryIndex = getNode(categoryName, false)!.id;
        const categoryValue = granularize(categoryStats.amount);

        links.push({
            source: getNode("total-income", true)!.id,
            target: categoryIndex,
            value: categoryValue,
        });

        let isFirst = true;
        for (const [
            subName,
            subStats,
        ] of categoryStats.subcategories.entries()) {
            if (!isFirst && subStats.ratioOfTotal < 0.02) continue;
            isFirst = false;
            const subIndex = getNode(subName, false)!.id;
            const subValue = granularize(subStats.amount);
            links.push({
                source: categoryIndex,
                target: subIndex,
                value: subValue,
            });
        }
    }

    return { nodes, links };
};
