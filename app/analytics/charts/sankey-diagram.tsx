"use client";

import { CardContent } from "@/components/ui/card";
import { Insights } from "@/lib/analytics-tools/grouping";
import { useGraph } from "@/contexts/graph/provider";
import { filterInsightsByTimeRange } from "@/lib/analytics-tools/filtering";

export function SankeyDiagram(props: { insights: Insights }) {
    const graphContext = useGraph();
    const filteredInsights = filterInsightsByTimeRange(
        props.insights,
        graphContext.settings.timeRange
    );

    const mockSankeyData = {
        nodes: [
            { name: "Income" },
            { name: "Salary" },
            { name: "Freelance" },
            { name: "Investments" },
            { name: "Total Budget" },
            { name: "Housing" },
            { name: "Food" },
            { name: "Transportation" },
            { name: "Entertainment" },
            { name: "Savings" },
            { name: "Other" },
        ],
        links: [
            {
                source: 1,
                target: 0,
                value: filteredInsights.overall.income * 0.7,
            },
            {
                source: 2,
                target: 0,
                value: filteredInsights.overall.income * 0.2,
            },
            {
                source: 3,
                target: 0,
                value: filteredInsights.overall.income * 0.1,
            },
            { source: 0, target: 4, value: filteredInsights.overall.income },
            {
                source: 4,
                target: 5,
                value: filteredInsights.overall.expense * 0.3,
            },
            {
                source: 4,
                target: 6,
                value: filteredInsights.overall.expense * 0.2,
            },
            {
                source: 4,
                target: 7,
                value: filteredInsights.overall.expense * 0.15,
            },
            {
                source: 4,
                target: 8,
                value: filteredInsights.overall.expense * 0.1,
            },
            { source: 4, target: 9, value: filteredInsights.overall.balance },
            {
                source: 4,
                target: 10,
                value: filteredInsights.overall.expense * 0.25,
            },
        ],
    };

    if (filteredInsights.overall.income === 0) {
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

    return (
        <>
            <CardContent>
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                    <div className="text-center">
                        <p className="text-lg mb-2">Sankey Diagram</p>
                        <p className="text-sm">
                            Income:{" "}
                            {Math.round(
                                filteredInsights.overall.income
                            ).toLocaleString("de-DE")}{" "}
                            EUR
                        </p>
                        <p className="text-sm">
                            Expenses:{" "}
                            {Math.round(
                                filteredInsights.overall.expense
                            ).toLocaleString("de-DE")}{" "}
                            EUR
                        </p>
                        <p className="text-sm">
                            Balance:{" "}
                            {Math.round(
                                filteredInsights.overall.balance
                            ).toLocaleString("de-DE")}{" "}
                            EUR
                        </p>
                        <p className="text-xs mt-4">
                            (Actual Sankey visualization would require
                            additional charting library)
                        </p>
                    </div>
                </div>
            </CardContent>
        </>
    );
}
