import type { Metadata } from "next";
import { SmallScreenGuard } from "@/components/small-screen-guard";

export const metadata: Metadata = {
    title: "Transaction List | Spending Insights",
    alternates: {
        canonical: "https://spendinginsights.app/transactions",
    },
    description:
        "View and manage all your financial transactions. Filter, sort, and categorize your income and expenses with advanced search capabilities and manual categorization rules.",
    keywords: [
        "transaction list",
        "expense tracking",
        "income management",
        "financial transactions",
        "manual categorization",
        "transaction filtering",
    ],
    openGraph: {
        title: "Transaction List | Spending Insights",
        description:
            "View and manage all your financial transactions. Filter, sort, and categorize your income and expenses with advanced search capabilities and manual categorization rules.",
        type: "website",
        images: [
            {
                url: "/og-image.webp",
                width: 1200,
                height: 630,
                alt: "Spending Insights Transaction List",
                type: "image/webp",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Transaction List | Spending Insights",
        description:
            "View and manage all your financial transactions with advanced filtering.",
        images: ["/og-image.webp"],
        creator: "@Gideon_Koenig",
    },
};

export default function TransactionsLayout(props: {
    children: React.ReactNode;
}) {
    return (
        <>
            <div className="md:hidden h-full">
                <SmallScreenGuard />
            </div>
            <div className="hidden md:block h-full">{props.children}</div>
        </>
    );
}
