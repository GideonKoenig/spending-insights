import {
    Category,
    MAIN_CATEGORIES,
    PartialTagRule,
    TagRule,
} from "@/lib/tag-rule-engine/types";
import { Account, Transaction } from "@/lib/types";
import { newError, newSuccess } from "@/lib/utils";

export function applyTag(transactions: Transaction[], tagRule: TagRule) {
    const warnings: string[] = [];
    const taggedTransactions = transactions.map((transaction) => {
        if (transaction.tag) {
            queueMicrotask(() => {
                warnings.push(
                    `A transaction is captured by more than one tag rule.\nThe transaction is already matched by "${
                        transaction.tag!.ruleId
                    }" (${transaction.tag!.ruleId}) but rule "${tagRule.id}" (${
                        tagRule.id
                    }) also applies.`
                );
            });
            return transaction;
        }

        return {
            ...transaction,
            tag: tagRule.tag,
            category: tagRule.tag.category,
        };
    });
    return newSuccess(taggedTransactions, warnings);
}

export function getCleanTagRule(tagRule: PartialTagRule, other: TagRule[]) {
    const hasCategory = tagRule.tag?.category?.trim();
    const hasSubCategory = tagRule.tag?.subCategory?.trim();
    const hasFilters = tagRule.filters.length > 0;

    const issues = [];

    if (!hasCategory) {
        issues.push("A tag must define a category");
    }

    if (!hasSubCategory) {
        issues.push("A tag must define a subcategory");
    }

    if (!hasFilters) {
        issues.push("A tag must define at least one filter");
    }

    if (issues.length > 0)
        return newError(`Cannot create tag rule:\n → ${issues.join("\n → ")}`);
    return newSuccess(tagRule as TagRule);
}

export function generateCategoryColor(category: string) {
    const isCategory = (category: string): category is Category => {
        return MAIN_CATEGORIES.includes(category as any);
    };
    if (!isCategory(category) || category === "all") return "hsl(0, 0%, 50%)";
    const index = MAIN_CATEGORIES.indexOf(category);

    const hue = (360 / MAIN_CATEGORIES.length) * index;
    const saturation = 50;
    const lightness = 40;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function getCountPerTagRule(accounts: Account[]) {
    const resultMap = new Map<string, number>();
    for (const account of accounts) {
        for (const transaction of account.transactions) {
            if (transaction.tag) {
                const entry = resultMap.get(transaction.tag.ruleId);
                if (entry) {
                    resultMap.set(transaction.tag.ruleId, entry + 1);
                } else {
                    resultMap.set(transaction.tag.ruleId, 1);
                }
            }
        }
    }
    return resultMap;
}
