"use client";

import { useState, useCallback, useEffect } from "react";
import { TagRuleCard } from "@/components/tag-rules/tag-rule-card";
import { TagRuleHeader } from "@/components/tag-rules/tag-rule-header";
import { cn } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Category,
    MAIN_CATEGORIES,
    TagRule,
} from "@/lib/tag-rule-engine/types";
import {
    sortTagRules,
    TagRuleSortOption,
    TAG_RULE_SORT_OPTIONS,
} from "@/lib/tag-rule-sorter";
import { getCountPerTagRule } from "@/lib/tag-rule-engine/utils";
import { Account } from "@/lib/types";

export function TagRuleList(props: {
    accounts: Account[];
    tagRules: TagRule[];
    containerRef: React.RefObject<HTMLDivElement | null>;
    containerReady: boolean;
    className?: string;
    selectTagRule: (tagRule: TagRule) => void;
    deleteTagRule: (tagRule: TagRule) => void;
    categoryStorage: {
        value: Category;
        updateValue: (value: Category) => void;
        isLoading: boolean;
    };
    sortStorage: {
        value: TagRuleSortOption;
        updateValue: (value: TagRuleSortOption) => void;
        isLoading: boolean;
    };
}) {
    const filteredTagRules = props.tagRules.filter((rule) => {
        if (props.categoryStorage.value === "all") return true;
        return rule.tag.category === props.categoryStorage.value;
    });
    const sortedTagRules = sortTagRules(
        filteredTagRules,
        props.sortStorage.value
    );
    const countPerTagRule = getCountPerTagRule(props.accounts);

    const getScrollElement = useCallback(
        () => props.containerRef.current,
        [props.containerRef]
    );
    const virtualizer = useVirtualizer({
        count: sortedTagRules.length,
        getScrollElement,
        estimateSize: () => 44,
        overscan: 10,
        gap: 16,
        enabled: props.containerReady,
    });

    useEffect(() => {
        virtualizer._willUpdate();
    }, [props.containerReady]);

    return (
        <div className={cn("p-4", props.className)}>
            <TagRuleHeader
                className="mb-2 p-2 bg-card border border-border rounded-md shadow-sm"
                filter={props.categoryStorage.value}
                setFilter={props.categoryStorage.updateValue}
                sortSelector={
                    <Select
                        value={props.sortStorage.value}
                        onValueChange={(value) =>
                            props.sortStorage.updateValue(
                                value as TagRuleSortOption
                            )
                        }
                    >
                        <SelectTrigger
                            className="w-40 bg-background"
                            tabIndex={5}
                        >
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            {TAG_RULE_SORT_OPTIONS.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            />
            {props.containerRef.current && (
                <div
                    className="relative"
                    style={{ height: `${virtualizer.getTotalSize()}px` }}
                >
                    {virtualizer.getVirtualItems().map((item) => (
                        <TagRuleCard
                            key={sortedTagRules[item.index].id}
                            tagRule={sortedTagRules[item.index]}
                            count={countPerTagRule.get(
                                sortedTagRules[item.index].id
                            )}
                            selectTagRule={props.selectTagRule}
                            deleteTagRule={props.deleteTagRule}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: `${item.size}px`,
                                transform: `translateY(${item.start}px)`,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
