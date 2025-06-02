import { Summary } from "@/components/analytics-card-summary";
import { Transaction } from "@/lib/types";

export function summarize(
    transactions: Transaction[],
    mode: "monthly" | "yearly"
): Summary[] {
    const summaries = transactions
        .map((t) => ({ amount: t.amount, bookingDate: t.bookingDate }))
        .reduce((acc, curr) => {
            const month = curr.bookingDate.toLocaleDateString("en-US", {
                month: "long",
            });
            const year = curr.bookingDate.toLocaleDateString("en-US", {
                year: "numeric",
            });
            const title = mode === "monthly" ? `${month} ${year}` : year;
            const isPositive = curr.amount > 0;
            const amount = Math.abs(curr.amount);

            const existing = acc.find((item) => item.title === title);
            if (existing) {
                existing.income += isPositive ? amount : 0;
                existing.expense += !isPositive ? amount : 0;
            } else {
                acc.push({
                    title,
                    income: isPositive ? amount : 0,
                    expense: !isPositive ? amount : 0,
                    average: 0,
                });
            }

            return acc;
        }, [] as Summary[]);

    const sum = summaries.reduce(
        (acc, curr) => acc + curr.income - curr.expense,
        0
    );
    const average = sum / summaries.length;

    return summaries.map((summary) => ({ ...summary, average }));
}
