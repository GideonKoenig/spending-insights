"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TransactionCard } from "@/components/transactions/transaction-card";
import {
    ArrowRight,
    BarChart,
    Building,
    Calendar,
    Check,
    DollarSign,
    Filter,
    Github,
    Info,
    Merge,
    OctagonX,
    Plus,
    Send,
    Tag,
    TriangleAlert,
    Upload,
} from "lucide-react";
import Link from "next/link";
import { Transaction } from "@/lib/types";

const groceryTransaction: Transaction = {
    hash: "1",
    amount: -45.67,
    balanceAfterTransaction: 1000.0,
    currency: "EUR",
    bookingDate: new Date("2024-03-15"),
    valueDate: new Date("2024-03-15"),
    participantName: "REWE MARKT GMBH",
    participantIban: "DE87100100100123456789",
    participantBic: "PBNKDEFF",
    purpose: "Kartenzahlung 14.03.2024 19:45 Uhr",
    transactionType: "Sepa",
    tag: {
        category: "food",
        subCategory: "Groceries",
        ruleId: "groceries-rule",
    },
};

const salaryTransaction: Transaction = {
    hash: "2",
    amount: 3500.0,
    balanceAfterTransaction: 4500.0,
    currency: "EUR",
    bookingDate: new Date("2024-03-01"),
    valueDate: new Date("2024-03-01"),
    participantName: "Musterfirma GmbH",
    participantIban: "DE91100100100987654321",
    participantBic: "PBNKDEFF",
    purpose: "Gehalt/Salary 03/24 Ref. 12345",
    transactionType: "Sepa",
    tag: {
        category: "income",
        subCategory: "Salary",
        ruleId: "salary-rule",
    },
};

const FilterBadge = ({
    field,
    operator,
    value,
}: {
    field: string;
    operator: string;
    value: string;
}) => (
    <div className="inline-flex items-center gap-px">
        <span className="bg-primary text-primary-foreground rounded-l-md p-1 px-3 text-xs font-medium">
            {field}
        </span>
        <span className="bg-primary text-primary-foreground p-1 px-3 text-xs font-medium">
            {operator}
        </span>
        <span className="bg-primary text-primary-foreground rounded-r-md p-1 px-3 text-xs font-medium">
            {value}
        </span>
    </div>
);

