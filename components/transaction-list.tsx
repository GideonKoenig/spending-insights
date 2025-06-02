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

export function TransactionList(props: {
    transactions: Transaction[];
    containerRef: React.RefObject<HTMLDivElement | null>;
    className?: string;
}) {
    const [filters, setFilters] = useState<FilterRule[]>([]);

    const filteredTransactions = filter(
        props.transactions,
        filters,
        FILTER_OPTIONS
    );

    const virtualizer = useVirtualizer({
        count: filteredTransactions.length,
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
                    filteredCount={filteredTransactions.length}
                />
                <div
                    className="relative"
                    style={{ height: `${virtualizer.getTotalSize()}px` }}
                >
                    {virtualizer.getVirtualItems().map((item) => (
                        <TransactionCard
                            key={getKey(filteredTransactions[item.index])}
                            transaction={filteredTransactions[item.index]}
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

                    {/* <div className="flex flex-col gap-4">
                    {filteredTransactions.map((transaction) => (
                        <TransactionCard
                            key={getKey(transaction)}
                            transaction={transaction}
                        />
                    ))}
                </div> */}
                </div>
            </div>
        </div>
    );
}
