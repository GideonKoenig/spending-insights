import type { Pattern } from "./types.ts";
import type { Transaction } from "@/readers/csv-reader.ts";
import { groceries } from "./rules/groceries.ts";
import { restaurantFastFood } from "./rules/restaurant-fast-food.ts";
import { fixedCosts } from "./rules/fixed-costs.ts";
import { income } from "./rules/income.ts";
import { shopping } from "./rules/shopping.ts";
import { restaurantGeneral } from "./rules/restaurant-general.ts";
import { restaurantBakery } from "./rules/restaurant-bakery.ts";
import { reimbursement } from "./rules/reimbursement.ts";
import { fun } from "./rules/fun.ts";
import { fixedCostsProfessional } from "./rules/fixed-costs-professional.ts";
import { health } from "./rules/health.ts";
import { charity } from "./rules/charity.ts";
import { transport } from "./rules/transport.ts";
import { vacation } from "./rules/vacation.ts";

export const defaultPattern: Pattern = {
    name: "unknown",
    priority: -2,
    matcher: (_transaction: Transaction) => true,
};

export const skipPattern: Pattern = {
    name: "skip",
    priority: -1,
    matcher: (_transaction: Transaction) => true,
};

export const patterns: Pattern[] = [
    groceries,
    restaurantFastFood,
    restaurantBakery,
    fixedCosts,
    fixedCostsProfessional,
    income,
    shopping,
    restaurantGeneral,
    health,
    fun,
    charity,
    transport,
    vacation,
    reimbursement,
    defaultPattern,
];

export function categorize(transaction: Transaction): {
    transaction: Transaction;
    pattern: Pattern;
    details?: string;
} {
    const matches = patterns
        .map((pattern) => ({
            matched: pattern.matcher(transaction),
            name: pattern.name,
            priority: pattern.priority,
            pattern,
        }))
        .filter((entry) => entry.matched)
        .sort((a, b) => b.priority - a.priority);

    const best = matches[0];
    return {
        transaction,
        pattern: best.pattern,
        details: best.pattern.getDetails?.(transaction),
    };
}

export function createStatistics(
    categorized: { transaction: Transaction; pattern: Pattern }[]
) {
    const totalTransactions = categorized.length;
    const patternBreakdown: Record<string, number> = {};
    let unknownCount = 0;
    for (const { pattern } of categorized) {
        patternBreakdown[pattern.name] =
            (patternBreakdown[pattern.name] || 0) + 1;
        if (pattern === defaultPattern) unknownCount++;
    }
    const patternStats = Object.entries(patternBreakdown).map(
        ([name, count]) => ({
            name,
            count,
            percentage:
                totalTransactions > 0 ? (count / totalTransactions) * 100 : 0,
        })
    );
    return {
        totalTransactions,
        patternBreakdown,
        patternStats,
        unknownCount,
    };
}
