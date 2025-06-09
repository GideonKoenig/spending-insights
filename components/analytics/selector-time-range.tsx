"use client";

import { Calendar } from "lucide-react";
import { format } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { LoadingState } from "@/components/loading-state";
import { useGraph } from "@/contexts/graph/provider";
import { DatePicker } from "@/components/date-picker";

type PresetTimeRange =
    | "all"
    | "last-year"
    | "last-6-months"
    | "last-3-months"
    | "last-month"
    | "this-year"
    | "this-month"
    | "custom";

export type TimeRange = {
    type: "preset" | "custom";
    value: PresetTimeRange;
    startDate?: Date;
    endDate?: Date;
};

const presetRanges = [
    { value: "all", label: "All Time" },
    { value: "this-month", label: "This Month" },
    { value: "last-month", label: "Last Month" },
    { value: "this-year", label: "This Year" },
    { value: "last-year", label: "Last Year" },
    { value: "last-3-months", label: "Last 3 Months" },
    { value: "last-6-months", label: "Last 6 Months" },
    { value: "custom", label: "Custom Range" },
];

export function SelectorTimeRange() {
    const graphContext = useGraph();
    if (graphContext.isLoading) {
        return (
            <LoadingState className="text-sm w-[200px] h-10 border rounded-md bg-background border-border" />
        );
    }
    console.log(graphContext.settings.timeRange);

    return (
        <div className="flex items-center gap-1">
            {graphContext.settings.timeRange.type === "custom" && (
                <>
                    <DatePicker
                        className="w-36"
                        placeholder="Start Date"
                        value={graphContext.settings.timeRange.startDate}
                        onChange={(date) =>
                            graphContext.setSettings({
                                ...graphContext.settings,
                                timeRange: {
                                    ...graphContext.settings.timeRange,
                                    startDate: date,
                                },
                            })
                        }
                    />
                    {"-"}
                    <DatePicker
                        className="w-36"
                        placeholder="End Date"
                        value={graphContext.settings.timeRange.endDate}
                        onChange={(date) =>
                            graphContext.setSettings({
                                ...graphContext.settings,
                                timeRange: {
                                    ...graphContext.settings.timeRange,
                                    endDate: date,
                                },
                            })
                        }
                    />
                </>
            )}
            <Select
                value={graphContext.settings.timeRange.value}
                onValueChange={(value) =>
                    graphContext.setSettings({
                        ...graphContext.settings,
                        timeRange: {
                            ...graphContext.settings.timeRange,
                            value: value as PresetTimeRange,
                            type: value === "custom" ? "custom" : "preset",
                        },
                    })
                }
            >
                <SelectTrigger className="w-[180px] bg-background border-border border shadow-sm">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {presetRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                            {range.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
