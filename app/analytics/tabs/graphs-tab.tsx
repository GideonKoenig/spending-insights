"use client";

import { Insights } from "@/lib/analytics-tools/grouping";
import { GraphRenderer } from "@/app/analytics/graph-renderer";
import { GraphProvider } from "@/contexts/graph/provider";

const GRAPHS_SETTINGS_STORAGE_KEY = "bank-history-analytics-graphs";

const DEFAULT_SETTINGS = {
    type: "balance",
    aggregation: "daily",
    timeRange: { type: "preset", value: "all" },
} as const;

export function GraphsTab(props: { insights: Insights }) {
    return (
        <div className="h-full w-full">
            <GraphProvider
                storageKey={GRAPHS_SETTINGS_STORAGE_KEY}
                defaultSettings={DEFAULT_SETTINGS}
            >
                <GraphRenderer insights={props.insights} />
            </GraphProvider>
        </div>
    );
}
