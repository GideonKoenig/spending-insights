import type { FilterOperator } from "./operators";

export interface DateRangeFilter {
    from?: Date;
    to?: Date;
}

export interface FilterCondition<T> {
    field: keyof T;
    operator: FilterOperator;
    value: any;
    id: string;
}

export interface Filters<T> {
    dateRange: DateRangeFilter;
    conditions: FilterCondition<T>[];
}
