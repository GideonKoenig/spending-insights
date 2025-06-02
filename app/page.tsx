"use client";

import { useData } from "@/contexts/data-provider";
import { FileSelector } from "@/components/file-selector";
import { TransactionList } from "@/components/transaction-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

export default function HomePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const dataResult = useData();

    if (!dataResult.success)
        return (
            <p className="p-4 text-destructive">
                Unexpected state: DataProvider not found
            </p>
        );

    const { needsFileHandle, needsPermission, loading } = dataResult.value;
    if (needsFileHandle || needsPermission || loading) {
        return <FileSelector />;
    }

    return (
        <div className="flex-grow overflow-hidden">
            <ScrollArea ref={containerRef} className="h-full">
                <TransactionList
                    transactions={dataResult.value.transactions}
                    containerRef={containerRef}
                />
            </ScrollArea>
        </div>
    );
}
