import { TagRule } from "@/lib/tag-rule-engine/types";
import { Account } from "@/lib/types";
import { splitTransactions } from "@/lib/transaction-filter/main";
import { TRANSACTION_FILTER } from "@/lib/transaction-filter/transaction-filter-options";
import { newSuccess } from "@/lib/utils";
import { applyTag } from "@/lib/tag-rule-engine/utils";

function tagAccount(account: Account, tagRules: TagRule[]) {
    if (tagRules.length === 0) return newSuccess(account);
    const transactions = account.transactions.slice();
    const warnings: string[] = [];

    for (const tagRule of tagRules) {
        const { matches, unmatches } = splitTransactions(
            transactions,
            tagRule.filters,
            TRANSACTION_FILTER
        );

        if (matches.length > 0) {
            const taggedMatches = applyTag(matches, tagRule);
            if (taggedMatches.warnings)
                warnings.push(...taggedMatches.warnings);

            const taggedByHash = new Map(
                taggedMatches.value.map((transaction) => [
                    transaction.hash,
                    transaction,
                ])
            );

            for (let i = 0; i < transactions.length; i++) {
                const tagged = taggedByHash.get(transactions[i].hash);
                if (tagged) {
                    transactions[i] = tagged;
                }
            }
        }
    }

    return newSuccess(
        {
            ...account,
            transactions,
        },
        warnings
    );
}

export const TagRuleEngine = {
    tagAccount,
};
