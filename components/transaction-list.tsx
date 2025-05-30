"use client";

import { useState } from "react";
import { useData } from "@/contexts/data-provider";
import { Card, CardContent } from "@/components/ui/card";
import type { Transaction } from "@/lib/types";
import { TransactionCard } from "@/components/transaction-card";
import { TransactionFilter } from "@/components/transaction-filter";
import { categorizeTransactions } from "@/lib/pattern-matcher";
import {
    filterTransactions,
    type TransactionFilters,
} from "@/lib/filtering/transaction-filters";
import type { FilterCondition } from "@/lib/filtering/types";
import type { DateRangeFilter } from "@/lib/filtering/types";

export function TransactionList() {
    const { transactions, patterns, loading, error } = useData();
    const [showFilters, setShowFilters] = useState(false);
    const [dateRange, setDateRange] = useState<DateRangeFilter>({
        from: undefined,
        to: undefined,
    });
    const [filterConditions, setFilterConditions] = useState<
        FilterCondition<Transaction>[]
    >([]);

    const filters: TransactionFilters = {
        dateRange,
        conditions: filterConditions,
    };

    const filteredTransactions = filterTransactions(transactions, filters);
    const categorizedTransactions = categorizeTransactions(
        transactions,
        patterns
    );

    function addFilterCondition(condition: FilterCondition<Transaction>) {
        setFilterConditions([...filterConditions, condition]);
    }

    function removeFilterCondition(id: string) {
        setFilterConditions(filterConditions.filter((c) => c.id !== id));
    }

    function clearFilters() {
        setFilterConditions([]);
        setDateRange({ from: undefined, to: undefined });
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                        Loading transactions...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                <p className="font-medium">Error loading transactions</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    function getTransactionKey(transaction: Transaction): string {
        return `${transaction.bookingDate.getTime()}-${transaction.amount}-${
            transaction.purpose
        }`;
    }

    function getTransactionCategory(
        transaction: Transaction
    ): string | undefined {
        return categorizedTransactions.get(getTransactionKey(transaction));
    }

    return (
        <div className="flex flex-col h-full">
            <TransactionFilter
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                dateRange={dateRange}
                setDateRange={setDateRange}
                filterConditions={filterConditions}
                addFilterCondition={addFilterCondition}
                removeFilterCondition={removeFilterCondition}
                clearFilters={clearFilters}
                totalCount={transactions.length}
                filteredCount={filteredTransactions.length}
            />

            <div className="flex-1 overflow-auto min-h-0 space-y-4 pb-4">
                {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => {
                        const category = getTransactionCategory(transaction);
                        return (
                            <TransactionCard
                                key={getTransactionKey(transaction)}
                                transaction={transaction}
                                category={category}
                            />
                        );
                    })
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-muted-foreground">
                                No transactions found matching your filters.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
