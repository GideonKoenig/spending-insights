"use client";

import { TagBadge } from "@/components/tag-rules/tag-badge";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TransactionCard(props: {
    transaction: Transaction;
    className?: string;
    style?: React.CSSProperties;
    purposeLineClamp?: 2 | 3 | 4 | 5;
}) {
    const amount = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: props.transaction.currency,
    }).format(props.transaction.amount);

    const newBalance = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: props.transaction.currency,
    }).format(props.transaction.balanceAfterTransaction);

    const date = props.transaction.valueDate.toLocaleDateString("de-DE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    return (
        <div
            className={cn(
                "p-5 grid grid-cols-5 gap-4 bg-card text-card-foreground  rounded-md border shadow-sm",
                props.className
            )}
            style={props.style}
        >
            <div className="flex flex-col gap-1 col-span-3">
                <h3
                    className={cn(
                        "font-medium text-sm truncate",
                        !props.transaction.participantName &&
                            "text-muted-foreground"
                    )}
                >
                    {props.transaction.participantName === ""
                        ? "???"
                        : props.transaction.participantName}
                </h3>
                <div className="flex gap-2 items-center">
                    {props.transaction.tag && (
                        <TagBadge
                            tag={props.transaction.tag}
                            showSubCategory={true}
                        />
                    )}
                    <p className="text-xs text-muted-foreground">
                        {props.transaction.transactionType}
                    </p>
                </div>
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

            <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                    <div className="col-span-4">
                        <p
                            className={cn(
                                "text-sm text-muted-foreground ",
                                props.purposeLineClamp === undefined &&
                                    "line-clamp-2",
                                props.purposeLineClamp === 2 && "line-clamp-2",
                                props.purposeLineClamp === 3 && "line-clamp-3",
                                props.purposeLineClamp === 4 && "line-clamp-4",
                                props.purposeLineClamp === 5 && "line-clamp-5"
                            )}
                        >
                            {props.transaction.purpose}
                        </p>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-xs text-sm">
                        {props.transaction.purpose}
                    </p>
                </TooltipContent>
            </Tooltip>

            <div />

            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <p className="">{"Date"}</p>
                <p className="">{date}</p>
            </div>

            <div className="flex flex-col col-span-2 gap-1 text-xs text-muted-foreground">
                <p className="">{"IBAN"}</p>
                <p className="">
                    {props.transaction.participantIban === ""
                        ? "???"
                        : props.transaction.participantIban}
                </p>
            </div>

            <div className="flex flex-col col-span-2 gap-1 text-xs text-muted-foreground">
                <p className="">{"BIC"}</p>
                <p className="">
                    {props.transaction.participantBic === ""
                        ? "???"
                        : props.transaction.participantBic}
                </p>
            </div>
        </div>
    );
}
