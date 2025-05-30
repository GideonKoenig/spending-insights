import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/contexts/data-provider";
import { LayoutContent } from "@/components/layout-content";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Bank Transaction Analyzer",
    description: "Analyze and categorize your bank transactions",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <DataProvider>
                    <LayoutContent>{children}</LayoutContent>
                </DataProvider>
            </body>
        </html>
    );
}
