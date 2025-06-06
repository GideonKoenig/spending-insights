import { TagRule } from "@/lib/tag-rule-engine/types";
import { Account } from "@/lib/types";
import { splitTransactions } from "@/lib/transaction-filter/main";
import { FILTER_OPTIONS } from "@/lib/transaction-filter/transaction-filter-options";
import { newSuccess } from "@/lib/utils";
import { applyTagRule } from "@/lib/tag-rule-engine/utils";

function tagAccount(account: Account, tagRules: TagRule[]) {
    if (tagRules.length === 0) return newSuccess(account);
    const result = account.transactions.slice();
    const warnings: string[] = [];

    for (const tagRule of tagRules) {
        const { matches, unmatches } = splitTransactions(
            result,
            tagRule.filters,
            FILTER_OPTIONS
        );

        if (matches.length > 0) {
            const taggedMatches = applyTagRule(matches, tagRule);
            if (taggedMatches.warnings)
                warnings.push(...taggedMatches.warnings);

            let unmatchIndex = 0;
            let matchIndex = 0;

            for (let i = 0; i < result.length; i++) {
                const transaction = result[i];
                if (matches.includes(transaction)) {
                    result[i] = taggedMatches.value[matchIndex++];
                } else {
                    result[i] = unmatches[unmatchIndex++];
                }
            }
        }
    }

    return newSuccess(result, warnings);
}

export const TagRuleEngine = {
    tagAccount,
};
