"use client";

import { type Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TransactionCard(props: {
    transaction: Transaction;
    className?: string;
    style?: React.CSSProperties;
    purposeLineClamp?: 2 | 3 | 4;
}) {
    const amount = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: props.transaction.currency,
    }).format(props.transaction.amount);

    const newBalance = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: props.transaction.currency,
    }).format(props.transaction.balanceAfterTransaction);

    const date = props.transaction.bookingDate.toLocaleDateString("de-DE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    return (
        <div
            className={cn(
                "p-6 grid grid-cols-5 gap-4 bg-card text-card-foreground  rounded-md border shadow-sm",
                props.className
            )}
            style={props.style}
        >
            <div className="flex flex-col col-span-3">
                <h3 className="font-medium text-sm truncate">
                    {props.transaction.paymentParticipant}
                </h3>
                <p className="text-xs text-muted-foreground">
                    {props.transaction.transactionType}
                </p>
            </div>

            <div className="flex flex-col items-end col-span-2">
                <p
                    className={cn(
                        "font-medium",
                        props.transaction.amount >= 0
                            ? "text-positive"
                            : "text-negative"
                    )}
                >
                    {amount}
                </p>
                <p className="text-xs text-muted-foreground">
                    Balance: {newBalance}
                </p>
            </div>

            <div className="col-span-4">
                <p
                    className={cn(
                        "text-sm text-muted-foreground ",
                        props.purposeLineClamp === undefined && "line-clamp-2",
                        props.purposeLineClamp === 2 && "line-clamp-2",
                        props.purposeLineClamp === 3 && "line-clamp-3",
                        props.purposeLineClamp === 4 && "line-clamp-4"
                    )}
                >
                    {props.transaction.purpose}
                </p>
            </div>

            <div />

            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <p className="">{"Date"}</p>
                <p className="">{date}</p>
            </div>

            <div className="flex flex-col col-span-2 gap-1 text-xs text-muted-foreground">
                <p className="">{"IBAN"}</p>
                <p className="">{props.transaction.paymentParticipantIban}</p>
            </div>

            <div className="flex flex-col col-span-2 gap-1 text-xs text-muted-foreground">
                <p className="">{"BIC"}</p>
                <p className="">{props.transaction.paymentParticipantBic}</p>
            </div>
        </div>
    );
}
