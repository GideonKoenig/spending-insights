import { TagRule } from "@/lib/transaction-tags/types";
import { Transaction } from "@/lib/types";
import { splitTransactions } from "@/lib/transaction-filter/main";
import { FILTER_OPTIONS } from "@/lib/transaction-filter/transaction-filter-options";
import { applyTagRule } from "@/lib/transaction-tags/utils";

export function tagTransactions(
    transactions: Transaction[],
    tagRules: TagRule[],
    addDebug?: (origin: string, message: string) => void
) {
    if (tagRules.length === 0) return transactions;
    const result = transactions.slice();

    for (const tagRule of tagRules) {
        const { matches, unmatches } = splitTransactions(
            result,
            tagRule.filters,
            FILTER_OPTIONS
        );

        if (matches.length > 0) {
            const taggedMatches = applyTagRule(matches, tagRule);

            let unmatchIndex = 0;
            let matchIndex = 0;

            for (let i = 0; i < result.length; i++) {
                const transaction = result[i];
                if (matches.includes(transaction)) {
                    result[i] = taggedMatches[matchIndex++];
                } else {
                    result[i] = unmatches[unmatchIndex++];
                }
            }
        }
    }

    return result;
}
