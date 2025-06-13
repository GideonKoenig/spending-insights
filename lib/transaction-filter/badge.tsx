"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TRANSACTION_FILTER } from "@/lib/transaction-filter/transaction-filter-options";
import { type FilterRule } from "@/lib/transaction-filter/types";
import { OPERATORS } from "@/lib/transaction-filter/main";
import { getOperatorsForFilterOption } from "@/lib/transaction-filter/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const valueToString = (value: unknown) => {
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    if (value instanceof Date)
        return value.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    return "";
};

export function TransactionFilterBadge(props: {
    filter: FilterRule;
    remove: () => void;
    onOperatorChange: (newOperator: string) => void;
}) {
    const optionLabel =
        TRANSACTION_FILTER.find(
            (option) => option.attribute === props.filter.attribute
        )?.label ?? props.filter.attribute;

    const availableOperators = getOperatorsForFilterOption(
        props.filter.attribute,
        TRANSACTION_FILTER,
        OPERATORS
    );

    return (
        <div className="flex gap-[0.125rem] items-center">
            <Badge
                variant="secondary"
                className="bg-primary select-none rounded-r-none border-0 rounded-l-lg p-1 px-3"
            >
                {optionLabel}
            </Badge>

            <Select
                value={props.filter.operator}
                onValueChange={props.onOperatorChange}
            >
                <SelectTrigger className="max-h-6 p-1 px-3 text-xs border-0 bg-primary hover:bg-primary/50 rounded-none">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {availableOperators.map((op) => (
                        <SelectItem key={op.name} value={op.name}>
                            {op.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Badge
                variant="secondary"
                className="rounded-none h-6 select-none border-0 bg-primary p-1 px-3"
            >
                {valueToString(props.filter.value)}
            </Badge>

            <button
                onClick={props.remove}
                className="rounded-none rounded-r-lg border-0 bg-primary p-1 hover:bg-primary/50 px-3"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
