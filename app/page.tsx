"use client";

import Link from "next/link";
import { usePlausible } from "next-plausible";
import { PlausibleEvents } from "@/lib/plausible-events";
import {
    ArrowRight,
    Database,
    Tag,
    TrendingUp,
    Shield,
    FileSpreadsheet,
    Filter,
    BarChart3,
    Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
    const plausible = usePlausible<PlausibleEvents>();

    const downloadSampleData = () => {
        plausible("download-sample-data");
        const link = document.createElement("a");
        link.href = "/sample-transactions.csv";
        link.download = "sample-transactions.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <ScrollArea className="h-full">
            <div className="container mx-auto px-6 py-12 max-w-4xl">
                <div className="space-y-12">
                    <section className="text-center space-y-6">
                        <h1 className="text-4xl font-bold">
                            Bank Transaction Analyzer
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Analyze your bank transactions locally in your
                            browser. Import CSV files and create rules to
                            automatically categorize your spending.
                        </p>
                    </section>

                    <section className="space-y-8">
                        <h2 className="text-2xl font-semibold text-center">
                            What you need to do
                        </h2>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileSpreadsheet className="h-5 w-5" />
                                        0. Get Your Data
                                    </CardTitle>
                                    <CardDescription>
                                        Download transaction data from your bank
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <p className="text-sm text-muted-foreground flex-1">
                                            Most online banking providers offer
                                            the ability to export your
                                            transaction history as CSV files.
                                            Don&apos;t have your own data yet?
                                            <span className="font-medium text-foreground">
                                                {" "}
                                                Explore the app using our sample
                                                dataset.
                                            </span>
                                        </p>
                                        <Button
                                            onClick={downloadSampleData}
                                            variant="outline"
                                            className="shrink-0 sm:ml-4"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Try Sample Data
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid gap-6 md:grid-cols-3">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Database className="h-5 w-5" />
                                            1. Load Data
                                        </CardTitle>
                                        <CardDescription>
                                            Import your transaction CSV files
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            Select your bank statement CSV
                                            files. The data will be stored in
                                            your browser&apos;s local storage
                                            for future use.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Tag className="h-5 w-5" />
                                            2. Create Rules
                                        </CardTitle>
                                        <CardDescription>
                                            Set up categorization rules
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            Define rules based on merchant
                                            names, amounts, or descriptions to
                                            automatically categorize similar
                                            transactions.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            3. Analyze Spending
                                        </CardTitle>
                                        <CardDescription>
                                            Review your spending patterns
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            View categorized transactions and
                                            analytics to understand your
                                            spending habits over time.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>

                    <section className="text-center space-y-6">
                        <p className="text-sm text-muted-foreground">
                            {`You can load data from the Transactions page or use the "Load Data" option in the Actions menu at the top.`}
                        </p>

                        <div className="flex justify-center gap-4">
                            <Button
                                asChild
                                size="lg"
                                onClick={() => plausible("get-started")}
                            >
                                <Link href="/transactions">
                                    Get Started
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                onClick={() => plausible("learn-more")}
                            >
                                <Link href="/guide">Learn More</Link>
                            </Button>
                        </div>
                    </section>

                    <div className="bg-card border border-border rounded-lg p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-primary rounded-full p-4">
                                <Shield className="h-12 w-12 text-primary-foreground" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-semibold mb-4">Privacy</h3>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            {`Your financial data stays completely private. Everything runs locally in your browser - no servers, no uploads, no accounts needed. Your transaction data and categorization rules are stored safely in your browser's local storage.`}
                        </p>
                    </div>

                    <section className="space-y-8">
                        <h2 className="text-2xl font-semibold text-center">
                            All Features
                        </h2>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="border-emerald-800/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-emerald-300">
                                        <Shield className="h-5 w-5" />
                                        Free & Open Access
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-sm">
                                        • Completely free to use forever
                                    </p>
                                    <p className="text-sm">
                                        • No account registration required
                                    </p>
                                    <p className="text-sm">
                                        • No login or sign-up process
                                    </p>
                                    <p className="text-sm">
                                        • Start analyzing immediately
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-blue-800/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-blue-300">
                                        <FileSpreadsheet className="h-5 w-5" />
                                        Transaction Management
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-sm">
                                        • Import bank transaction CSV files
                                    </p>
                                    <p className="text-sm">
                                        • Support for multiple bank accounts
                                    </p>
                                    <p className="text-sm">
                                        • View transactions in organized lists
                                    </p>
                                    <p className="text-sm">
                                        • Persistent storage in your browser
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-green-800/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-300">
                                        <Tag className="h-5 w-5" />
                                        Smart Categorization
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-sm">
                                        • Create custom categorization rules
                                    </p>
                                    <p className="text-sm">
                                        • Automatic transaction tagging
                                    </p>
                                    <p className="text-sm">
                                        • 15 predefined spending categories
                                    </p>
                                    <p className="text-sm">
                                        • Pattern matching on any field
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-amber-800/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-amber-300">
                                        <BarChart3 className="h-5 w-5" />
                                        Analytics & Insights
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-sm">
                                        • Interactive spending charts
                                    </p>
                                    <p className="text-sm">
                                        • Category breakdown analysis
                                    </p>
                                    <p className="text-sm">
                                        • Time-based spending trends
                                    </p>
                                    <p className="text-sm">
                                        • Visual pattern recognition
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-purple-800/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-purple-300">
                                        <Filter className="h-5 w-5" />
                                        Advanced Search & Filtering
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-sm">
                                        • Filter by date ranges and amounts
                                    </p>
                                    <p className="text-sm">
                                        • Search by merchant or description
                                    </p>
                                    <p className="text-sm">
                                        • Multiple filter operators
                                    </p>
                                    <p className="text-sm">
                                        • Combine filters for precise results
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-cyan-800/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-cyan-300">
                                        <Download className="h-5 w-5" />
                                        Backup & Sharing
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-sm">
                                        • Export your data and rules
                                    </p>
                                    <p className="text-sm">
                                        • Import from backup files
                                    </p>
                                    <p className="text-sm">
                                        • Share categorization rules
                                    </p>
                                    <p className="text-sm">
                                        • Multi-account management
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                </div>
            </div>
        </ScrollArea>
    );
}
