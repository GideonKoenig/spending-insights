"use client";

import { useData } from "@/contexts/data-provider";
import { FileSelector } from "@/components/file-selector";
import { TransactionList } from "@/components/transaction-list";

export default function HomePage() {
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

    const transactions = dataResult.value.transactions.slice(0, 20);

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <TransactionList transactions={transactions} />
        </div>
    );
}
