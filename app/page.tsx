"use client";

import { useData } from "@/contexts/data-provider";
import { FileSelector } from "@/components/file-selector";
import { TransactionList } from "@/components/transaction-list";

export default function HomePage() {
    const { fileHandle, hasPermission } = useData();

    if (!fileHandle || !hasPermission) {
        return <FileSelector />;
    }

    return (
        <main className="h-full flex flex-col">
            <div className="mx-auto max-w-7xl px-4 py-8 w-full flex flex-col h-full">
                <TransactionList />
            </div>
        </main>
    );
}
