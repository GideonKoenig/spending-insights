import {
    MAIN_CATEGORIES,
    PartialTagRule,
    TagRule,
} from "@/lib/tag-rule-engine/types";
import { Transaction } from "@/lib/types";
import { newSuccess } from "@/lib/utils";

export function applyTag(transactions: Transaction[], tagRule: TagRule) {
    const warnings: string[] = [];
    const taggedTransactions = transactions.map((transaction) => {
        if (transaction.tag) {
            queueMicrotask(() => {
                warnings.push(
                    `A transaction is captured by more than one tag rule.\nThe transaction is already matched by "${
                        transaction.tag!.ruleName
                    }" (${transaction.tag!.ruleId}) but rule "${
                        tagRule.name
                    }" (${tagRule.id}) also applies.`
                );
            });
            return transaction;
        }

        return {
            ...transaction,
            tag: tagRule.tag,
        };
    });
    return newSuccess(taggedTransactions, warnings);
}

export function createRuleName(tagRule: PartialTagRule) {
    if (!tagRule.tag) return undefined;
    if (!tagRule.tag.category) return undefined;
    if (!tagRule.tag.subCategory) return undefined;
    if (tagRule.name) return tagRule.name;

    return `${tagRule.tag.category}-${tagRule.tag.subCategory}`
        .toLowerCase()
        .replace(/\s+/g, "-");
}

export function hasNoIssues(
    tagRule: PartialTagRule,
    other: TagRule[]
): tagRule is TagRule {
    return getIssues(tagRule, other).length === 0;
}

export function getIssues(tagRule: PartialTagRule, other: TagRule[]) {
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

    return issues;
}

export function generateCategoryColor(category: string) {
    const isCategory = (
        category: string
    ): category is (typeof MAIN_CATEGORIES)[number] => {
        return MAIN_CATEGORIES.includes(category as any);
    };

    if (!isCategory(category)) return "hsl(0, 0%, 50%)";
    const index = MAIN_CATEGORIES.indexOf(category);

    const hue = (360 / MAIN_CATEGORIES.length) * index;
    const saturation = 50;
    const lightness = 40;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
