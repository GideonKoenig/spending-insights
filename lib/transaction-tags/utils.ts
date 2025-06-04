import { PartialTagRule, TagRule } from "@/lib/transaction-tags/types";
import { Transaction } from "@/lib/types";

export function getTaggedTransactions(transactions: Transaction[]) {
    return transactions.filter((transaction) => transaction.tag);
}

export function getUntaggedTransactions(transactions: Transaction[]) {
    return transactions.filter((transaction) => !transaction.tag);
}

export function applyTagRule(transactions: Transaction[], tagRule: TagRule) {
    return transactions.map((transaction) => ({
        ...transaction,
        tag: tagRule.tag,
    }));
}

export function createRuleName(tagRule: PartialTagRule) {
    if (!tagRule.tag) return undefined;
    if (!tagRule.tag.category) return undefined;
    if (!tagRule.tag.subCategory && !tagRule.name) return undefined;

    const hasName = tagRule.name?.trim();
    const hasCategory = tagRule.tag.category;
    const hasSubCategory = tagRule.tag.subCategory?.trim();

    console.log(hasName, hasCategory, hasSubCategory);
    console.log(
        `${hasCategory!.toLowerCase()}-${hasSubCategory!.toLowerCase()}`.replace(
            /\s+/g,
            "-"
        )
    );

    return hasName
        ? hasName
        : `${hasCategory!.toLowerCase()}-${hasSubCategory!.toLowerCase()}`.replace(
              /\s+/g,
              "-"
          );
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

    if (hasCategory && (hasName || hasSubCategory)) {
        const ruleName = createRuleName(tagRule);
        const existingRule = other.find((rule) => rule.name === ruleName);
        if (existingRule) {
            issues.push(`change the name - "${ruleName}" already exists`);
        }
    }

    return issues;
}
