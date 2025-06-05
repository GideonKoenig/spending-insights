import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DataProvider } from "@/contexts/data/provider";
import { NotificationProvider } from "@/contexts/notification/provider";
import { TagRulesProvider } from "@/contexts/tag-rules/provider";
import { NavBar } from "@/components/nav-bar/nav-bar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Bank History",
    description: "Analyze your bank transactions",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.className} suppressHydrationWarning>
            <NotificationProvider>
                <TagRulesProvider>
                    <DataProvider>
                        <body className="h-dvh w-dvw bg-background text-foreground flex flex-col">
                            <NavBar />
                            <div className="flex-grow overflow-hidden">
                                {children}
                            </div>
                        </body>
                    </DataProvider>
                </TagRulesProvider>
            </NotificationProvider>
        </html>
    );
}
