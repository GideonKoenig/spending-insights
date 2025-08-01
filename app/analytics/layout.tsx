import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Analytics Dashboard | Spending Insights",
    description:
        "Analyze your spending patterns with detailed charts and insights. View expense breakdowns, balance trends, and category distributions to understand your financial habits.",
    keywords: [
        "spending analytics",
        "expense charts",
        "financial insights",
        "money tracking",
        "balance trends",
        "expense breakdown",
    ],
    openGraph: {
        title: "Analytics Dashboard | Spending Insights",
        description:
            "Analyze your spending patterns with detailed charts and insights. View expense breakdowns, balance trends, and category distributions to understand your financial habits.",
        type: "website",
        images: [
            {
                url: "/og-image.webp",
                width: 1200,
                height: 630,
                alt: "Spending Insights Analytics Dashboard",
                type: "image/webp",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Analytics Dashboard | Spending Insights",
        description:
            "Analyze your spending patterns with detailed charts and insights.",
        images: ["/og-image.webp"],
        creator: "@Gideon_Koenig",
    },
};

export default function AnalyticsLayout(props: { children: React.ReactNode }) {
    return props.children;
}
