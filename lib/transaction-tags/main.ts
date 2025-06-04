import { TagRule } from "@/lib/transaction-tags/types";
import { Transaction } from "@/lib/types";
import { splitTransactions } from "@/lib/transaction-filter/main";
import { FILTER_OPTIONS } from "@/lib/transaction-filter/transaction-filter-options";
import { applyTagRule } from "@/lib/transaction-tags/utils";

export function tagTransactions(
    transactions: Transaction[],
    tagRules: TagRule[]
) {
    let taggedTransactions: Transaction[] = transactions;
    for (const tagRule of tagRules) {
        console.dir(tagRule, { depth: null });

        const { matches, unmatches } = splitTransactions(
            taggedTransactions,
            tagRule.filters,
            FILTER_OPTIONS
        );
        const taggedMatches = applyTagRule(matches, tagRule);

        taggedTransactions = [...unmatches, ...taggedMatches];
    }

    return taggedTransactions;
}
