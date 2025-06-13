import { AggregationLevel } from "@/components/analytics/selector-aggregation";
import { Granularity } from "@/components/analytics/selector-granularity";
import { GraphType } from "@/components/analytics/selector-graph-type";
import { TimeRange } from "@/components/analytics/selector-time-range";

export type GraphSettings = {
    type: GraphType;
    timeRange: TimeRange;
    aggregation: AggregationLevel;
    granularity: Granularity;
};
