"use client";

import { useData } from "@/contexts/data-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavBar() {
    const dataResult = useData();
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Transactions" },
        { href: "/overview", label: "Overview" },
        { href: "/categories", label: "Categories" },
    ];

    if (!dataResult.success) return null;

    const {
        loading,
        error,
        needsFileHandle,
        needsPermission,
        transactions,
        selectFile,
        clearFile,
        requestPermission,
    } = dataResult.value;

    return (
        <nav className="border-b min-h-12 px-4 flex items-center justify-between bg-background">
            <div className="flex items-center gap-8">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "text-sm font-medium hover:text-primary",
                            pathname === link.href
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
            <div className="flex items-center gap-2">
                {loading ? (
                    <p className="text-muted-foreground text-sm">Loading...</p>
                ) : error ? (
                    <p className="text-destructive text-sm">{error}</p>
                ) : needsPermission ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={requestPermission}
                    >
                        Grant Permission
                    </Button>
                ) : needsFileHandle ? (
                    <Button size="sm" variant="outline" onClick={selectFile}>
                        Select File
                    </Button>
                ) : (
                    <>
                        <p className="text-muted-foreground text-sm">
                            {transactions.length} transactions
                        </p>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={clearFile}
                        >
                            Clear File
                        </Button>
                    </>
                )}
            </div>
        </nav>
    );
}
