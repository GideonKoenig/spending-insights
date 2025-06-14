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
    title: "Spending Insights",
    description: "Analyze your bank transactions privately in your browser",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
                                    {children}
                                </div>
                            </body>
                        </AccountProvider>
                    </TagRulesProvider>
                </NotificationProvider>
            </PlausibleProvider>
        </html>
    );
}
