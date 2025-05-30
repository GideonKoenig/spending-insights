"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, Settings, X } from "lucide-react";
import { useData } from "@/contexts/data-provider";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Transactions", href: "/", icon: FileText },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Patterns", href: "/patterns", icon: Settings },
];

export function Navigation() {
    const pathname = usePathname();
    const { clearFile, transactions } = useData();

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-7xl px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <div className="flex-shrink-0">
                            <h1 className="text-xl font-bold">
                                Transaction Analyzer
                            </h1>
                        </div>
                        <div className="flex space-x-4">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                            pathname === item.href
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                        )}
                                    >
                                        <Icon className="mr-2 h-4 w-4" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">
                            {transactions.length} transactions loaded
                        </span>
                        <Button variant="outline" size="sm" onClick={clearFile}>
                            <X className="mr-2 h-4 w-4" />
                            Clear File
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
