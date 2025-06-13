"use client";

import { Insights } from "@/lib/analytics-tools/grouping";
import { GraphRenderer } from "@/app/analytics/graph-renderer";
import { GraphProvider } from "@/contexts/graph/provider";
import { Account } from "@/lib/types";

const GRAPHS_SETTINGS_STORAGE_KEY = "bank-history-analytics-graphs";

const DEFAULT_SETTINGS = {
    type: "balance",
    aggregation: "daily",
    timeRange: { type: "preset", value: "all" },
    granularity: "month",
} as const;

export function GraphsTab(props: { insights: Insights; accounts: Account[] }) {
    return (
        <div className="h-full w-full">
            <GraphProvider
                storageKey={GRAPHS_SETTINGS_STORAGE_KEY}
                defaultSettings={DEFAULT_SETTINGS}
            >
                <GraphRenderer
                    insights={props.insights}
                    accounts={props.accounts}
                />
            </GraphProvider>
        </div>
    );
}
