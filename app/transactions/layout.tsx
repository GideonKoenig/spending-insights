import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Transaction List | Spending Insights",
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
                url: "/icon.svg",
                width: 1200,
                height: 630,
                alt: "Spending Insights Transaction List",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Transaction List | Spending Insights",
        description:
            "View and manage all your financial transactions with advanced filtering.",
        images: ["/icon.svg"],
        creator: "@Gideon_Koenig",
    },
};

export default function TransactionsLayout(props: {
    children: React.ReactNode;
}) {
    return props.children;
}
