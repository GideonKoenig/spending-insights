"use client";

import { useData } from "@/contexts/data-provider";
import { FileSelector } from "@/components/file-selector";
import { TransactionCard } from "@/components/transaction-card";
import { getKey } from "@/components/utils";

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
        <div className="p-4">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                {transactions.map((transaction) => (
                    <TransactionCard
                        key={getKey(transaction)}
                        transaction={transaction}
                    />
                ))}
            </div>
        </div>
    );
}
