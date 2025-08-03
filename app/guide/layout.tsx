import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "User Guide | Spending Insights",
    alternates: {
        canonical: "https://spendinginsights.app/guide",
    },
    description:
        "Learn how to use Spending Insights effectively. Step-by-step guide for importing transactions, setting up manual categorization rules, and analyzing your spending patterns.",
    keywords: [
        "user guide",
        "how to use",
        "tutorial",
        "spending insights help",
        "transaction import",
        "categorization guide",
    ],
    openGraph: {
        title: "User Guide | Spending Insights",
        description:
            "Learn how to use Spending Insights effectively. Step-by-step guide for importing transactions, setting up manual categorization rules, and analyzing your spending patterns.",
        type: "website",
        images: [
            {
                url: "/og-image.webp",
                width: 1200,
                height: 630,
                alt: "Spending Insights User Guide",
                type: "image/webp",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "User Guide | Spending Insights",
        description:
            "Learn how to use Spending Insights effectively with our comprehensive guide.",
        images: ["/og-image.webp"],
        creator: "@Gideon_Koenig",
    },
};

export default function GuideLayout(props: { children: React.ReactNode }) {
    return props.children;
}
