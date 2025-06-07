"use client";

import { useState } from "react";
import { useAccounts } from "@/contexts/accounts/provider";
import { FILTER_OPTIONS } from "@/lib/transaction-filter/transaction-filter-options";
import { PartialTagRule } from "@/lib/tag-rule-engine/types";
import { useTagRules } from "@/contexts/tag-rules/provider";
import { TagPanel } from "@/app/tags/tag-panel";
import { TagsHeadlessList } from "@/app/tags/headless-list";
import { TransactionHeader } from "@/components/transactions/transaction-header";
import { TagsHeader } from "@/app/tags/header";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { TagStatistics } from "@/app/tags/statistics";
import { useNotifications } from "@/contexts/notification/provider";
import { LoadingState } from "@/components/loading-state";
import "@/lib/operations-account";
import "@/lib/operations-transaction";

export default function TagsPage() {
    const accountContext = useAccounts();
    const tagRuleContext = useTagRules();
    const notificationContext = useNotifications();
    const [showOnlyTagged, setShowOnlyTagged] = useState(false);
    const [currentRule, setCurrentRule] = useState<PartialTagRule>({
        filters: [],
    });

    if (accountContext.loading || tagRuleContext.loading) {
        return <LoadingState />;
    }

    const accounts = accountContext.accounts
        .getActive(accountContext.activeAccount)
        .preprocessAccounts(tagRuleContext.tagRules);

    if (accounts.warnings) {
        notificationContext.addWarning(
            "Transaction Processing",
            accounts.warnings
        );
    }

    const transactions = accounts.value.getTransactions();
    const filteredTransactions = transactions.filterTransactions(
        currentRule.filters,
        FILTER_OPTIONS
    );
    const untaggedTransactions = filteredTransactions.getUntagged();
    const firstUntaggedTransaction = untaggedTransactions[0];

    return (
        <div className="h-full max-w-7xl mx-auto flex gap-2 p-4">
            {currentRule.filters.length > 0 ? (
                <TagsHeadlessList
                    className="flex-grow"
                    transactions={filteredTransactions}
                    showTagged={showOnlyTagged}
                />
            ) : (
                <TagStatistics
                    transactions={transactions}
                    className="flex-grow"
                />
            )}

            <div className="flex w-xl h-full flex-col gap-2">
                <TagsHeader
                    currentRule={currentRule}
                    setCurrentRule={setCurrentRule}
                    showOnlyTagged={showOnlyTagged}
                    setShowOnlyTagged={setShowOnlyTagged}
                    tagRuleContext={tagRuleContext}
                />

                <div className="bg-card flex items-end flex-grow rounded-md p-2 border border-border shadow-sm">
                    <TransactionHeader
                        className="w-full"
                        filters={currentRule.filters}
                        onFiltersChange={(filters) =>
                            setCurrentRule((prev) => ({ ...prev, filters }))
                        }
                        transactions={transactions}
                    />
                </div>

                <TagPanel
                    selectedRule={currentRule}
                    setCurrentRule={setCurrentRule}
                />

                {firstUntaggedTransaction ? (
                    <TransactionCard
                        className="p-3"
                        transaction={firstUntaggedTransaction}
                        purposeLineClamp={4}
                    />
                ) : (
                    <div className="p-3 bg-card text-muted-foreground rounded-md border border-border shadow-sm">
                        <p className="text-center">No untagged transactions</p>
                    </div>
                )}
            </div>
        </div>
    );
}
