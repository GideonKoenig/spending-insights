"use client";

import { useData } from "@/contexts/data-provider";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getActiveTransactions } from "@/lib/utils";

export function NavBar() {
    const dataResult = useData();
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Transactions" },
        { href: "/analytics", label: "Analytics" },
        { href: "/tags", label: "Tags" },
    ];

    if (!dataResult.success) return null;

    const {
        loading,
        error,
        needsFileHandle,
        needsPermission,
        datasets,
        activeDataset,
        setActiveDataset,
        requestPermissions,
        selectFiles,
        clearFiles,
    } = dataResult.value;

    const getErrorMessage = (error: string | null) => {
        if (!error) return "";
        if (error.length > 200) {
            console.error("Bank History Error:\n", error);
            return "Error - check console for more details";
        }
        return error;
    };

    return (
        <nav className="border-b min-h-12 px-4 flex items-center justify-between bg-background">
            <div className="flex items-center gap-4">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            "text-sm font-medium hover:text-primary p-2",
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
                    <p className="text-destructive text-sm">
                        {getErrorMessage(error)}
                    </p>
                ) : needsPermission ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={requestPermissions}
                    >
                        Grant Permission
                    </Button>
                ) : needsFileHandle ? (
                    <Button size="sm" variant="outline" onClick={selectFiles}>
                        Select Files
                    </Button>
                ) : (
                    <>
                        <p className="text-muted-foreground text-sm">
                            {`${
                                getActiveTransactions(datasets, activeDataset)
                                    .length
                            } transactions`}
                        </p>
                        <Select
                            value={
                                activeDataset === true
                                    ? "all"
                                    : activeDataset ?? ""
                            }
                            onValueChange={(value) => {
                                if (value === "all") {
                                    setActiveDataset(true);
                                } else {
                                    setActiveDataset(value);
                                }
                            }}
                        >
                            <SelectTrigger className="w-48" size="sm">
                                <SelectValue placeholder="Select account..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Accounts
                                </SelectItem>
                                {datasets.map((dataset) => (
                                    <SelectItem
                                        key={dataset.name}
                                        value={dataset.name}
                                    >
                                        {dataset.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={clearFiles}
                        >
                            Clear Data
                        </Button>
                    </>
                )}
            </div>
        </nav>
    );
}
