import type { Metadata } from "next";
import { SmallScreenGuard } from "@/components/small-screen-guard";

export const metadata: Metadata = {
    title: "Category Rules | Spending Insights",
    alternates: {
        canonical: "https://spendinginsights.app/categories",
    },
    description:
        "Create and manage manual categorization rules for your transactions. Set up custom tags and categories to organize your financial data with precision and control.",
    keywords: [
        "category rules",
        "transaction tagging",
        "expense categorization",
        "manual categorization",
        "tag management",
        "financial organization",
    ],
    openGraph: {
        title: "Category Rules | Spending Insights",
        description:
            "Create and manage manual categorization rules for your transactions. Set up custom tags and categories to organize your financial data with precision and control.",
        type: "website",
        images: [
            {
                url: "/og-image.webp",
                width: 1200,
                height: 630,
                alt: "Spending Insights Category Rules",
                type: "image/webp",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Category Rules | Spending Insights",
        description:
            "Create and manage manual categorization rules for your transactions.",
        images: ["/og-image.webp"],
        creator: "@Gideon_Koenig",
    },
};

export default function CategoriesLayout(props: { children: React.ReactNode }) {
    return (
        <>
            <div className="md:hidden h-full">
                <SmallScreenGuard />
            </div>
            <div className="hidden md:block h-full">{props.children}</div>
        </>
    );
}
