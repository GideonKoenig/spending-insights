import { AnalyticsCardGeneral } from "@/components/analytics/analytics-card-general";
import { type Summary } from "@/components/analytics/analytics-card-summary";
import { Transaction } from "@/lib/types";
import { formatEuro } from "@/lib/utils";
import { BarChart3, Hash, Target } from "lucide-react";

// Todo: The Analytics have to be refined, to properly handle "Umbuchungen und Überweisungsgutschr. and the graph needs to somehow display the full balance, which is a little harder to do."
// Todo: maybe this should be handled through the "categories..."
// maybe it should be called tag instead of category, as i want to Tag the transactions with more additional infor like detailed typisation (rewe, edeka, etc) and specific rules for how to handle the graphs for them.

// Todo: next step after this is categories
// Todo: then the fancy graph from Finanzfluss, to see what is spend when (with a nice month or year picker)

// Todo: also create a input reader for splitwise data -> the current mapper is not strong enough. its not enough to just map the headers, but rather each element should get mapped.

// Todo: when i have to much free time, after everything else is done, i should do some burn down chart analysis for the performance, especially for the analytics page.

export function AnalyticsHeader(props: {
    transactions: Transaction[];
    monthSummaries: Summary[];
    yearSummaries: Summary[];
}) {
    const totalIncome = props.transactions
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = props.transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalTransactions = props.transactions.length;

    const balanceLast12Months =
        props.monthSummaries
            .slice(0, 12)
            .reduce((sum, month) => sum + month.income - month.expense, 0) / 12;
    const avgYearlyBalance =
        props.yearSummaries.reduce(
            (sum, year) => sum + year.income - year.expense,
            0
        ) / props.yearSummaries.length;

    const sortedTransactions = props.transactions.sort(
        (a, b) => b.bookingDate.getTime() - a.bookingDate.getTime()
    );
    const dateRangeMs =
        sortedTransactions[0]?.bookingDate.getTime() -
        sortedTransactions[
            sortedTransactions.length - 1
        ]?.bookingDate.getTime();
    const monthsInRange = Math.max(dateRangeMs / (1000 * 60 * 60 * 24 * 30), 1);
    const transactionsPerMonth = Math.round(
        props.transactions.length / monthsInRange
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

            <AnalyticsCardGeneral title="Avg Yearly Balance" icon={<Target />}>
                <div
                    className={`text-2xl font-bold ${
                        avgYearlyBalance >= 0
                            ? "text-positive"
                            : "text-negative"
                    }`}
                >
                    {formatEuro(avgYearlyBalance)}
                </div>
                <p className="text-xs text-muted-foreground">
                    Based on {props.yearSummaries.length} year
                    {props.yearSummaries.length !== 1 ? "s" : ""}
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
        </div>
    );
}
