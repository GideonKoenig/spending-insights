import { RawBankTransaction } from "../readers/csv-reader.ts";
import {
    CategoryPattern,
    CategoryMatch,
    UnknownCategoryPattern,
} from "./types.ts";

export class TransactionCategorizer {
    private patterns: CategoryPattern[] = [];
    private unknownPattern = new UnknownCategoryPattern();

    constructor(patterns: CategoryPattern[] = []) {
        this.patterns = [...patterns].sort((a, b) => b.priority - a.priority);
    }

    addPattern(pattern: CategoryPattern): void {
        this.patterns.push(pattern);
        this.patterns.sort((a, b) => b.priority - a.priority);
    }

    addPatterns(patterns: CategoryPattern[]): void {
        this.patterns.push(...patterns);
        this.patterns.sort((a, b) => b.priority - a.priority);
    }

    categorize(transaction: RawBankTransaction): CategoryMatch {
        for (const pattern of this.patterns) {
            if (pattern.match(transaction)) {
                return {
                    category: pattern.category,
                    confidence: 1.0,
                    matchedRule: pattern.name,
                };
            }
        }

        return {
            category: this.unknownPattern.category,
            confidence: 0.0,
            matchedRule: this.unknownPattern.name,
        };
    }

    categorizeAll(
        transactions: RawBankTransaction[]
    ): Array<RawBankTransaction & CategoryMatch> {
        return transactions.map((transaction) => ({
            ...transaction,
            ...this.categorize(transaction),
        }));
    }

    getPatterns(): CategoryPattern[] {
        return [...this.patterns];
    }

    getStats(transactions: RawBankTransaction[]): {
        totalTransactions: number;
        categorizedTransactions: number;
        unknownTransactions: number;
        categoryBreakdown: { [category: string]: number };
        ruleBreakdown: { [rule: string]: number };
    } {
        const categorized = this.categorizeAll(transactions);
        const categoryBreakdown: { [category: string]: number } = {};
        const ruleBreakdown: { [rule: string]: number } = {};

        let unknownCount = 0;

        for (const transaction of categorized) {
            categoryBreakdown[transaction.category] =
                (categoryBreakdown[transaction.category] || 0) + 1;
            ruleBreakdown[transaction.matchedRule] =
                (ruleBreakdown[transaction.matchedRule] || 0) + 1;

            if (transaction.category === "Unknown") {
                unknownCount++;
            }
        }

        return {
            totalTransactions: transactions.length,
            categorizedTransactions: transactions.length - unknownCount,
            unknownTransactions: unknownCount,
            categoryBreakdown,
            ruleBreakdown,
        };
    }
}
