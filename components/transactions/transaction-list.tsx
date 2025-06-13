"use client";

import { useState, useCallback } from "react";
import { type Transaction } from "@/lib/types";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { TransactionHeader } from "@/components/transactions/transaction-header";
import { filter } from "@/lib/transaction-filter/main";
import { type FilterRule } from "@/lib/transaction-filter/types";
import { TRANSACTION_FILTER } from "@/lib/transaction-filter/transaction-filter-options";
import { cn } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
    sortTransactions,
    type TransactionSortOption,
    TRANSACTION_SORT_OPTIONS,
} from "@/lib/transaction-sorter";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
export function TransactionList(props: {
    transactions: Transaction[];
    containerRef: React.RefObject<HTMLDivElement | null>;
    containerReady: boolean;
    className?: string;
}) {
    const [filters, setFilters] = useState<FilterRule[]>([]);
    const [sortBy, setSortBy] = useState<TransactionSortOption>("newest");

    const filteredTransactions = filter(
        props.transactions,
        filters,
        TRANSACTION_FILTER
    );
    console.log(filteredTransactions);
    const sortResult = sortTransactions(filteredTransactions, sortBy);
    console.log(sortResult);
    const sortedTransactions = sortResult;
    console.log(sortedTransactions);

    const getScrollElement = useCallback(
        () => props.containerRef.current,
        [props.containerRef]
    );
    const virtualizer = useVirtualizer({
        count: sortedTransactions.length,
        getScrollElement,
        estimateSize: () => 192,
        overscan: 5,
        gap: 16,
        enabled: props.containerReady,
    });

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className={cn(props.className, "p-4")}>
                <TransactionHeader
                    className="mb-2 p-2 bg-card border border-border rounded-md shadow-sm"
                    filters={filters}
                    onFiltersChange={setFilters}
                    transactions={props.transactions}
                    sortSelector={
                        <Select
                            value={sortBy}
                            onValueChange={(value) =>
                                setSortBy(value as TransactionSortOption)
                            }
                        >
                            <SelectTrigger
                                className="w-40 bg-background"
                                tabIndex={5}
                            >
                                <SelectValue placeholder="Sort by..." />
                            </SelectTrigger>
                            <SelectContent>
                                {TRANSACTION_SORT_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    }
                />
                {props.containerRef.current && (
                    <div
                        className="relative"
                        style={{ height: `${virtualizer.getTotalSize()}px` }}
                    >
                        {virtualizer.getVirtualItems().map((item) => (
                            <TransactionCard
                                key={sortedTransactions[item.index].hash}
                                transaction={sortedTransactions[item.index]}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,

                                    width: "100%",
                                    height: `${item.size}px`,
                                    transform: `translateY(${item.start}px)`,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
