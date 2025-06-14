"use client";

import { TagBadge } from "@/components/tag-rules/tag-badge";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { type Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TransactionCardSlim(props: {
    transaction: Transaction;
    className?: string;
    style?: React.CSSProperties;
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
        <HoverCard openDelay={300}>
            <HoverCardTrigger asChild>
                <div
                    className={cn(
                        "px-3 py-2 flex items-center gap-3 bg-card text-card-foreground rounded-md border shadow-sm  hover:bg-muted/50",
                        props.className
                    )}
                    style={props.style}
                >
                    <div className="text-sm text-muted-foreground w-20 shrink-0">
                        {date}
                    </div>

                    <div className="flex-1 flex items-center gap-2 min-w-0">
                        <h3
                            className={cn(
                                "font-medium text-sm truncate",
                                !props.transaction.paymentParticipant &&
                                    "text-muted-foreground"
                            )}
                        >
                            {props.transaction.paymentParticipant ?? "???"}
                        </h3>

                        {props.transaction.tag && (
                            <TagBadge
                                tag={props.transaction.tag}
                                showSubCategory={false}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-2 items-center gap-3">
                        <p className="text-sm text-muted-foreground text-left w-20 shrink-0">
                            {newBalance}
                        </p>
                        <div
                            className={cn(
                                "font-semibold text-sm tabular-nums text-right",
                                props.transaction.amount >= 0
                                    ? "text-positive"
                                    : "text-negative"
                            )}
                        >
                            {amount}
                        </div>
                    </div>
                </div>
            </HoverCardTrigger>

            <HoverCardContent className="w-[420px]" align="start">
                <div className="space-y-4">
                    {/* Header with amount */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h4 className="font-semibold text-base">
                                {props.transaction.paymentParticipant || "???"}
                            </h4>
                        </div>
                        <div className="text-right">
                            <div
                                className={cn(
                                    "font-semibold text-lg tabular-nums",
                                    props.transaction.amount >= 0
                                        ? "text-positive"
                                        : "text-negative"
                                )}
                            >
                                {amount}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Balance: {newBalance}
                            </div>
                        </div>
                    </div>

                    {/* Transaction details */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                            <span className="text-muted-foreground">Date:</span>{" "}
                            <span className="font-medium">{date}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Type:</span>{" "}
                            <span className="font-medium">
                                {props.transaction.transactionType}
                            </span>
                        </div>
                        {props.transaction.tag && (
                            <div className="col-span-2">
                                <span className="text-muted-foreground">
                                    Category:
                                </span>{" "}
                                <TagBadge
                                    tag={props.transaction.tag}
                                    showSubCategory={true}
                                />
                            </div>
                        )}
                    </div>

                    {/* Purpose if available */}
                    {props.transaction.purpose && (
                        <div className="border-t pt-3">
                            <h5 className="text-sm font-medium mb-1">
                                Purpose
                            </h5>
                            <p className="text-sm text-muted-foreground">
                                {props.transaction.purpose}
                            </p>
                        </div>
                    )}

                    {/* Payment details */}
                    <div className="border-t pt-3 space-y-1 text-sm">
                        <h5 className="font-medium mb-2">Payment Details</h5>
                        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xs">
                            <span className="text-muted-foreground">IBAN:</span>
                            <span className="font-mono truncate">
                                {props.transaction.paymentParticipantIban ||
                                    "—"}
                            </span>
                            <span className="text-muted-foreground">BIC:</span>
                            <span className="font-mono">
                                {props.transaction.paymentParticipantBic || "—"}
                            </span>
                        </div>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
