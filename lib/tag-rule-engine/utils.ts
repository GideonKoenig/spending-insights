import {
    MAIN_CATEGORIES,
    PartialTagRule,
    TagRule,
} from "@/lib/tag-rule-engine/types";
import { Transaction } from "@/lib/types";
import { newSuccess } from "@/lib/utils";

export function applyTagRule(transactions: Transaction[], tagRule: TagRule) {
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
    if (!tagRule.tag.subCategory && !tagRule.name) return undefined;

    const hasName = tagRule.name?.trim();
    const hasCategory = tagRule.tag.category;
    const hasSubCategory = tagRule.tag.subCategory?.trim();

    let baseName = "";
    if (hasName && tagRule.id) baseName = hasName;
    if (hasName && !tagRule.id) baseName = `${hasCategory}-${hasName}`;
    if (!hasName) baseName = `${hasCategory}-${hasSubCategory}`;
    return baseName.toLowerCase().replace(/\s+/g, "-");
}

export function hasNoIssues(
    tagRule: PartialTagRule,
    other: TagRule[]
): tagRule is TagRule {
    return getIssues(tagRule, other).length === 0;
}

export function getIssues(tagRule: PartialTagRule, other: TagRule[]) {
    const hasName = tagRule.name?.trim();
    const hasCategory = tagRule.tag?.category;
    const hasSubCategory = tagRule.tag?.subCategory?.trim();

    const issues = [];

    if (!hasName && !hasSubCategory) {
        issues.push(
            "provide a name or subcategory (name will be auto-generated if subcategory is provided)"
        );
    }

    if (tagRule.filters.length < 1) {
        issues.push("add at least one filter");
    }

    if (!hasCategory) {
        issues.push("select a category for the tag");
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