export default function GuidePage() {
    return (
        <ScrollArea className="h-full">
            <div className="container mx-auto max-w-5xl px-6 py-12">
                <div className="space-y-20">
                    {/* Section 0: Notifications */}
                    <section className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="inline-block rounded-full bg-primary p-3">
                                    <Info className="h-7 w-7 text-primary-foreground" />
                                </div>
                                <h2 className="text-3xl font-semibold">
                                    Understanding Notifications
                                </h2>
                            </div>
                            <p className="text-lg text-muted-foreground pl-16">
                                The application uses notifications to keep you
                                informed. You will see them appear at the top
                                right.
                            </p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 ml-16">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-amber-400">
                                        <TriangleAlert className="h-5 w-5" />
                                        Warnings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Warnings inform you about potential
                                        issues that do not stop the application
                                        from working. For example, you might see
                                        a warning if you try to create a rule
                                        without selecting a category first.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-red-400">
                                        <OctagonX className="h-5 w-5" />
                                        Errors
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Errors indicate that something went
                                        wrong and a specific action could not be
                                        completed. For example, an error will
                                        appear if a data file fails to upload or
                                        process correctly.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Section 1: Getting Started */}
                    <section className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="inline-block rounded-full bg-primary p-3">
                                    <Upload className="h-7 w-7 text-primary-foreground" />
                                </div>
                                <h2 className="text-3xl font-semibold">
                                    1. The Data Loading Process
                                </h2>
                            </div>
                            <p className="text-lg text-muted-foreground pl-16">
                                To begin, upload a CSV file of your transaction
                                history. The application will automatically try
                                to detect the format.
                            </p>
                        </div>
                        <div className="ml-16 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Format Detection & Supported Banks
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        The application detects the bank format
                                        by analyzing the headers in your CSV
                                        file. The following formats are
                                        currently supported:
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {[
                                            "Arvest",
                                            "Comdirect",
                                            "Commerzbank",
                                            "Consors",
                                            "DKB",
                                            "ING",
                                            "Wespac",
                                            "Mint",
                                            "Sparkasse",
                                            "Volksbanken / Raiffeisenbanken",
                                            "Postbank",
                                            "Targobank",
                                        ].map((bank) => (
                                            <div
                                                key={bank}
                                                className="flex items-center gap-2"
                                            >
                                                <Check className="h-4 w-4 text-green-500" />
                                                <span className="text-sm text-muted-foreground">
                                                    {bank}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>File Actions</CardTitle>
                                    <CardDescription>
                                        After uploading a file, you have several
                                        options for how to handle the data.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-500/10 text-blue-500 rounded-full p-2">
                                            <Plus className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">
                                                Add
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Creates a new, separate account.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-purple-500/10 text-purple-500 rounded-full p-2">
                                            <Merge className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">
                                                Merge
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Combines transactions into an
                                                existing account.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-amber-500/10 text-amber-500 rounded-full p-2">
                                            <Send className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">
                                                Notify Developer
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {
                                                    "If your format isn't supported, sends file structure and strongly anonymized sample data to the developer."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Section 2: Filtering */}
                    <section className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="inline-block rounded-full bg-primary p-3">
                                    <Filter className="h-7 w-7 text-primary-foreground" />
                                </div>
                                <h2 className="text-3xl font-semibold">
                                    2. How to Filter Transactions
                                </h2>
                            </div>
                            <p className="text-lg text-muted-foreground pl-16">
                                Filters help you find specific transactions. You
                                can filter by date, amount, or text fields.
                            </p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-3 ml-16">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-blue-400" />
                                        Date Filtering
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Use two filters to set a start and end
                                        date.
                                    </p>
                                    <div className="space-y-2">
                                        <FilterBadge
                                            field="Date"
                                            operator="after"
                                            value="01.01.2024"
                                        />
                                        <FilterBadge
                                            field="Date"
                                            operator="before"
                                            value="31.01.2024"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-green-400" />
                                        Amount Filtering
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Easily find payments by filtering for
                                        specific amounts or ranges.
                                    </p>
                                    <div className="space-y-2">
                                        <FilterBadge
                                            field="Amount"
                                            operator=">"
                                            value="100.00"
                                        />
                                        <FilterBadge
                                            field="Amount"
                                            operator="<"
                                            value="50.00"
                                        />
                                        <FilterBadge
                                            field="Amount"
                                            operator="="
                                            value="25.99"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5 text-purple-400" />
                                        Text Filtering
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Search text fields (case-insensitive).
                                    </p>
                                    <div className="space-y-2">
                                        <FilterBadge
                                            field="Participant"
                                            operator="includes"
                                            value="rewe"
                                        />
                                        <FilterBadge
                                            field="Purpose"
                                            operator="contains"
                                            value="invoice"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Section 3: Category Creation */}
                    <section className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="inline-block rounded-full bg-primary p-3">
                                    <Tag className="h-7 w-7 text-primary-foreground" />
                                </div>
                                <h2 className="text-3xl font-semibold">
                                    3. Creating Categorization Rules
                                </h2>
                            </div>
                            <p className="text-lg text-muted-foreground pl-16">
                                A rule is a set of conditions that automatically
                                assigns a category to a transaction. A
                                transaction is categorized only if it meets all
                                conditions of a rule.
                            </p>
                        </div>
                        <div className="ml-16 space-y-8">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">
                                    Example: Groceries
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    This rule finds all expenses from the
                                    supermarket &quot;REWE&quot; and categorizes
                                    them as &quot;food&quot;.
                                </p>
                                <div className="grid md:grid-cols-5 gap-6">
                                    <div className="md:col-span-3">
                                        <TransactionCard
                                            transaction={groceryTransaction}
                                            className="h-full"
                                        />
                                    </div>
                                    <div className="border rounded-lg p-4 space-y-3 flex flex-col justify-center md:col-span-2">
                                        <h4 className="font-semibold text-sm">
                                            Conditions
                                        </h4>
                                        <div className="space-y-2">
                                            <FilterBadge
                                                field="Participant"
                                                operator="includes"
                                                value="rewe"
                                            />
                                            <FilterBadge
                                                field="Amount"
                                                operator="<"
                                                value="0"
                                            />
                                        </div>
                                        <div className="pt-2">
                                            <div className="flex items-center gap-2">
                                                <ArrowRight className="h-4 w-4" />
                                                <span className="font-semibold text-sm">
                                                    Category:
                                                </span>
                                                <span className="text-sm">
                                                    food
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 pl-6">
                                                <span className="text-xs text-muted-foreground">
                                                    Subcategory: Groceries
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">
                                    Example: Salary
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    This rule finds deposits from your employer
                                    containing the word &quot;Salary&quot; in
                                    the purpose field.
                                </p>
                                <div className="grid md:grid-cols-5 gap-6">
                                    <div className="md:col-span-3">
                                        <TransactionCard
                                            transaction={salaryTransaction}
                                            className="h-full"
                                        />
                                    </div>
                                    <div className="border rounded-lg p-4 space-y-3 flex flex-col justify-center md:col-span-2">
                                        <h4 className="font-semibold text-sm">
                                            Conditions
                                        </h4>
                                        <div className="space-y-2">
                                            <FilterBadge
                                                field="Participant"
                                                operator="includes"
                                                value="musterfirma"
                                            />
                                            <FilterBadge
                                                field="Purpose"
                                                operator="contains"
                                                value="salary"
                                            />
                                        </div>
                                        <div className="pt-2">
                                            <div className="flex items-center gap-2">
                                                <ArrowRight className="h-4 w-4" />
                                                <span className="font-semibold text-sm">
                                                    Category:
                                                </span>
                                                <span className="text-sm">
                                                    income
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 pl-6">
                                                <span className="text-xs text-muted-foreground">
                                                    Subcategory: Salary
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="ml-16">
                            <Card className="border-slate-600 bg-slate-950/30">
                                <CardHeader>
                                    <CardTitle className="text-slate-300 text-base">
                                        Tip: Make Your Rules Specific
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-400 text-sm">
                                        Aim to create rules that are specific
                                        enough to correctly categorize future
                                        transactions. A rule for
                                        &quot;Amazon&quot; might catch regular
                                        purchases and Prime subscriptions. To
                                        only categorize Prime payments, add
                                        another condition like{" "}
                                        <code>
                                            purpose includes &quot;Prime&quot;
                                        </code>
                                        . You could even add an amount filter
                                        for the specific subscription cost.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Section 4: Analytics */}
                    <section className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="inline-block rounded-full bg-primary p-3">
                                    <BarChart className="h-7 w-7 text-primary-foreground" />
                                </div>
                                <h2 className="text-3xl font-semibold">
                                    4. Using the Analytics Page
                                </h2>
                            </div>
                            <p className="text-lg text-muted-foreground pl-16">
                                Visualize your finances on the Analytics page.
                            </p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-3 ml-16">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Dashboard</CardTitle>
                                    <CardDescription>
                                        An overview of income vs. expenses and
                                        top spending categories.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Graphs</CardTitle>
                                    <CardDescription>
                                        Track spending over time and view
                                        category distributions.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Compare</CardTitle>
                                    <CardDescription>
                                        Compare spending between different time
                                        periods.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </section>
                </div>

                <footer className="mt-24 border-t pt-6 pb-4 text-center text-sm">
                    <p className="text-muted-foreground">
                        This is an open-source project. Contributions are
                        welcome!
                    </p>
                    <div className="mt-4">
                        <Link
                            href="https://github.com/GideonKoenig/spending-insights"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm font-medium hover:bg-muted/80"
                        >
                            <Github className="h-4 w-4" />
                            <span>spending-insights</span>
                        </Link>
                    </div>
                </footer>
            </div>
        </ScrollArea>
    );
}
