import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Transaction } from "@/lib/types";

interface TransactionCardProps {
    transaction: Transaction;
    category?: string;
}

export function TransactionCard(props: TransactionCardProps) {
    const { transaction, category } = props;

    return (
        <Card className="h-full">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-medium">
                                {transaction.paymentParticipant}
                            </h3>
                            {category && (
                                <Badge variant="secondary">{category}</Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {transaction.purpose}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>
                                Booking:{" "}
                                {format(
                                    transaction.bookingDate,
                                    "MMM dd, yyyy"
                                )}
                            </span>
                            <span>
                                Value:{" "}
                                {format(transaction.valueDate, "MMM dd, yyyy")}
                            </span>
                            <span>{transaction.transactionType}</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <div
                            className={`text-lg font-medium ${
                                transaction.amount >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                            }`}
                        >
                            {transaction.amount >= 0 ? "+" : ""}
                            {transaction.amount.toFixed(2)}{" "}
                            {transaction.currency}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Balance:{" "}
                            {transaction.balanceAfterTransaction.toFixed(2)}{" "}
                            {transaction.currency}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
