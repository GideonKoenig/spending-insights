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

// Todo: Tags page should containa tagRule list. the save clear and delete  buttons should be moved to the tab panel, the toggle stuff button should be moved to the list → lowering the state which is also good, and then we have at the top the define tag panel, below the filter panel, and below that the current transaction
// Todo: transactions should get annotated to enrich them with additional information. currently mainly for paypal to visualize where the money is going (analyzing the vendor id and stuff that is provided)
// Todo: tag-rules should have a category, and then an unlimited amount of tags (provided in the nice thing ihave in the datamanger-parser project). there is no name, you select them from the list/card, they need a created and updated at field (and id which i think they already have)
// Todo: i should use the new shadcn Datepicker (better than the current one)
// Todo: default value for stuff on the filter fields should be determined by currently displayed "firstuntaggedtranscation"

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
