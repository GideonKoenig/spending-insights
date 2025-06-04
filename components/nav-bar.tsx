"use client";

import { useData } from "@/contexts/data/provider";
import { useNotifications } from "@/contexts/notification/provider";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { NotificationButton } from "@/components/notification-button";
import { TriangleAlert, OctagonX, Bug } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getActiveTransactions } from "@/lib/utils";

export function NavBar() {
    const {
        loading,
        needsFileHandle,
        needsPermission,
        datasets,
        activeDataset,
        setActiveDataset,
        requestPermissions,
        selectFiles,
        clearFiles,
    } = useData();
    const {
        warnings,
        errors,
        debugs,
        markWarningsAsRead,
        markErrorsAsRead,
        markDebugsAsRead,
        clearWarnings,
        clearErrors,
        clearDebugs,
        addWarning,
        addError,
        addDebug,
    } = useNotifications();
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Transactions" },
        { href: "/analytics", label: "Analytics" },
        { href: "/tags", label: "Tags" },
    ];

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
                ) : needsPermission ? (
                    <Button
                        size="sm"
                        variant="outline"
                        className="rounded-sm"
                        onClick={requestPermissions}
                    >
                        Grant Permission
                    </Button>
                ) : needsFileHandle ? (
                    <Button
                        size="sm"
                        variant="outline"
                        className="rounded-sm"
                        onClick={selectFiles}
                    >
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
                            className="rounded-sm"
                            onClick={clearFiles}
                        >
                            Clear Data
                        </Button>
                    </>
                )}

                <div className="flex items-center gap-1">
                    <NotificationButton
                        notifications={errors}
                        icon={<OctagonX />}
                        activeColorClass="text-destructive"
                        typeLabel="error"
                        emptyMessage="No errors"
                        onMarkAsRead={markErrorsAsRead}
                        onClear={clearErrors}
                        onAddTest={() =>
                            addError("Test", "This is a test error message")
                        }
                    />
                    <NotificationButton
                        notifications={warnings}
                        icon={<TriangleAlert />}
                        activeColorClass="text-warning"
                        typeLabel="warning"
                        emptyMessage="No warnings"
                        onMarkAsRead={markWarningsAsRead}
                        onClear={clearWarnings}
                        onAddTest={() =>
                            addWarning("Test", "This is a test warning message")
                        }
                    />
                    <NotificationButton
                        notifications={debugs}
                        icon={<Bug />}
                        activeColorClass="text-debug"
                        typeLabel="debug message"
                        emptyMessage="No debug messages"
                        onMarkAsRead={markDebugsAsRead}
                        onClear={clearDebugs}
                        onAddTest={() =>
                            addDebug("Test", "This is a test debug message")
                        }
                    />
                </div>
            </div>
        </nav>
    );
}
