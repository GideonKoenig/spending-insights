"use client";

import { Transaction, TagMatcher } from "@/lib/types";
import { TransactionCard } from "@/components/transaction-card";
import { getKey } from "@/components/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TagsHeadlessList(props: { transactions: Transaction[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const virtualizer = useVirtualizer({
        count: props.transactions.length,
        getScrollElement: () => containerRef.current,
        estimateSize: () => 192,
        overscan: 5,
        gap: 16,
    });

    useEffect(() => {
        virtualizer._willUpdate();
    }, [containerRef.current]);

    return (
        <div className="h-full overflow-hidden">
            <ScrollArea ref={containerRef} className="h-full pr-3">
                <div
                    className="relative h-full"
                    style={{
                        height: `${virtualizer.getTotalSize()}px`,
                        maxHeight: "100%",
                    }}
                >
                    {virtualizer.getVirtualItems().map((item) => (
                        <TransactionCard
                            key={getKey(props.transactions[item.index])}
                            transaction={props.transactions[item.index]}
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
