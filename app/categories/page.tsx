"use client";

import "@/lib/operations-account";
import "@/lib/operations-transaction";
import { useRef, useState } from "react";
import { useAccounts } from "@/contexts/accounts/provider";
import { TRANSACTION_FILTER } from "@/lib/transaction-filter/transaction-filter-options";
import { Category, PartialTagRule } from "@/lib/tag-rule-engine/types";
import { useTagRules } from "@/contexts/tag-rules/provider";
import { TagPanel } from "@/app/categories/tag-panel";
import { TagsHeadlessList } from "@/app/categories/headless-list";
import { TransactionHeader } from "@/components/transactions/transaction-header";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { useNotifications } from "@/contexts/notification/provider";
import { LoadingState } from "@/components/loading-state";
import { handleResult } from "@/contexts/notification/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TagRuleList } from "@/components/tag-rules/tag-rule-list";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { TagRuleSortOption } from "@/lib/tag-rule-sorter";

const SELECTED_CATEGORY_KEY = "bank-history-tags-selected-category";
const SELECTED_SORT_KEY = "bank-history-tags-selected-sort";

export default function TagsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerReady, setContainerReady] = useState(false);
    const accountContext = useAccounts();
    const tagRuleContext = useTagRules();
    const notificationContext = useNotifications();
    const categoryStorage = useLocalStorage<Category>(
        SELECTED_CATEGORY_KEY,
        "all"
    );
    const sortStorage = useLocalStorage<TagRuleSortOption>(
        SELECTED_SORT_KEY,
        "newest-created"
    );
    const [currentRule, setCurrentRule] = useState<PartialTagRule>({
        filters: [],
    });

    if (
        accountContext.loading ||
        tagRuleContext.loading ||
        categoryStorage.isLoading ||
        sortStorage.isLoading
    ) {
        return <LoadingState />;
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

    const transactions = accounts.getTransactions();
    const filteredTransactions = transactions.filterTransactions(
        currentRule.filters,
        TRANSACTION_FILTER
    );
    const untaggedTransactions = filteredTransactions.getUntagged();
    const firstUntaggedTransaction = untaggedTransactions[0];

    return (
        <div className="h-full max-w-7xl mx-auto flex gap-2 p-4">
            <TagsHeadlessList
                style={{
                    display: currentRule.filters.length > 0 ? "block" : "none",
                }}
                className="flex-grow"
                transactions={filteredTransactions}
            />

            <div
                style={{
                    display: currentRule.filters.length > 0 ? "none" : "block",
                }}
                className="flex-grow overflow-hidden"
            >
                <ScrollArea
                    className="h-full"
                    ref={(node) => {
                        containerRef.current = node;
                        setContainerReady(!!node);
                    }}
                >
                    <TagRuleList
                        className="p-0 pr-3"
                        accounts={accounts}
                        tagRules={tagRuleContext.tagRules}
                        containerRef={containerRef}
                        containerReady={containerReady}
                        selectTagRule={setCurrentRule}
                        deleteTagRule={(tagRule) => {
                            tagRuleContext.removeTagRule(tagRule.id);
                            setCurrentRule({ filters: [] });
                        }}
                        categoryStorage={categoryStorage}
                        sortStorage={sortStorage}
                    />
                </ScrollArea>
            </div>

            <div className="flex w-xl h-full flex-col gap-2">
                <TagPanel
                    selectedRule={currentRule}
                    setCurrentRule={setCurrentRule}
                />

                <div className="bg-card flex items-end flex-grow rounded-md p-2 border border-border shadow-sm">
                    <TransactionHeader
                        className="w-full"
                        filters={currentRule.filters}
                        onFiltersChange={(filters) =>
                            setCurrentRule((prev) => ({ ...prev, filters }))
                        }
                        transactions={transactions}
                        possibleFilters={TRANSACTION_FILTER.filter(
                            (filter) => filter.attribute !== "category"
                        )}
                    />
                </div>

                {firstUntaggedTransaction ? (
                    <TransactionCard
                        className="p-3"
                        transaction={firstUntaggedTransaction}
                        purposeLineClamp={4}
                    />
                ) : (
                    <div className="p-3 h-40 flex items-center justify-center bg-card text-muted-foreground rounded-md border border-border shadow-sm">
                        <p className="text-center">No untagged transactions</p>
                    </div>
                )}
            </div>
        </div>
    );
}
