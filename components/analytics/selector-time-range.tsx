"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LoadingState } from "@/components/loading-state";
import { useGraph } from "@/contexts/graph/provider";
import { DatePicker } from "@/components/date-picker";
import { subYears } from "date-fns";
import {
    endOfMonth,
    endOfYear,
    startOfMonth,
    startOfYear,
    subMonths,
} from "date-fns";

type PresetTimeRange =
    | "all"
    | "last-year"
    | "last-6-months"
    | "last-3-months"
    | "last-month"
    | "this-year"
    | "year-to-date"
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
    { value: "year-to-date", label: "Year to Date" },
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

export function getDateRangeFromTimeRange(timeRange: TimeRange) {
    const now = new Date();

    if (
        timeRange.type === "custom" &&
        timeRange.startDate &&
        timeRange.endDate
    ) {
        return { start: timeRange.startDate, end: timeRange.endDate };
    }

    switch (timeRange.value) {
        case "all":
            return { start: new Date(1900, 0, 1), end: now };
        case "this-month":
            return { start: startOfMonth(now), end: endOfMonth(now) };
        case "this-year":
            return { start: startOfYear(now), end: endOfYear(now) };
        case "year-to-date":
            return {
                start: subMonths(startOfMonth(now), 11),
                end: endOfMonth(now),
            };
        case "last-3-months":
            return { start: subMonths(now, 3), end: now };
        case "last-6-months":
            return { start: subMonths(now, 6), end: now };
        case "last-month":
            return {
                start: subMonths(startOfMonth(now), 1),
                end: subMonths(endOfMonth(now), 1),
            };
        case "last-year":
            return {
                start: subYears(startOfYear(now), 1),
                end: subYears(endOfYear(now), 1),
            };
        default:
            return { start: new Date(1900, 0, 1), end: now };
    }
}
