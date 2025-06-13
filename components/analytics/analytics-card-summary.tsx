import { cloneElement, ReactElement } from "react";
import { formatEuro } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import React from "react";

export type Summary = {
    title: string;
    income: number;
    expense: number;
    average: number;
};

export function AnalyticsCardSummary(props: {
    summary: Summary;
    icon: ReactElement;
}) {
    const trendUp = <TrendingUp className="h-3 w-3 text-positive" />;
    const trendDown = <TrendingDown className="h-3 w-3 text-negative" />;
    const balance = props.summary.income - props.summary.expense;

    return (
        <div className="rounded-md border bg-card text-card-foreground shadow-sm grid grid-cols-2 p-4 gap-2">
            <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-medium tracking-tight">
                    {props.summary.title}
                </h3>
                {balance > 0 ? trendUp : balance < 0 ? trendDown : null}
            </div>

            <div className="flex items-center justify-end">
                {cloneElement(props.icon, {
                    className: "h-4 w-4 text-muted-foreground",
                } as React.HTMLAttributes<React.ReactElement>)}
            </div>

            <div>
                <p className="text-xs text-muted-foreground">Income</p>
                <p className="text-sm font-bold text-positive">
                    {formatEuro(props.summary.income)}
                </p>
            </div>

            <div>
                <p className="text-xs text-muted-foreground">Net Balance</p>
                <p
                    className={`text-sm font-bold ${
                        balance >= 0 ? "text-positive" : "text-negative"
                    }`}
                >
                    {formatEuro(balance)}
                </p>
            </div>

            <div>
                <p className="text-xs text-muted-foreground">Expenses</p>
                <p className="text-sm font-bold text-negative">
                    {formatEuro(-props.summary.expense)}
                </p>
            </div>

            <div>
                {/* <p className="text-xs text-muted-foreground">
                    Compared to Average
                </p>
                <p
                    className={`text-sm font-bold ${
                        balance - props.summary.average >= 0
                            ? "text-positive"
                            : "text-negative"
                    }`}
                >
                    {formatEuro(balance - props.summary.average)}
                </p> */}
            </div>
        </div>
    );
}
