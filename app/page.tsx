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

    const steps = [
        {
            icon: FileSpreadsheet,
            title: "0. Get Your Data",
            description: "Download transaction data from your bank",
            content: (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground flex-1">
                        {
                            "Most online banking providers offer the ability to export your transaction history as CSV files. Don't have your own data yet? "
                        }
                        <span className="font-medium text-foreground">
                            Explore the app using our sample dataset.
                        </span>
                    </p>
                    <Button
                        onClick={downloadSampleData}
                        variant="outline"
                        className="shrink-0 sm:ml-4"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        {"Try Sample Data"}
                    </Button>
                </div>
            ),
        },
        {
            icon: Database,
            title: "1. Load Data",
            description: "Import your transaction CSV files",
            content: (
                <p className="text-sm text-muted-foreground">
                    Select your bank statement CSV files. The data will be
                    stored in your browser&apos;s local storage for future use.
                </p>
            ),
        },
        {
            icon: Tag,
            title: "2. Create Rules",
            description: "Set up categorization rules",
            content: (
                <p className="text-sm text-muted-foreground">
                    Define rules based on merchant names, amounts, or
                    descriptions to automatically categorize similar
                    transactions.
                </p>
            ),
        },
        {
            icon: TrendingUp,
            title: "3. Analyze Spending",
            description: "Review your spending patterns",
            content: (
                <p className="text-sm text-muted-foreground">
                    View categorized transactions and analytics to understand
                    your spending habits over time.
                </p>
            ),
        },
    ];

    const features = [
        {
            icon: Shield,
            title: "Free & Open Access",
            description:
                "Completely free, no account needed. Start analyzing immediately.",
            items: [
                "Completely free to use forever",
                "No account registration required",
                "No login or sign-up process",
                "Start analyzing immediately",
            ],
            gradient: "from-emerald-300 via-emerald-400 to-emerald-500",
            text: "text-emerald-100",
            glow: "rgba(52, 211, 153, 0.75)",
        },
        {
            icon: FileSpreadsheet,
            title: "Transaction Management",
            description:
                "Import, view, and manage transactions from multiple accounts.",
            items: [
                "Import bank transaction CSV files",
                "Support for multiple bank accounts",
                "View transactions in organized lists",
                "Persistent storage in your browser",
            ],
            gradient: "from-blue-300 via-blue-400 to-blue-500",
            text: "text-blue-100",
            glow: "rgba(59, 130, 246, 0.75)",
        },
        {
            icon: Tag,
            title: "Smart Categorization",
            description:
                "Create custom rules for automatic transaction tagging.",
            items: [
                "Create custom categorization rules",
                "Automatic transaction tagging",
                "15 predefined spending categories",
                "Pattern matching on any field",
            ],
            gradient: "from-pink-300 via-pink-400 to-pink-500",
            text: "text-pink-100",
            glow: "rgba(236, 72, 153, 0.75)",
        },
        {
            icon: BarChart3,
            title: "Analytics & Insights",
            description:
                "Interactive charts and visualizations to understand your spending.",
            items: [
                "Interactive spending charts",
                "Category breakdown analysis",
                "Time-based spending trends",
                "Visual pattern recognition",
            ],
            gradient: "from-amber-300 via-amber-400 to-amber-500",
            text: "text-amber-100",
            glow: "rgba(251, 191, 36, 0.75)",
        },
        {
            icon: Filter,
            title: "Advanced Search & Filtering",
            description:
                "Find exactly what you're looking for with powerful filters.",
            items: [
                "Filter by date ranges and amounts",
                "Search by merchant or description",
                "Multiple filter operators",
                "Combine filters for precise results",
            ],
            gradient: "from-purple-300 via-purple-400 to-purple-500",
            text: "text-purple-100",
            glow: "rgba(168, 85, 247, 0.75)",
        },
        {
            icon: Download,
            title: "Backup & Sharing",
            description: "Export your data and rules, or import from a backup.",
            items: [
                "Export your data and rules",
                "Import from backup files",
                "Share categorization rules",
                "Multi-account management",
            ],
            gradient: "from-cyan-300 via-cyan-400 to-cyan-500",
            text: "text-cyan-100",
            glow: "rgba(34, 211, 238, 0.75)",
        },
    ];

    return (
        <ScrollArea className="h-full ">
            <div className="bg-gradient-to-b from-primary/20 to-background bg-[length:100%_20%] bg-no-repeat">
                <div className="flex flex-col max-w-5xl mx-auto gap-12 py-24">
                    <section className="flex flex-col items-center gap-8 text-center p-8">
                        <h1 className="text-5xl font-bold leading-tight">
                            {"Understand your spending at a glance"}
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-3xl mx-auto ">
                            {
                                "Analyze your bank transactions locally and securely in your browser. Import CSV files, set up smart rules and instantly see where your money goes."
                            }
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

                    <section className="max-w-3xl mx-auto p-8 w-full">
                        <h2 className="text-3xl font-bold text-center mb-12">
                            How It Works
                        </h2>
                        <div className="relative flex flex-col gap-10">
                            <div
                                className="absolute left-6 top-6 h-[calc(100%-6rem)] w-px bg-border"
                                aria-hidden="true"
                            />
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <div
                                        key={index}
                                        className="flex items-start gap-6 relative"
                                    >
                                        <div className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-background border text-primary shrink-0">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="relative flex-grow pt-1">
                                            <h3 className="text-xl font-semibold">
                                                {step.title}
                                            </h3>
                                            <p className="text-muted-foreground mt-1">
                                                {step.description}
                                            </p>
                                            <div className="mt-4">
                                                {step.content}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="p-8 max-w-4xl mx-auto">
                        <div className="bg-card border  border-border rounded-lg p-8 flex flex-col items-center justify-center text-center gap-4">
                            <Shield className="h-20 w-20 text-primary-foreground bg-primary rounded-full p-4" />
                            <h3 className="text-2xl font-semibold">Privacy</h3>
                            <p className="text-muted-foreground">
                                {`Your financial data stays completely private. Everything runs locally in your browser - no servers, no uploads, no accounts needed. Your transaction data and categorization rules are stored safely in your browser's local storage.`}
                            </p>
                        </div>
                    </section>

                    <section className="max-w-5xl w-full mx-auto p-8">
                        <h2 className="text-3xl font-bold text-center mb-12">
                            Powerful Features for Total Control
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 auto-rows-fr">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={index}
                                        className="relative group cursor-pointer w-full h-full"
                                        onMouseMove={(e) => {
                                            const card = e.currentTarget;
                                            const rect =
                                                card.getBoundingClientRect();
                                            const x = e.clientX - rect.left;
                                            const y = e.clientY - rect.top;
                                            const rotateX =
                                                (-(y - rect.height / 2) / 15) *
                                                0.6;
                                            const rotateY =
                                                ((x - rect.width / 2) / 15) *
                                                0.5;
                                            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                                        }}
                                        onMouseLeave={(e) => {
                                            const card = e.currentTarget;
                                            card.style.transform =
                                                "perspective(800px) rotateX(0deg) rotateY(0deg)";
                                        }}
                                    >
                                        <div
                                            className={`relative h-full p-[2px] rounded-xl bg-gradient-to-br ${feature.gradient} transition-shadow`}
                                            style={{
                                                boxShadow: `0 0 25px ${feature.glow}`,
                                            }}
                                        >
                                            <Card className="rounded-[12px] w-full h-full bg-background/90 backdrop-blur-md">
                                                <CardHeader className="items-center text-center">
                                                    <CardTitle
                                                        className={`flex items-center justify-center gap-3 font-semibold ${feature.text}`}
                                                    >
                                                        <Icon className="w-7 h-7" />
                                                        {feature.title}
                                                    </CardTitle>
                                                    <CardDescription className="pt-2 text-foreground/70">
                                                        {feature.description}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="px-6 pb-6">
                                                    <div className="flex justify-center w-full">
                                                        <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground text-left">
                                                            {feature.items.map(
                                                                (item, i) => (
                                                                    <li key={i}>
                                                                        {item}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>
        </ScrollArea>
    );
}
