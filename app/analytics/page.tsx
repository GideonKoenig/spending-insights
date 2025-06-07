"use client";

import { useAccounts } from "@/contexts/accounts/provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInsights } from "@/lib/analytics-tools/insights";
import { AnalyticsInsights } from "@/app/analytics/insights";
import { BalanceChart } from "@/app/analytics/balance-chart";
import { useTagRules } from "@/contexts/tag-rules/provider";
import { useNotifications } from "@/contexts/notification/provider";
import { LoadingState } from "@/components/loading-state";
import { EmptyAccountsState } from "@/components/empty-accounts-state";
import "@/lib/operations-account";
import "@/lib/operations-transaction";
import { handleResult } from "@/contexts/notification/utils";

export default function AnalyticsPage() {
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
        "Processing accounts",
        notificationContext,
        []
    );

    const transactions = accounts
        .getTransactions()
        .sort(
            (a, b) =>
                new Date(a.bookingDate).getTime() -
                new Date(b.bookingDate).getTime()
        );

    const insights = getInsights(accounts);

    return (
        <ScrollArea className="h-full">
            <div className="mx-auto flex flex-col gap-6 max-w-7xl px-4 py-8">
                <AnalyticsInsights insights={insights} />
                <BalanceChart accounts={accounts} />
            </div>
        </ScrollArea>
    );
}
