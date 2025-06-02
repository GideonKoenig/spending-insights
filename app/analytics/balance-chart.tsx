"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Transaction } from "@/lib/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const DISPLAYED_TRANSACTIONS_PER_MONTH = 1000 as const;

type Datapoint = {
    date: string;
    balance: number;
    fullDate: Date;
};

const chartConfig = {
    balance: {
        label: "Balance",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

export function BalanceChart(props: { transactions: Transaction[] }) {
    const chartData = props.transactions
        .sort((a, b) => a.bookingDate.getTime() - b.bookingDate.getTime())
        .map(
            (transaction) =>
                ({
                    date:
                        transaction.bookingDate.toLocaleDateString("en-US", {
                            month: "short",
                        }) +
                        " " +
                        transaction.bookingDate
                            .getFullYear()
                            .toString()
                            .slice(-2),
                    balance: transaction.balanceAfterTransaction,
                    fullDate: transaction.bookingDate,
                } as Datapoint)
        )
        .reduce((groups, datapoint) => {
            const existing = groups.find(
                (group) => group.length > 0 && group[0].date === datapoint.date
            );
            if (existing) {
                existing.push(datapoint);
            } else {
                groups.push([datapoint]);
            }
            return groups;
        }, [] as Datapoint[][])
        .map((group) => {
            if (group.length <= DISPLAYED_TRANSACTIONS_PER_MONTH) return group;
            const step = Math.ceil(
                group.length / DISPLAYED_TRANSACTIONS_PER_MONTH
            );
            return group.filter(
                (_, index) =>
                    index % step === 0 ||
                    index === 0 ||
                    index === group.length - 1
            );
        })
        .flat();

    const yTicks = Array.from(
        {
            length:
                Math.ceil(Math.max(...chartData.map((d) => d.balance)) / 2000) +
                1,
        },
        (_, i) => i * 2000
    );

    const xTicks = props.transactions
        .sort((a, b) => a.bookingDate.getTime() - b.bookingDate.getTime())
        .reduce((acc, transaction) => {
            const tick =
                transaction.bookingDate.toLocaleDateString("en-US", {
                    month: "short",
                }) +
                " " +
                transaction.bookingDate.getFullYear().toString().slice(-2);
            return acc.includes(tick) ? acc : [...acc, tick];
        }, [] as string[]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Balance Over Time</CardTitle>
                <CardDescription>
                    Your account balance progression based on transaction
                    history
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="min-h-[400px] w-full"
                >
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            ticks={xTicks}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => {
                                const monthPart = value.split(" ")[0];
                                return ["Jan", "Apr", "Jul", "Oct"].includes(
                                    monthPart
                                )
                                    ? value
                                    : "";
                            }}
                        />
                        <YAxis
                            ticks={yTicks}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) =>
                                Math.round(value).toLocaleString("de-DE")
                            }
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value, payload) => {
                                        if (
                                            payload &&
                                            payload[0] &&
                                            payload[0].payload
                                        ) {
                                            return payload[0].payload.fullDate.toLocaleDateString(
                                                "en-US",
                                                {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                }
                                            );
                                        }
                                        return value;
                                    }}
                                    formatter={(value) => [
                                        Math.round(
                                            Number(value)
                                        ).toLocaleString("de-DE") + " EUR",
                                        "",
                                    ]}
                                />
                            }
                        />
                        <Line
                            dataKey="balance"
                            type="monotone"
                            stroke="var(--color-balance)"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                                r: 4,
                                stroke: "var(--color-balance)",
                                strokeWidth: 2,
                                fill: "var(--background)",
                            }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
