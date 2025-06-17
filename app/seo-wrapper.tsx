import Script from "next/script";

const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Spending Insights",
    description:
        "Analyze bank transactions privately in your browser. Free, secure, and no account required. Categorize spending, and get insights into your financial habits.",
    url: "https://spendinginsights.app",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web Browser",
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
    },
    features: [
        "Private transaction analysis",
        "CSV file import",
        "Manual categorization rules",
        "Spending analytics",
        "No account required",
    ],
    browserRequirements:
        "Requires JavaScript. Compatible with modern web browsers.",
};

export function SEOWrapper(props: { children: React.ReactNode }) {
    return (
        <>
            <Script
                id="structured-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData),
                }}
            />
            {props.children}
        </>
    );
}
