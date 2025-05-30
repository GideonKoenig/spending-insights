"use client";

import { useData } from "@/contexts/data-provider";
import { FileSelector } from "@/components/file-selector";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { BarChart3, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { categorizeTransactions } from "@/lib/pattern-matcher";

export default function AnalyticsPage() {
    const { fileHandle, hasPermission, transactions, patterns } = useData();

    const categorizedTransactions = categorizeTransactions(
        transactions,
        patterns
    );

    if (!fileHandle || !hasPermission) {
        return <FileSelector />;
    }

    const totalTransactions = transactions.length;
    const totalIncome = transactions
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const categorizedCount = categorizedTransactions.size;

    return (
        <main className="h-full overflow-auto">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold">Analytics</h1>
                        <p className="text-muted-foreground">
                            Overview of your transaction data and spending
                            patterns
                        </p>
                    </div>

                    <div className="grid grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Transactions
                                </CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {totalTransactions}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {categorizedCount} categorized
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Income
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    +{totalIncome.toFixed(2)} EUR
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    From{" "}
                                    {
                                        transactions.filter((t) => t.amount > 0)
                                            .length
                                    }{" "}
                                    transactions
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Expenses
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    -{totalExpenses.toFixed(2)} EUR
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    From{" "}
                                    {
                                        transactions.filter((t) => t.amount < 0)
                                            .length
                                    }{" "}
                                    transactions
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Net Balance
                                </CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`text-2xl font-bold ${
                                        totalIncome - totalExpenses >= 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {totalIncome - totalExpenses >= 0
                                        ? "+"
                                        : ""}
                                    {(totalIncome - totalExpenses).toFixed(2)}{" "}
                                    EUR
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Income minus expenses
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Coming Soon</CardTitle>
                            <CardDescription>
                                Advanced analytics and visualizations will be
                                available here
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="py-12">
                            <div className="text-center text-muted-foreground">
                                <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                                <p>
                                    Charts and graphs for spending patterns,
                                    category breakdowns, and trends over time
                                    will be implemented here.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    );
}
