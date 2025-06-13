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

export type Granularity = "day" | "week" | "month" | "year";

const granularityOptions = [
    { value: "day", label: "Per Day" },
    { value: "week", label: "Per Week" },
    { value: "month", label: "Per Month" },
    { value: "year", label: "Per Year" },
] as const;

const ENABLED_GRAPH_TYPES = ["pie", "sankey"];

export function SelectorGranularity() {
    const graphContext = useGraph();

    if (!ENABLED_GRAPH_TYPES.includes(graphContext.settings.type)) {
        return null;
    }

    if (graphContext.isLoading) {
        return (
            <LoadingState className="text-sm w-[120px] h-10 border rounded-md bg-background border-border" />
        );
    }

    return (
        <Select
            value={graphContext.settings.granularity}
            onValueChange={(granularity) =>
                graphContext.setSettings({
                    ...graphContext.settings,
                    granularity: granularity as Granularity,
                })
            }
        >
            <SelectTrigger className="w-[120px] bg-background border-border border shadow-sm">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {granularityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
