"use client";

import { useAccounts } from "@/contexts/accounts/provider";
import { TransactionList } from "@/components/transactions/transaction-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRef, useState } from "react";
import { useTagRules } from "@/contexts/tag-rules/provider";
import { useNotifications } from "@/contexts/notification/provider";
import { LoadingState } from "@/components/loading-state";
import { EmptyAccountsState } from "@/components/empty-accounts-state";
import "@/lib/operations-account";
import "@/lib/operations-transaction";
import { handleResult } from "@/contexts/notification/utils";

export default function HomePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerReady, setContainerReady] = useState(false);
    const accountContext = useAccounts();
    const tagRuleContext = useTagRules();
    const notificationContext = useNotifications();

    if (accountContext.loading || tagRuleContext.loading) {
        return <LoadingState />;
    }
    if (accountContext.accounts.length === 0) {
        return <EmptyAccountsState />;
    }

    const result = accountContext.accounts
        .getActive(accountContext.activeAccount)
        .preprocessAccounts(tagRuleContext.tagRules);

    const accounts = handleResult(
        result,
        "Transaction Processing",
        notificationContext,
        []
    );

    return (
        <ScrollArea
            className="h-full"
            ref={(node) => {
                containerRef.current = node;
                setContainerReady(!!node);
            }}
        >
            <TransactionList
                transactions={accounts.getTransactions()}
                containerRef={containerRef}
                containerReady={containerReady}
            />
        </ScrollArea>
    );
}
