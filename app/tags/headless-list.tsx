"use client";

import { Transaction } from "@/lib/types";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function TagsHeadlessList(props: {
    transactions: Transaction[];
    showTagged: boolean;
    className?: string;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedTransactions = props.showTagged
        ? props.transactions.getTagged()
        : props.transactions;
    const virtualizer = useVirtualizer({
        count: selectedTransactions.length,
        getScrollElement: () => containerRef.current,
        estimateSize: () => 192,
        overscan: 5,
        gap: 16,
    });

    useEffect(() => {
        virtualizer._willUpdate();
    }, [containerRef.current]);

    const taggedCount = selectedTransactions.getTagged().length;
    const untaggedCount = props.transactions.length - taggedCount;

    return (
        <div className={cn("h-full overflow-hidden", props.className)}>
            <ScrollArea ref={containerRef} className="h-full pr-3">
                <div className="flex items-center bg-card rounded-md p-2 border border-border shadow-sm mb-1">
                    <p className="text-sm whitespace-pre-wrap">
                        {`${taggedCount} tagged   ${untaggedCount} untagged`}
                    </p>
                </div>
                <div
                    className="relative h-full"
                    style={{
                        height: `${virtualizer.getTotalSize()}px`,
                        maxHeight: "100%",
                    }}
                >
                    {virtualizer.getVirtualItems().map((item) => (
                        <TransactionCard
                            className="p-3"
                            purposeLineClamp={3}
                            key={selectedTransactions[item.index].hash}
                            transaction={selectedTransactions[item.index]}
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
            </ScrollArea>
        </div>
    );
}
