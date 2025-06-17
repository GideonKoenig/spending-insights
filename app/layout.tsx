import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AccountProvider } from "@/contexts/accounts/provider";
import { NotificationProvider } from "@/contexts/notification/provider";
import { TagRulesProvider } from "@/contexts/tag-rules/provider";
import { NavBar } from "@/components/nav-bar/nav-bar";
import PlausibleProvider from "next-plausible";
import "./globals.css";
import "@/lib/operations-account";
import "@/lib/operations-transaction";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: {
        default: "Spending Insights - Analyze Bank Transactions Privately",
        template: "%s | Spending Insights",
    },
    description:
        "Analyze your bank transactions privately in your browser. Free, secure, and no account required. Import CSV files, categorize spending, and get insights into your financial habits.",
    keywords: [
        "bank transactions",
        "spending analysis",
        "financial insights",
        "CSV import",
        "private",
        "secure",
        "budgeting",
        "expense tracking",
    ],
    authors: [{ name: "Gideon Koenig" }],
    creator: "Gideon Koenig",
    publisher: "Gideon Koenig",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    icons: {
        icon: [
            { url: "/icon.svg", type: "image/svg+xml" },
            { url: "/icon.png", type: "image/png" },
        ],
        shortcut: "/favicon.ico",
        apple: "/icon.png",
    },
    metadataBase: new URL("https://spendinginsights.app"),
    openGraph: {
        title: "Spending Insights - Analyze Bank Transactions Privately",
        description:
            "Analyze your bank transactions privately in your browser. Free, secure, and no account required.",
        url: "https://spendinginsights.app",
        siteName: "Spending Insights",
        images: [
            {
                url: "/icon.png",
                width: 1200,
                height: 630,
                alt: "Spending Insights - Private Bank Transaction Analysis",
            },
        ],
        locale: "en_DE",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Spending Insights - Analyze Bank Transactions Privately",
        description:
            "Analyze your bank transactions privately in your browser. Free, secure, and no account required.",
        images: ["/icon.png"],
        creator: "@Gideon_Koenig",
    },
};

export default function RootLayout(props: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.className} suppressHydrationWarning>
            <PlausibleProvider
                domain="spendinginsights.app"
                taggedEvents
                selfHosted
                customDomain="plausible.gko.gg"
            >
                <NotificationProvider>
                    <TagRulesProvider>
                        <AccountProvider>
                            <body className="h-dvh w-dvw bg-background text-foreground flex flex-col">
                                <NavBar />
                                <div className="flex-grow overflow-hidden">
                                    {props.children}
                                </div>
                            </body>
                        </AccountProvider>
                    </TagRulesProvider>
                </NotificationProvider>
            </PlausibleProvider>
        </html>
    );
}
