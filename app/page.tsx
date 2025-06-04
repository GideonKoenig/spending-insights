"use client";

import { useData } from "@/contexts/data/provider";
import { FileSelector } from "@/components/file-selector";
import { TransactionList } from "@/components/transaction-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRef } from "react";
import { getActiveTransactions } from "@/lib/utils";

export default function HomePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const {
        needsFileHandle,
        needsPermission,
        loading,
        datasets,
        activeDataset,
    } = useData();

    if (needsFileHandle || needsPermission || loading) {
        return <FileSelector />;
    }

    const transactions = getActiveTransactions(datasets, activeDataset).sort(
        (a, b) =>
            new Date(b.bookingDate).getTime() -
            new Date(a.bookingDate).getTime()
    );

    return (
        <ScrollArea ref={containerRef} className="h-full">
            <TransactionList
                transactions={transactions}
                containerRef={containerRef}
            />
        </ScrollArea>
    );
}
