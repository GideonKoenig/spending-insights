import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Transaction } from "@/lib/types";

interface TransactionCardSmallProps {
    transaction: Transaction;
    category?: string;
    isSelected?: boolean;
    onClick?: () => void;
}

export function TransactionCardSmall(props: TransactionCardSmallProps) {
    const { transaction, category, isSelected, onClick } = props;

    return (
        <div
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent"
            }`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm">
                            {transaction.paymentParticipant}
                        </h4>
                        {category && (
                            <Badge variant="secondary" className="text-xs">
                                {category}
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {transaction.purpose}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{format(transaction.bookingDate, "MMM dd")}</span>
                        <span>•</span>
                        <span>{transaction.transactionType}</span>
                    </div>
                </div>

                <div className="text-right ml-2">
                    <div
                        className={`text-sm font-medium ${
                            transaction.amount >= 0
                                ? "text-green-600"
                                : "text-red-600"
                        }`}
                    >
                        {transaction.amount >= 0 ? "+" : ""}
                        {transaction.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {transaction.currency}
                    </div>
                </div>
            </div>
        </div>
    );
}
