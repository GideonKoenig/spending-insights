"use client";

import { useState } from "react";
import { useData } from "@/contexts/data-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@/lib/types";
import { format } from "date-fns";
import {
    categorizeTransactions,
    getUncategorizedTransactions,
} from "@/lib/pattern-matcher";
import { TransactionCardSmall } from "@/components/transaction-card-small";

export function TransactionViewer() {
    const { transactions, patterns } = useData();
    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null);
    const [showAll, setShowAll] = useState(false);

    const categorizedTransactions = categorizeTransactions(
        transactions,
        patterns
    );
    const uncategorizedTransactions = getUncategorizedTransactions(
        transactions,
        patterns
    );

    const displayTransactions = showAll
        ? transactions
        : uncategorizedTransactions;

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
        <div className="space-y-4 h-full flex flex-col">
            <Card className="flex-1 min-h-0 flex flex-col">
                <CardHeader className="shrink-0">
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            {showAll
                                ? "All Transactions"
                                : "Uncategorized Transactions"}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant={showAll ? "outline" : "default"}
                                size="sm"
                                onClick={() => setShowAll(false)}
                            >
                                Uncategorized (
                                {uncategorizedTransactions.length})
                            </Button>
                            <Button
                                variant={showAll ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowAll(true)}
                            >
                                All ({transactions.length})
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 min-h-0">
                    <div className="h-full overflow-y-auto">
                        <div className="space-y-2 p-4">
                            {displayTransactions.map((transaction, index) => {
                                const category =
                                    getTransactionCategory(transaction);
                                const isSelected =
                                    selectedTransaction === transaction;

                                return (
                                    <TransactionCardSmall
                                        key={index}
                                        transaction={transaction}
                                        category={category}
                                        isSelected={isSelected}
                                        onClick={() =>
                                            setSelectedTransaction(transaction)
                                        }
                                    />
                                );
                            })}

                            {displayTransactions.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>
                                        {showAll
                                            ? "No transactions found."
                                            : "All transactions are categorized!"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {selectedTransaction && (
                <Card className="shrink-0">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Transaction Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">
                                    Participant:
                                </span>
                                <p className="text-muted-foreground">
                                    {selectedTransaction.paymentParticipant}
                                </p>
                            </div>
                            <div>
                                <span className="font-medium">Amount:</span>
                                <p
                                    className={`font-medium ${
                                        selectedTransaction.amount >= 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {selectedTransaction.amount >= 0 ? "+" : ""}
                                    {selectedTransaction.amount.toFixed(2)}{" "}
                                    {selectedTransaction.currency}
                                </p>
                            </div>
                            <div>
                                <span className="font-medium">Type:</span>
                                <p className="text-muted-foreground">
                                    {selectedTransaction.transactionType}
                                </p>
                            </div>
                            <div>
                                <span className="font-medium">Date:</span>
                                <p className="text-muted-foreground">
                                    {format(
                                        selectedTransaction.bookingDate,
                                        "PPP"
                                    )}
                                </p>
                            </div>
                        </div>
                        <div>
                            <span className="font-medium">Purpose:</span>
                            <p className="text-muted-foreground text-sm mt-1">
                                {selectedTransaction.purpose}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
