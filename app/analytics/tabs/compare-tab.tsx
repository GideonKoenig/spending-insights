"use client";

import { Insights } from "@/lib/analytics-tools/grouping";
import { GraphRenderer } from "@/app/analytics/graph-renderer";
import { GraphProvider } from "@/contexts/graph/provider";
import { Account } from "@/lib/types";

const COMPARE_LEFT_TYPE_KEY = "bank-history-analytics-compare-left";
const COMPARE_RIGHT_TYPE_KEY = "bank-history-analytics-compare-right";

const DEFAULT_LEFT_SETTINGS = {
    type: "sankey",
    aggregation: "monthly",
    timeRange: { type: "preset", value: "last-year" },
    granularity: "month",
} as const;

const DEFAULT_RIGHT_SETTINGS = {
    type: "sankey",
    aggregation: "monthly",
    timeRange: { type: "preset", value: "last-month" },
    granularity: "month",
} as const;

export function CompareTab(props: { insights: Insights; accounts: Account[] }) {
    return (
        <div className="h-full w-full grid lg:grid-cols-2 gap-4">
            <GraphProvider
                storageKey={COMPARE_LEFT_TYPE_KEY}
                defaultSettings={DEFAULT_LEFT_SETTINGS}
            >
                <GraphRenderer
                    insights={props.insights}
                    accounts={props.accounts}
                />
            </GraphProvider>
            <GraphProvider
                storageKey={COMPARE_RIGHT_TYPE_KEY}
                defaultSettings={DEFAULT_RIGHT_SETTINGS}
            >
                <GraphRenderer
                    insights={props.insights}
                    accounts={props.accounts}
                />
            </GraphProvider>
        </div>
    );
}
