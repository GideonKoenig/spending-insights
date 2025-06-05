import type { Transaction } from "@/lib/types";
import type {
    FilterOption,
    FilterRule,
    TypedOperator,
} from "@/lib/transaction-filter/types";
import {
    dateEquals,
    dateAfter,
    dateBefore,
} from "@/lib/transaction-filter/operators/dates";
import { listEquals } from "@/lib/transaction-filter/operators/list";
import {
    textEquals,
    textIncludes,
    textExcludes,
} from "@/lib/transaction-filter/operators/text";
import {
    currencyEquals,
    currencyGreaterThan,
    currencyLessThan,
} from "@/lib/transaction-filter/operators/currency";
import { getOperatorsForFilterOption } from "@/lib/transaction-filter/utils";

export const OPERATORS: TypedOperator[] = [
    textIncludes,
    textExcludes,
    textEquals,
    currencyEquals,
    currencyGreaterThan,
    currencyLessThan,
    dateEquals,
    dateAfter,
    dateBefore,
    listEquals,
] as const;

export function filter(
    transactions: Transaction[],
    rules: FilterRule[],
    options: FilterOption[]
) {
    if (rules.length === 0) return transactions;

    return transactions.filter((transaction) => {
        return rules.every((rule) => {
            const value = transaction[rule.attribute];
            const operators = getOperatorsForFilterOption(
                rule.attribute,
                options,
                OPERATORS
            );

            const operator = operators.find((op) => op.name === rule.operator);
            if (!operator) return false;

            // Type assertion is safe here because we've checked the types match
            return (operator as any).compare(rule.value, value);
        });
    });
}

export function splitTransactions(
    transactions: Transaction[],
    rules: FilterRule[],
    options: FilterOption[]
) {
    if (rules.length === 0) return { matches: transactions, unmatches: [] };

    const matches: Transaction[] = [];
    const unmatches: Transaction[] = [];

    for (const transaction of transactions) {
        const isMatch = rules.every((rule) => {
            const value = transaction[rule.attribute];
            const operators = getOperatorsForFilterOption(
                rule.attribute,
                options,
                OPERATORS
            );

            const operator = operators.find((op) => op.name === rule.operator);
            if (!operator) return false;

            return (operator as any).compare(rule.value, value);
        });

        if (isMatch) matches.push(transaction);
        else unmatches.push(transaction);
    }

    return { matches, unmatches };
}
