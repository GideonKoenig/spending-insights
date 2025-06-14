"use client";

import { useAccounts } from "@/contexts/accounts/provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInsights } from "@/lib/analytics-tools/grouping";
import { DashboardTab } from "@/app/analytics/tabs/dashboard-tab";
import { GraphsTab } from "@/app/analytics/tabs/graphs-tab";
import { CompareTab } from "@/app/analytics/tabs/compare-tab";
import { useTagRules } from "@/contexts/tag-rules/provider";
import { useNotifications } from "@/contexts/notification/provider";
import { LoadingState } from "@/components/loading-state";
import { EmptyAccountsState } from "@/components/empty-accounts-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import "@/lib/operations-account";
import "@/lib/operations-transaction";
import { handleResult } from "@/contexts/notification/utils";

const SELECTED_TAB_KEY = "bank-history-analytics-selected-tab";

export default function AnalyticsPage() {
    const accountContext = useAccounts();
    const tagRuleContext = useTagRules();
    const notificationContext = useNotifications();
    const tabStorage = useLocalStorage(SELECTED_TAB_KEY, "dashboard");

    if (
        accountContext.loading ||
        tagRuleContext.loading ||
        tabStorage.isLoading
    ) {
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

    const insights = getInsights(accounts);

    return (
        <ScrollArea className="h-full">
            <div className="mx-auto max-w-7xl p-4">
                <Tabs
                    value={tabStorage.value}
                    onValueChange={tabStorage.updateValue}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-3 max-w-md">
                        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                        <TabsTrigger value="graphs">Graphs</TabsTrigger>
                        <TabsTrigger value="compare">Compare</TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard">
                        <DashboardTab insights={insights} />
                    </TabsContent>

                    <TabsContent value="graphs">
                        <GraphsTab insights={insights} accounts={accounts} />
                    </TabsContent>

                    <TabsContent value="compare">
                        <CompareTab insights={insights} accounts={accounts} />
                    </TabsContent>
                </Tabs>
            </div>
        </ScrollArea>
    );
}
