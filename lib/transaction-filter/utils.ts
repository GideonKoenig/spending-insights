import { FilterOption, TypedOperator } from "@/lib/transaction-filter/types";
import { Transaction } from "@/lib/types";

export function getOperatorsForFilterOption(
    attribute: string,
    options: FilterOption[],
    operators: TypedOperator[]
) {
    const option = options.find((o) => o.attribute === attribute);
    if (!option) return [];
    return operators.filter((op) => op.type === option.inputType);
}

export function getListOptions(
    filterOption: FilterOption,
    transactions: Transaction[]
) {
    return Array.from(
        new Set(transactions.map((t) => t[filterOption.attribute]!.toString()))
    );
}
