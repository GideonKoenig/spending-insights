import type { Transaction } from "@/lib/types";
import { getValueType } from "@/lib/transaction-filter/utils";
import type {
    FilterRule,
    TypedOperator,
    ValueType,
} from "@/lib/transaction-filter/types";
import {
    stringEquals,
    stringIncludes,
} from "@/lib/transaction-filter/operators/strings";
import {
    numberEquals,
    numberGreaterThan,
    numberLessThan,
} from "@/lib/transaction-filter/operators/numbers";
import {
    dateEquals,
    dateAfter,
    dateBefore,
} from "@/lib/transaction-filter/operators/dates";

export const OPERATORS: TypedOperator[] = [
    stringEquals,
    stringIncludes,
    numberEquals,
    numberGreaterThan,
    numberLessThan,
    dateEquals,
    dateAfter,
    dateBefore,
] as const;

export function getOperatorsForType(type: ValueType) {
    return OPERATORS.filter((op) => op.type === type);
}

export function filter(transactions: Transaction[], rules: FilterRule[]) {
    if (rules.length === 0) return transactions;

    return transactions.filter((transaction) => {
        return rules.every((rule) => {
            const value = transaction[rule.attribute];
            const valueType = getValueType(value);
            if (!valueType) return false;

            const operator = OPERATORS.find(
                (op) => op.name === rule.operator && op.type === valueType
            );
            if (!operator) return false;

            // Type assertion is safe here because we've checked the types match
            return (operator as any).compare(rule.value, value);
        });
    });
}
