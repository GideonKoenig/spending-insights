"use client";

import { useData } from "@/contexts/data/provider";
import { useNotifications } from "@/contexts/notification/provider";
import { useTagRules } from "@/contexts/tag-rules/provider";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationButton } from "@/components/notification-button";
import {
    TriangleAlert,
    OctagonX,
    Bug,
    Download,
    Upload,
    RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
    createExportTagRules,
    createImportTagRules,
    createUpdateAllCategories,
    type ActionDependencies,
} from "./actions";

export function NavBar() {
    const data = useData();
    const notifications = useNotifications();
    const tagRules = useTagRules();
    const pathname = usePathname();
    const [isActionsOpen, setIsActionsOpen] = useState(false);

    const links = [
        { href: "/", label: "Transactions" },
        { href: "/analytics", label: "Analytics" },
        { href: "/tags", label: "Tags" },
    ];

    const actionDependencies: ActionDependencies = {
        tagRules,
        notifications,
        closePopover: () => setIsActionsOpen(false),
    };

    const exportTagRules = createExportTagRules(actionDependencies);
    const importTagRules = createImportTagRules(actionDependencies);
    const updateAllCategories = createUpdateAllCategories(actionDependencies);

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
                {data.loading ? (
                    <p className="text-muted-foreground text-sm">Loading...</p>
                ) : data.needsPermission ? (
                    <Button
                        size="sm"
                        variant="outline"
                        className="rounded-sm"
                        onClick={data.requestPermissions}
                    >
                        Grant Permission
                    </Button>
                ) : data.needsFileHandle ? (
                    <Button
                        size="sm"
                        variant="outline"
                        className="rounded-sm"
                        onClick={data.selectFiles}
                    >
                        Select Files
                    </Button>
                ) : (
                    <>
                        <Select
                            value={
                                data.activeDataset === true
                                    ? "all"
                                    : data.activeDataset ?? ""
                            }
                            onValueChange={(value) => {
                                if (value === "all") {
                                    data.setActiveDataset(true);
                                } else {
                                    data.setActiveDataset(value);
                                }
                            }}
                        >
                            <SelectTrigger className="w-52" size="sm">
                                <SelectValue placeholder="Select account..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {"All Accounts "}
                                    <span className="text-xs text-muted-foreground">
                                        (
                                        {data.datasets.reduce(
                                            (total, dataset) =>
                                                total +
                                                dataset.transactions.length,
                                            0
                                        )}
                                        )
                                    </span>
                                </SelectItem>
                                {data.datasets.map((dataset) => (
                                    <SelectItem
                                        key={dataset.name}
                                        value={dataset.name}
                                    >
                                        {dataset.name}{" "}
                                        <span className="text-xs text-muted-foreground">
                                            ({dataset.transactions.length})
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-sm"
                            onClick={data.clearFiles}
                        >
                            Clear Data
                        </Button>

                        <Popover
                            open={isActionsOpen}
                            onOpenChange={setIsActionsOpen}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-sm"
                                >
                                    Actions
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-1" align="end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={exportTagRules}
                                    disabled={tagRules.tagRules.length === 0}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Tag Rules
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={importTagRules}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import Tag Rules
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={updateAllCategories}
                                >
                                    <RefreshCcw className="h-4 w-4 mr-2" />
                                    Update All Categories
                                </Button>
                            </PopoverContent>
                        </Popover>
                    </>
                )}

                <div className="flex items-center gap-1">
                    <NotificationButton
                        notifications={notifications.errors}
                        icon={<OctagonX />}
                        activeColorClass="text-destructive"
                        typeLabel="error"
                        emptyMessage="No errors"
                        onMarkAsRead={notifications.markErrorsAsRead}
                        onClear={notifications.clearErrors}
                        onAddTest={() =>
                            notifications.addError(
                                "Test",
                                "This is a test error message"
                            )
                        }
                    />
                    <NotificationButton
                        notifications={notifications.warnings}
                        icon={<TriangleAlert />}
                        activeColorClass="text-warning"
                        typeLabel="warning"
                        emptyMessage="No warnings"
                        onMarkAsRead={notifications.markWarningsAsRead}
                        onClear={notifications.clearWarnings}
                        onAddTest={() =>
                            notifications.addWarning(
                                "Test",
                                "This is a test warning message"
                            )
                        }
                    />
                    <NotificationButton
                        notifications={notifications.debugs}
                        icon={<Bug />}
                        activeColorClass="text-debug"
                        typeLabel="debug message"
                        emptyMessage="No debug messages"
                        onMarkAsRead={notifications.markDebugsAsRead}
                        onClear={notifications.clearDebugs}
                        onAddTest={() =>
                            notifications.addDebug(
                                "Test",
                                "This is a test debug message"
                            )
                        }
                    />
                </div>
            </div>
        </nav>
    );
}
