"use client";

import { LoadingState } from "@/components/loading-state";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useGraph } from "@/contexts/graph/provider";

export type AggregationLevel = "daily" | "weekly" | "monthly" | "yearly";

const aggregationOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
] as const;

export function SelectorAggregation() {
    const graphContext = useGraph();
    if (graphContext.isLoading) {
        return (
            <LoadingState className="text-sm w-[120px] h-10 border rounded-md bg-background border-border" />
        );
    }

    return (
        <Select
            value={graphContext.settings.aggregation}
            onValueChange={(aggregation) =>
                graphContext.setSettings({
                    ...graphContext.settings,
                    aggregation: aggregation as AggregationLevel,
                })
            }
        >
            <SelectTrigger className="w-[120px] bg-background border-border border shadow-sm">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {aggregationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
