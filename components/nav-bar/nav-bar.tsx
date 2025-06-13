"use client";

import { useAccounts } from "@/contexts/accounts/provider";
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
import { NotificationButton } from "@/components/nav-bar/notification-button";
import { LoadDataModal } from "@/components/load-data-modal/dialog";
import {
    TriangleAlert,
    OctagonX,
    Bug,
    Download,
    Upload,
    RefreshCcw,
    FolderOpen,
    Trash,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
    createExportTagRules,
    createImportTagRules,
    createUpdateAllCategories,
    createLoadData,
    createExportAccounts,
    createImportAccounts,
    createClearAllAccounts,
} from "./actions";

export function NavBar() {
    const accounts = useAccounts();
    const notifications = useNotifications();
    const tagRules = useTagRules();
    const pathname = usePathname();
    const [isActionsOpen, setIsActionsOpen] = useState(false);
    const [isLoadDataOpen, setIsLoadDataOpen] = useState(false);

    const links = [
        { href: "/", label: "Home" },
        { href: "/transactions", label: "Transactions" },
        { href: "/analytics", label: "Analytics" },
        { href: "/categories", label: "Categories" },
    ];

    const actionDependencies = {
        tagRules,
        accounts,
        notifications,
        closePopover: () => setIsActionsOpen(false),
        openLoadDataModal: () => setIsLoadDataOpen(true),
    };
    const exportTagRules = createExportTagRules(actionDependencies);
    const importTagRules = createImportTagRules(actionDependencies);
    const exportAccounts = createExportAccounts(actionDependencies);
    const importAccounts = createImportAccounts(actionDependencies);
    const updateAllCategories = createUpdateAllCategories(actionDependencies);
    const loadData = createLoadData(actionDependencies);
    const clearAllAccounts = createClearAllAccounts(actionDependencies);

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
                {accounts.loading ? (
                    <p className="text-muted-foreground text-sm">Loading...</p>
                ) : (
                    <>
                        <Select
                            value={
                                accounts.activeAccount === true
                                    ? "all"
                                    : accounts.activeAccount ?? ""
                            }
                            onValueChange={(value) => {
                                if (value === "all") {
                                    accounts.setActiveAccount(true);
                                } else {
                                    accounts.setActiveAccount(value);
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
                                        {accounts.accounts.reduce(
                                            (total, account) =>
                                                total +
                                                account.transactions.length,
                                            0
                                        )}
                                        )
                                    </span>
                                </SelectItem>
                                {accounts.accounts.map((account) => (
                                    <SelectItem
                                        key={account.id}
                                        value={account.id}
                                    >
                                        {account.name}{" "}
                                        <span className="text-xs text-muted-foreground">
                                            ({account.transactions.length})
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

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
                                    onClick={loadData}
                                >
                                    <FolderOpen className="h-4 w-4 mr-2" />
                                    Load Data
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={clearAllAccounts}
                                >
                                    <Trash className="h-4 w-4 mr-2" />
                                    Clear All Accounts
                                </Button>

                                <div className="border-t border-border my-1" />

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={exportAccounts}
                                    disabled={accounts.accounts.length === 0}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Accounts
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={importAccounts}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import Accounts
                                </Button>

                                <div className="border-t border-border my-1" />

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

                                {process.env.NODE_ENV !== "development" && (
                                    <>
                                        <div className="border-t border-border my-1" />

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-start"
                                            onClick={updateAllCategories}
                                        >
                                            <RefreshCcw className="h-4 w-4 mr-2" />
                                            Update All Categories
                                        </Button>
                                    </>
                                )}
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

                    {process.env.NODE_ENV === "development" && (
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
                    )}
                </div>
            </div>

            <LoadDataModal
                isOpen={isLoadDataOpen}
                closeDialog={() => setIsLoadDataOpen(false)}
            />
        </nav>
    );
}
