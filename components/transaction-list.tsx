"use client";

import { useState } from "react";
import { type Transaction } from "@/lib/types";
import { TransactionCard } from "@/components/transaction-card";
import { getKey } from "@/components/utils";
import { TransactionHeader } from "@/components/transaction-header";
import { filter } from "@/lib/transaction-filter/main";
import { type FilterRule } from "@/lib/transaction-filter/types";

export function TransactionList(props: {
    transactions: Transaction[];
    className?: string;
}) {
    const [filters, setFilters] = useState<FilterRule[]>([]);

    const filteredTransactions = filter(props.transactions, filters);

    return (
        <div className={props.className}>
            <TransactionHeader filters={filters} onFiltersChange={setFilters} />
            <div className="p-4">
                <div className="flex flex-col gap-4">
                    {filteredTransactions.map((transaction) => (
                        <TransactionCard
                            key={getKey(transaction)}
                            transaction={transaction}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
