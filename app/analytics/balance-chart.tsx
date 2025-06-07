"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Account } from "@/lib/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useNotifications } from "@/contexts/notification/provider";
import { transformDatapoints } from "@/lib/analytics-tools/grouping";
import { formatDate } from "@/lib/analytics-tools/utilts";
import { handleResult } from "@/contexts/notification/utils";

const chartConfig = {
    balance: {
        label: "Balance",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

export function BalanceChart(props: { accounts: Account[] }) {
    const notificationContext = useNotifications();
    const transformResult = transformDatapoints(props.accounts);
    const chartData = handleResult(
        transformResult,
        "Transforming datapoints",
        notificationContext,
        []
    );

    const transactions = props.accounts.flatMap(
        (account) => account.transactions
    );

    const maxBalance = Math.max(...chartData.map((d) => d.balance));
    const yTicks = Array.from(
        { length: Math.ceil(maxBalance / 2000) + 1 },
        (_, i) => i * 2000
    );
    const xTicks = new Set(
        transactions
            .sort((a, b) => a.bookingDate.getTime() - b.bookingDate.getTime())
            .map((transaction) => {
                const date = transaction.bookingDate;
                return formatDate(date);
            })
    );

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
                            ticks={Array.from(xTicks)}
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
