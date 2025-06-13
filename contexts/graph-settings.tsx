"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { TimeRange } from "@/components/analytics/selector-time-range";
import { AggregationLevel } from "@/components/analytics/selector-aggregation";
import { getLocal, storeLocal } from "@/lib/utils";

interface GraphSettings {
    timeRange: TimeRange;
    aggregation: AggregationLevel;
    setTimeRange: (range: TimeRange) => void;
    setAggregation: (level: AggregationLevel) => void;
}

interface StoredGraphSettings {
    timeRange: TimeRange;
    aggregation: AggregationLevel;
}

const GraphSettingsContext = createContext<GraphSettings | null>(null);

export function useGraphSettings() {
    const context = useContext(GraphSettingsContext);
    if (!context) {
        throw new Error(
            "useGraphSettings must be used within a GraphSettingsProvider"
        );
    }
    return context;
}

interface GraphSettingsProviderProps {
    storageKey: string;
    defaultTimeRange?: TimeRange;
    defaultAggregation?: AggregationLevel;
    children: ReactNode;
}

export function GraphSettingsProvider({
    storageKey,
    defaultTimeRange = { type: "preset", value: "all" },
    defaultAggregation = "monthly",
    children,
}: GraphSettingsProviderProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>(defaultTimeRange);
    const [aggregation, setAggregation] =
        useState<AggregationLevel>(defaultAggregation);

    useEffect(() => {
        const result = getLocal<StoredGraphSettings>(storageKey);
        if (result.success && result.value) {
            setTimeRange(result.value.timeRange);
            setAggregation(result.value.aggregation);
        }
    }, [storageKey]);

    useEffect(() => {
        storeLocal(storageKey, { timeRange, aggregation });
    }, [storageKey, timeRange, aggregation]);

    return (
        <GraphSettingsContext.Provider
            value={{
                timeRange,
                aggregation,
                setTimeRange,
                setAggregation,
            }}
        >
            {children}
        </GraphSettingsContext.Provider>
    );
}
