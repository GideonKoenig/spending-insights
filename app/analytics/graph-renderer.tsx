"use client";

import { Insights } from "@/lib/analytics-tools/grouping";
import { BalanceChart } from "@/app/analytics/charts/balance-chart";
import { IncomeExpenseChart } from "@/app/analytics/charts/income-expense-chart";
import { ExpensePieChart } from "@/app/analytics/charts/expense-pie-chart";
import { SankeyDiagram } from "@/app/analytics/charts/sankey-diagram";
import { useGraph } from "@/contexts/graph/provider";
import { LoadingState } from "@/components/loading-state";
import { ReactNode } from "react";
import { SelectorGraphType } from "@/components/analytics/selector-graph-type";
import { SelectorAggregation } from "@/components/analytics/selector-aggregation";
import { SelectorTimeRange } from "@/components/analytics/selector-time-range";

export function GraphRenderer(props: { insights: Insights }) {
    const graphContext = useGraph();

    if (graphContext.isLoading) {
        return <LoadingState className="h-full w-full" />;
    }

    let graph: ReactNode | null = null;
    switch (graphContext.settings.type) {
        case "balance":
            graph = <BalanceChart insights={props.insights} />;
            break;
        case "income-expense":
            graph = <IncomeExpenseChart insights={props.insights} />;
            break;
        case "pie":
            graph = <ExpensePieChart insights={props.insights} />;
            break;
        case "sankey":
            graph = <SankeyDiagram insights={props.insights} />;
            break;
    }

    return (
        <div className="flex w-full h-full flex-col gap-4 p-4 bg-card rounded-xl border border-border shadow-sm">
            <div className="flex gap-2 items-center">
                <SelectorGraphType />
                <div className="flex-grow" />
                <SelectorTimeRange />
                <SelectorAggregation />
            </div>
            {graph}
        </div>
    );
}
