"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Filter,
    Tag,
    ArrowRight,
    Calendar,
    DollarSign,
    Building,
} from "lucide-react";

export default function GuidePage() {
    return (
        <ScrollArea className="h-full">
            <div className="container mx-auto px-6 py-12 max-w-5xl">
                <div className="space-y-12">
                    {/* Filtering Section */}
                    <section className="space-y-8">
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="bg-primary rounded-full p-3">
                                    <Filter className="h-8 w-8 text-primary-foreground" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-semibold">
                                Transaction Filtering
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Filters help you find specific transactions
                                quickly by setting criteria based on transaction
                                attributes.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <Card className="border-blue-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-blue-300">
                                        <Calendar className="h-5 w-5" />
                                        Date Filtering
                                    </CardTitle>
                                    <CardDescription>
                                        Filter transactions by date ranges
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Create date ranges by adding two
                                        separate filters: one for "after" date
                                        and one for "before" date.
                                    </p>
                                    <div className="bg-blue-950/30 p-3 rounded-md border border-blue-800">
                                        <p className="text-sm font-medium mb-2">
                                            Example for January 2024:
                                        </p>
                                        <div className="space-y-1 text-xs">
                                            <p>
                                                <Badge
                                                    variant="outline"
                                                    className="border-blue-300 text-blue-300"
                                                >
                                                    bookingDate after 01.01.2024
                                                </Badge>
                                            </p>
                                            <p>
                                                <Badge
                                                    variant="outline"
                                                    className="border-blue-300 text-blue-300"
                                                >
                                                    bookingDate before
                                                    31.01.2024
                                                </Badge>
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Both conditions must be true to show
                                            transactions from January 2024
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-green-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-300">
                                        <DollarSign className="h-5 w-5" />
                                        Amount Filtering
                                    </CardTitle>
                                    <CardDescription>
                                        Filter by transaction amounts using
                                        operators
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Use comparison operators to find
                                        transactions above, below, or equal to
                                        specific amounts.
                                    </p>
                                    <div className="bg-green-950/30 p-3 rounded-md border border-green-800">
                                        <p className="text-sm font-medium mb-2">
                                            Available operators:
                                        </p>
                                        <div className="space-y-1 text-xs">
                                            <p>
                                                <code className="bg-background px-1 rounded">
                                                    &gt;
                                                </code>{" "}
                                                Greater than:{" "}
                                                <code>amount &gt; 100</code>
                                            </p>
                                            <p>
                                                <code className="bg-background px-1 rounded">
                                                    &lt;
                                                </code>{" "}
                                                Less than:{" "}
                                                <code>amount &lt; 50</code>
                                            </p>
                                            <p>
                                                <code className="bg-background px-1 rounded">
                                                    =
                                                </code>{" "}
                                                Equal to:{" "}
                                                <code>amount = 25.99</code>
                                            </p>
                                            <p>
                                                <code className="bg-background px-1 rounded">
                                                    &gt;=
                                                </code>{" "}
                                                Greater or equal:{" "}
                                                <code>amount &gt;= 100</code>
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-purple-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-purple-300">
                                        <Building className="h-5 w-5" />
                                        Text Filtering
                                    </CardTitle>
                                    <CardDescription>
                                        Filter by merchant names, descriptions,
                                        or other text fields
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        <strong className="text-purple-300">
                                            Capitalization is ignored when
                                            matching.
                                        </strong>{" "}
                                        Search within text fields like payment
                                        participant, purpose, or transaction
                                        type.
                                    </p>
                                    <div className="bg-purple-950/30 p-3 rounded-md border border-purple-800">
                                        <p className="text-sm font-medium mb-2">
                                            Example filters:
                                        </p>
                                        <div className="space-y-1 text-xs">
                                            <p>
                                                <Badge
                                                    variant="outline"
                                                    className="border-purple-300 text-purple-300"
                                                >
                                                    paymentParticipant includes
                                                    "grocery"
                                                </Badge>
                                            </p>
                                            <p>
                                                <Badge
                                                    variant="outline"
                                                    className="border-purple-300 text-purple-300"
                                                >
                                                    transactionType = "sepa"
                                                </Badge>
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            "grocery" matches "GROCERY",
                                            "Grocery Store", "grocery-mart",
                                            etc.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Category Creation Section */}
                    <section className="space-y-8">
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="bg-primary rounded-full p-3">
                                    <Tag className="h-8 w-8 text-primary-foreground" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-semibold">
                                Category Creation & Pattern Matching
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Create rules to automatically categorize
                                transactions based on patterns in your
                                transaction data.
                            </p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    How Categorization Rules Work
                                </CardTitle>
                                <CardDescription>
                                    Rules automatically assign categories to
                                    matching transactions
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="text-center space-y-2">
                                        <div className="bg-blue-950/30 rounded-lg p-4 border border-blue-800">
                                            <Filter className="h-6 w-6 mx-auto text-blue-400" />
                                        </div>
                                        <h4 className="font-medium">
                                            1. Find Pattern
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Identify common elements in similar
                                            transactions
                                        </p>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <div className="bg-green-950/30 rounded-lg p-4 border border-green-800">
                                            <Tag className="h-6 w-6 mx-auto text-green-400" />
                                        </div>
                                        <h4 className="font-medium">
                                            2. Create Rule
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Define matching criteria and assign
                                            category
                                        </p>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <div className="bg-purple-950/30 rounded-lg p-4 border border-purple-800">
                                            <ArrowRight className="h-6 w-6 mx-auto text-purple-400" />
                                        </div>
                                        <h4 className="font-medium">
                                            3. Auto-Apply
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Rule automatically categorizes
                                            matching transactions
                                        </p>
                                    </div>
                                </div>

                                <Card className="bg-amber-950/30 p-4 rounded-md border border-amber-800">
                                    <CardContent className="p-4">
                                        <p className="text-sm font-medium mb-2 text-amber-200">
                                            Important: How Multiple Conditions
                                            Work
                                        </p>
                                        <p className="text-sm text-amber-300">
                                            When you add multiple conditions to
                                            a rule,{" "}
                                            <strong>
                                                all conditions must be true
                                            </strong>{" "}
                                            for a transaction to match. This is
                                            called "additive" filtering - each
                                            condition narrows down the results
                                            further.
                                        </p>
                                        <div className="mt-3 p-2 bg-amber-900/50 rounded text-xs text-amber-200">
                                            Example: paymentParticipant includes
                                            "AMAZON" <strong>AND</strong> amount
                                            &gt; 50 <strong>AND</strong> purpose
                                            includes "PRIME"
                                            <br />→ Only matches Amazon
                                            transactions over €50 that mention
                                            "PRIME"
                                        </div>
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="border-green-800">
                                <CardHeader>
                                    <CardTitle className="text-green-300">
                                        Example: Grocery Store Rule
                                    </CardTitle>
                                    <CardDescription>
                                        Automatically categorize grocery store
                                        purchases
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-muted p-4 rounded-md">
                                        <p className="text-sm font-medium mb-3">
                                            Sample Transaction:
                                        </p>
                                        <div className="space-y-1 text-xs">
                                            <p>
                                                <span className="font-medium">
                                                    Payment Participant:
                                                </span>{" "}
                                                REWE MARKT GMBH
                                            </p>
                                            <p>
                                                <span className="font-medium">
                                                    Amount:
                                                </span>{" "}
                                                -45.67
                                            </p>
                                            <p>
                                                <span className="font-medium">
                                                    Purpose:
                                                </span>{" "}
                                                KARTENZAHLUNG
                                            </p>
                                            <p>
                                                <span className="font-medium">
                                                    Date:
                                                </span>{" "}
                                                15.03.2024
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-green-950/30 p-4 rounded-md border border-green-800">
                                        <p className="text-sm font-medium mb-3 text-green-200">
                                            Rule Configuration:
                                        </p>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-green-300">
                                                    Field:
                                                </span>
                                                <Badge variant="secondary">
                                                    paymentParticipant
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-green-300">
                                                    Operator:
                                                </span>
                                                <Badge variant="secondary">
                                                    includes
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-green-300">
                                                    Value:
                                                </span>
                                                <Badge variant="secondary">
                                                    "REWE"
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-green-300">
                                                    Category:
                                                </span>
                                                <Badge className="bg-green-600 hover:bg-green-700">
                                                    food
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-green-300">
                                                    Subcategory:
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="border-green-400 text-green-300"
                                                >
                                                    supermarket
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-blue-800">
                                <CardHeader>
                                    <CardTitle className="text-blue-300">
                                        Example: Salary Rule
                                    </CardTitle>
                                    <CardDescription>
                                        Automatically categorize salary payments
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-muted p-4 rounded-md">
                                        <p className="text-sm font-medium mb-3">
                                            Sample Transaction:
                                        </p>
                                        <div className="space-y-1 text-xs">
                                            <p>
                                                <span className="font-medium">
                                                    Payment Participant:
                                                </span>{" "}
                                                TELEKOM DEUTSCHLAND GMBH
                                            </p>
                                            <p>
                                                <span className="font-medium">
                                                    Amount:
                                                </span>{" "}
                                                +3500.00
                                            </p>
                                            <p>
                                                <span className="font-medium">
                                                    Purpose:
                                                </span>{" "}
                                                GEHALT MÄRZ 2024
                                            </p>
                                            <p>
                                                <span className="font-medium">
                                                    Date:
                                                </span>{" "}
                                                01.03.2024
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-blue-950/30 p-4 rounded-md border border-blue-800">
                                        <p className="text-sm font-medium mb-3 text-blue-200">
                                            Rule Configuration:
                                        </p>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-blue-300">
                                                    Field:
                                                </span>
                                                <Badge variant="secondary">
                                                    purpose
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-blue-300">
                                                    Operator:
                                                </span>
                                                <Badge variant="secondary">
                                                    includes
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-blue-300">
                                                    Value:
                                                </span>
                                                <Badge variant="secondary">
                                                    "GEHALT"
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-blue-300">
                                                    Category:
                                                </span>
                                                <Badge className="bg-blue-600 hover:bg-blue-700">
                                                    income
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-blue-300">
                                                    Subcategory:
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="border-blue-400 text-blue-300"
                                                >
                                                    telekom
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Advanced Pattern Matching Tips
                                </CardTitle>
                                <CardDescription>
                                    Get the most out of your categorization
                                    rules
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <h4 className="font-medium">
                                        Best Practices:
                                    </h4>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li>
                                            •{" "}
                                            <strong>
                                                Be as specific as possible
                                            </strong>{" "}
                                            - precise rules ensure future
                                            transactions are categorized
                                            correctly
                                        </li>
                                        <li>
                                            •{" "}
                                            <strong>
                                                Avoid overlapping patterns
                                            </strong>{" "}
                                            - make sure only one category
                                            applies to any given transaction
                                        </li>
                                        <li>
                                            •{" "}
                                            <strong>
                                                Ignore internal transactions
                                            </strong>{" "}
                                            - skip transfers between your own
                                            accounts (e.g., checking to savings)
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </ScrollArea>
    );
}
