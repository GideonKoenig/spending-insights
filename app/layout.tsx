import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { DataProvider } from "@/contexts/data-provider";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";
import { ScrollArea } from "@/components/ui/scroll-area";

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
            <DataProvider>
                <body className="h-dvh w-dvw bg-background text-foreground flex flex-col">
                    <NavBar />
                    <div className="flex-grow overflow-hidden">
                        <ScrollArea className="h-full">{children}</ScrollArea>
                    </div>
                </body>
            </DataProvider>
        </html>
    );
}
