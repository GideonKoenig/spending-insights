"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useGraph } from "@/contexts/graph/provider";
import { LoadingState } from "@/components/loading-state";

export type GraphType =
    | "balance"
    | "relative-balance"
    | "income-expense"
    | "pie"
    | "sankey";

const graphTypeOptions = [
    { value: "balance", label: "Balance Chart" },
    { value: "relative-balance", label: "Relative Balance Chart" },
    { value: "income-expense", label: "Income vs Expenses" },
    { value: "pie", label: "Expense Pie Chart" },
    { value: "sankey", label: "Sankey Chart" },
] as const;

export function SelectorGraphType() {
    const graphContext = useGraph();
    if (graphContext.isLoading) {
        return (
            <LoadingState className="text-sm w-[200px] h-10 border rounded-md bg-background border-border" />
        );
    }

    return (
        <Select
            value={graphContext.settings.type}
            onValueChange={(type) =>
                graphContext.setSettings({
                    ...graphContext.settings,
                    type: type as GraphType,
                })
            }
        >
            <SelectTrigger className="w-[200px] bg-background border-border border shadow-sm">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {graphTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
