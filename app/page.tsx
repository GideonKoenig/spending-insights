"use client";

import { useAccounts } from "@/contexts/accounts/provider";
import { TransactionList } from "@/components/transaction-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRef } from "react";
import { useTagRules } from "@/contexts/tag-rules/provider";
import { useNotifications } from "@/contexts/notification/provider";
import { LoadingState } from "@/components/loading-state";

export default function HomePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const accountContext = useAccounts();
    const tagRuleContext = useTagRules();
    const notificationContext = useNotifications();

    if (accountContext.loading || tagRuleContext.loading) {
        return <LoadingState />;
    }

    const result = accountContext.accounts
        .getActive(accountContext.activeAccount)
        .preprocessAccounts(tagRuleContext.tagRules);

    if (result.warnings) {
        notificationContext.addWarning(
            "Transaction Processing",
            result.warnings
        );
    }

    const accounts = result;

    return (
        <ScrollArea ref={containerRef} className="h-full">
            <TransactionList
                transactions={accounts.value.getTransactions()}
                containerRef={containerRef}
            />
        </ScrollArea>
    );
}
