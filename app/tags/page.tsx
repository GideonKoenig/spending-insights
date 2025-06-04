"use client";

import { useState } from "react";
import { useData } from "@/contexts/data/provider";
import { FileSelector } from "@/components/file-selector";
import { getActiveTransactions, preprocessTransactions } from "@/lib/utils";
import { filter } from "@/lib/transaction-filter/main";
import { FILTER_OPTIONS } from "@/lib/transaction-filter/transaction-filter-options";
import { PartialTagRule } from "@/lib/transaction-tags/types";
import { useTagRules } from "@/app/tags/use-tag-rules";
import { TagPanel } from "@/app/tags/tags-tag-panel";
import { TagsHeadlessList } from "@/app/tags/tags-headless-list";
import { TransactionHeader } from "@/components/transaction-header";
import { TagsHeader } from "@/app/tags/tags-header";
import { TransactionCard } from "@/components/transaction-card";
import { TagStatistics } from "@/app/tags/tags-statistics";
import {
    getTaggedTransactions,
    getUntaggedTransactions,
} from "@/lib/transaction-tags/utils";

export default function TagsPage() {
    const {
        needsFileHandle,
        needsPermission,
        loading,
        datasets,
        activeDataset,
    } = useData();
    const { tagRules, isLoaded, addTagRule, removeTagRule } = useTagRules();
    const [showOnlyTagged, setShowOnlyTagged] = useState(true);
    const [currentRule, setCurrentRule] = useState<PartialTagRule>({
        filters: [],
    });

    if (needsFileHandle || needsPermission || loading) return <FileSelector />;

    if (!isLoaded) {
        return <p className="p-4 text-muted-foreground">Loading...</p>;
    }

    const transactions = preprocessTransactions(
        getActiveTransactions(datasets, activeDataset),
        tagRules
    );
    const filteredTransactions = filter(
        transactions,
        currentRule.filters,
        FILTER_OPTIONS
    );
    const taggedTransactions = getTaggedTransactions(filteredTransactions);
    const untaggedTransactions = getUntaggedTransactions(transactions);

    const firstUntaggedTransaction = untaggedTransactions[0];

    return (
        <div className="h-full max-w-7xl mx-auto flex gap-2 p-4">
            {currentRule.filters.length > 0 ? (
                <TagsHeadlessList
                    className="flex-grow"
                    transactions={
                        showOnlyTagged
                            ? taggedTransactions
                            : filteredTransactions
                    }
                />
            ) : (
                <TagStatistics
                    transactions={transactions}
                    className="flex-grow"
                />
            )}

            <div className="flex w-xl h-full flex-col gap-4">
                <TagsHeader
                    currentRule={currentRule}
                    setCurrentRule={setCurrentRule}
                    showOnlyTagged={showOnlyTagged}
                    setShowOnlyTagged={setShowOnlyTagged}
                    tagRules={tagRules}
                    addTagRule={addTagRule}
                    removeTagRule={removeTagRule}
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
