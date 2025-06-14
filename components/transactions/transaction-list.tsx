"use client";

import { useState, useCallback, useEffect } from "react";
import { type Transaction } from "@/lib/types";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { TransactionCardSlim } from "@/components/transactions/transaction-card-slim";
import { TransactionHeader } from "@/components/transactions/transaction-header";
import { TransactionViewToggle } from "@/components/transactions/transaction-view-toggle";
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
import { useTransactionView } from "@/lib/hooks/use-transaction-view";

export function TransactionList(props: {
    transactions: Transaction[];
    containerRef: React.RefObject<HTMLDivElement | null>;
    containerReady: boolean;
    className?: string;
}) {
    const [filters, setFilters] = useState<FilterRule[]>([]);
    const [sortBy, setSortBy] = useState<TransactionSortOption>("newest");
    const view = useTransactionView();

    const filteredTransactions = filter(
        props.transactions,
        filters,
        TRANSACTION_FILTER
    );
    const sortedTransactions = sortTransactions(filteredTransactions, sortBy);

    const getScrollElement = useCallback(
        () => props.containerRef.current,
        [props.containerRef]
    );

    const virtualizer = useVirtualizer({
        count: sortedTransactions.length,
        getScrollElement,
        estimateSize: () => (view.viewType === "standard" ? 192 : 48),
        overscan: 5,
        gap: view.viewType === "standard" ? 16 : 8,
        enabled: props.containerReady,
    });

    useEffect(() => {
        virtualizer._willUpdate();
        virtualizer.measure();
    }, [props.containerReady, view.viewType, virtualizer]);

    const CardComponent =
        view.viewType === "standard" ? TransactionCard : TransactionCardSlim;

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
                    viewToggle={<TransactionViewToggle view={view} />}
                />
                {props.containerRef.current && (
                    <div
                        className="relative"
                        style={{ height: `${virtualizer.getTotalSize()}px` }}
                    >
                        {virtualizer.getVirtualItems().map((item) => (
                            <CardComponent
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
