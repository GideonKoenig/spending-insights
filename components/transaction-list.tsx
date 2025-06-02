"use client";

import { useEffect, useRef, useState } from "react";
import { type Transaction } from "@/lib/types";
import { TransactionCard } from "@/components/transaction-card";
import { getKey } from "@/components/utils";
import { TransactionHeader } from "@/components/transaction-header";
import { filter } from "@/lib/transaction-filter/main";
import { type FilterRule } from "@/lib/transaction-filter/types";
import { FILTER_OPTIONS } from "@/lib/transaction-filter/transaction-filter-options";
import { cn } from "@/lib/utils";
import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import {
    sortTransactions,
    type SortOption,
    SORT_OPTIONS,
} from "@/lib/transaction-sorter";

export function TransactionList(props: {
    transactions: Transaction[];
    containerRef: React.RefObject<HTMLDivElement | null>;
    className?: string;
}) {
    const [filters, setFilters] = useState<FilterRule[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>("newest");

    const filteredTransactions = filter(
        props.transactions,
        filters,
        FILTER_OPTIONS
    );
    const sortedTransactions = sortTransactions(filteredTransactions, sortBy);

    const virtualizer = useVirtualizer({
        count: sortedTransactions.length,
        getScrollElement: () => props.containerRef.current,
        estimateSize: () => 192,
        overscan: 5,
        gap: 16,
    });

    useEffect(() => {
        virtualizer._willUpdate();
    }, [props.containerRef.current]);

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div
                className={cn(
                    props.className,
                    "border border-border p-4 rounded-md"
                )}
            >
                <TransactionHeader
                    filters={filters}
                    onFiltersChange={setFilters}
                    transactions={props.transactions}
                    filteredCount={sortedTransactions.length}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    sortOptions={SORT_OPTIONS}
                />
                <div
                    className="relative"
                    style={{ height: `${virtualizer.getTotalSize()}px` }}
                >
                    {virtualizer.getVirtualItems().map((item) => (
                        <TransactionCard
                            key={getKey(sortedTransactions[item.index])}
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
            </div>
        </div>
    );
}
