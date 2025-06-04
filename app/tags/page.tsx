"use client";

import { useState, useRef } from "react";
import { useData } from "@/contexts/data/provider";
import { FileSelector } from "@/components/file-selector";
import { getActiveTransactions } from "@/lib/utils";
import { filter } from "@/lib/transaction-filter/main";
import { FILTER_OPTIONS } from "@/lib/transaction-filter/transaction-filter-options";
import { PartialTagMatcher, Tag, TagMatcher } from "@/lib/types";
import { useTagMatchers } from "@/app/tags/use-tag-matchers";
import { TagDefinitionPanel } from "@/app/tags/tags-definition-panel";
import { TagsHeadlessList } from "@/app/tags/tags-headless-list";
import { TransactionHeader } from "@/components/transaction-header";
import { TagsHeader } from "@/app/tags/tags-header";
import { TransactionCard } from "@/components/transaction-card";
import {
    getTaggedTransactions,
    getUntaggedTransactions,
} from "@/app/tags/utils";

export default function TagsPage() {
    const {
        needsFileHandle,
        needsPermission,
        loading,
        datasets,
        activeDataset,
    } = useData();
    const { matchers, addMatcher, isLoaded } = useTagMatchers();
    const [showOnlyTagged, setShowOnlyTagged] = useState(false);
    const [currentMatcher, setCurrentMatcher] =
        useState<PartialTagMatcher | null>(null);

    if (needsFileHandle || needsPermission || loading) {
        return <FileSelector />;
    }
    if (!isLoaded) {
        return <p className="p-4 text-muted-foreground">Loading...</p>;
    }

    const transactions = getActiveTransactions(datasets, activeDataset);
    const filteredTransactions =
        currentMatcher && currentMatcher.filters && currentMatcher.filters
            ? filter(transactions, currentMatcher.filters, FILTER_OPTIONS)
            : [];
    const taggedTransactions = getTaggedTransactions(
        filteredTransactions,
        matchers
    );
    const untaggedTransactions = getUntaggedTransactions(
        transactions,
        matchers
    );

    const firstUntaggedTransaction = untaggedTransactions[0];

    const handleCreateMatcher = (name: string, tags: Tag) => {
        if (currentFilters.length === 0) return;

        const newMatcher: TagMatcher = {
            id: crypto.randomUUID(),
            name,
            filters: currentFilters,
            tags,
        };

        addMatcher(newMatcher);
        handleClear();
    };

    const handleClear = () => {
        setCurrentFilters([]);
        setCurrentMatcher(null);
        setCurrentMatcherName("");
        setCurrentTags(null);
    };

    const handleSelectMatcher = (matcher: TagMatcher | null) => {
        setCurrentMatcher(matcher);
        if (matcher) {
            setCurrentFilters(matcher.filters);
        }
    };

    const handleTagsChange = (name: string, tags: Tag | null) => {
        setCurrentMatcherName(name);
        setCurrentTags(tags);
    };

    const hasActiveFilters = currentFilters.length > 0;

    return (
        <div className="h-full max-w-7xl mx-auto grid grid-cols-2 gap-4 p-4">
            <TagsHeadlessList
                transactions={showOnlyTagged ? transactions : transactions}
            />

            <div className="flex h-full flex-col gap-4">
                <TagsHeader
                    matchers={matchers}
                    selectedMatcher={currentMatcher}
                    onSelectMatcher={handleSelectMatcher}
                    onClear={handleClear}
                    onCreateMatcher={handleCreateMatcher}
                    hasActiveFilters={hasActiveFilters}
                    matcherName={currentMatcherName}
                    tags={currentTags}
                    showOnlyTagged={showOnlyTagged}
                    onShowOnlyTaggedChange={setShowOnlyTagged}
                />

                <div className="bg-card flex items-end flex-grow rounded-md p-4 border border-border shadow-sm">
                    <TransactionHeader
                        className="w-full"
                        filters={currentFilters}
                        onFiltersChange={setCurrentFilters}
                        transactions={transactions}
                        filteredCount={filteredTransactions.length}
                    />
                </div>

                <TagDefinitionPanel
                    onTagsChange={handleTagsChange}
                    selectedMatcher={currentMatcher}
                    hasActiveFilters={hasActiveFilters}
                />

                <TransactionCard
                    transaction={firstUntaggedTransaction}
                    purposeLineClamp={4}
                />
            </div>
        </div>
    );
}
