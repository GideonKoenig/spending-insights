import { AnalyticsCardGeneral } from "@/components/analytics-card-general";
import { summarize } from "@/app/analytics/utilts";
import { Transaction } from "@/lib/types";
import { formatEuro } from "@/lib/utils";
import { BarChart3, Hash, Target } from "lucide-react";

export function AnalyticsHeader(props: { transactions: Transaction[] }) {
    const totalIncome = props.transactions
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = props.transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalTransactions = props.transactions.length;

    const monthSummaries = summarize(props.transactions, "monthly");

    const balanceLast12Months =
        monthSummaries
            .slice(0, 12)
            .reduce((sum, month) => sum + month.income - month.expense, 0) / 12;
    const avgBalanceLast6Months =
        monthSummaries
            .slice(0, 6)
            .reduce((sum, month) => sum + month.income - month.expense, 0) / 6;

    const transactionsPerMonth = Math.round(
        props.transactions.length /
            Math.min(
                (props.transactions[0]!.bookingDate.getTime() -
                    props.transactions[
                        props.transactions.length - 1
                    ]!.bookingDate.getTime()) /
                    (1000 * 60 * 60 * 24 * 30),
                1
            )
    );

    return (
        <div className="grid grid-cols-4 gap-4">
            <AnalyticsCardGeneral title="Total Overview" icon={<BarChart3 />}>
                <div className="grid grid-cols-[4.25rem_auto] gap-2 text-sm text-muted-foreground">
                    <p>Income:</p>
                    <p className="text-right text-positive">
                        {formatEuro(totalIncome)}
                    </p>
                    <p>Expenses:</p>
                    <p className="text-right text-negative">
                        {formatEuro(-totalExpenses)}
                    </p>
                    <div className="border-t border-border col-span-2" />
                    <p>Net:</p>
                    <p
                        className={`text-right ${
                            totalIncome - totalExpenses >= 0
                                ? "text-positive"
                                : "text-negative"
                        }`}
                    >
                        {formatEuro(totalIncome - totalExpenses)}
                    </p>
                </div>
            </AnalyticsCardGeneral>

            <AnalyticsCardGeneral title="Transaction Count" icon={<Hash />}>
                <p className="text-xl font-bold">{totalTransactions}</p>
                <p className="text-xs mb-1 text-muted-foreground">
                    {`${
                        props.transactions.filter((t) => t.amount > 0).length
                    } income, ${
                        props.transactions.filter((t) => t.amount < 0).length
                    } expenses`}
                </p>
                <p className="text-xl font-bold">{transactionsPerMonth}</p>
                <p className="text-xs text-muted-foreground">
                    {"Average transactions per month"}
                </p>
            </AnalyticsCardGeneral>

            <AnalyticsCardGeneral title="Avg Monthly Balance" icon={<Target />}>
                <div
                    className={`text-2xl font-bold ${
                        balanceLast12Months >= 0
                            ? "text-positive"
                            : "text-negative"
                    }`}
                >
                    {formatEuro(balanceLast12Months)}
                </div>
                <p className="text-xs text-muted-foreground">
                    Based on last 12 months
                </p>
            </AnalyticsCardGeneral>

            <AnalyticsCardGeneral title="Avg Monthly Balance" icon={<Target />}>
                <div
                    className={`text-2xl font-bold ${
                        avgBalanceLast6Months >= 0
                            ? "text-positive"
                            : "text-negative"
                    }`}
                >
                    {formatEuro(avgBalanceLast6Months)}
                </div>
                <p className="text-xs text-muted-foreground">
                    Based on last 6 months
                </p>
            </AnalyticsCardGeneral>
        </div>
    );
}
