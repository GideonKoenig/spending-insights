"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { type Transaction } from "@/lib/types";
import { TypedOperator, type FilterRule } from "@/lib/transaction-filter/types";
import { OPERATORS } from "@/lib/transaction-filter/main";
import { FILTER_OPTIONS } from "@/lib/transaction-filter/transaction-filter-options";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TextInput } from "@/lib/transaction-filter/input-components/text-input";
import { CurrencyInput } from "@/lib/transaction-filter/input-components/currency-input";
import { DateInput } from "@/lib/transaction-filter/input-components/date-input";
import { ListInput } from "@/lib/transaction-filter/input-components/list-input";
import { TransactionFilterBadge } from "@/lib/transaction-filter/badge";
import {
    getListOptions,
    getOperatorsForFilterOption,
} from "@/lib/transaction-filter/utils";
import { cn } from "@/lib/utils";

type Value = string | number | Date | undefined;

export function TransactionHeader(props: {
    onFiltersChange: (filters: FilterRule[]) => void;
    filters: FilterRule[];
    transactions: Transaction[];
    filteredCount: number;
}) {
    const [option, setOption] = useState(FILTER_OPTIONS[0]);
    const [operator, setOperator] = useState<TypedOperator>(
        getAvailableOperators(option.attribute)[0]
    );
    const [value, setValue] = useState<Value>(undefined);

    const addFilter = () => {
        if (!option || !operator || value === undefined) return;

        const newFilter: FilterRule = {
            attribute: option.attribute,
            operator: operator.name,
            value,
        };

        props.onFiltersChange([...props.filters, newFilter]);
        setValue(undefined);
    };

    const removeFilter = (index: number) => {
        const newFilters = [...props.filters];
        newFilters.splice(index, 1);
        props.onFiltersChange(newFilters);
    };

    const updateFilterOperator = (index: number, newOperator: string) => {
        const newFilters = [...props.filters];
        newFilters[index] = { ...newFilters[index], operator: newOperator };
        props.onFiltersChange(newFilters);
    };

    const clearAllFilters = () => {
        props.onFiltersChange([]);
    };

    const submit = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            addFilter();
        }
    };

    return (
        <div className="p-2 flex flex-col gap-4">
            {props.filters.length > 0 && (
                <div className="flex">
                    <div className="flex flex-col flex-grow gap-2">
                        {props.filters.map((filter, index) => (
                            <TransactionFilterBadge
                                key={index}
                                filter={filter}
                                remove={() => removeFilter(index)}
                                onOperatorChange={(newOperator) =>
                                    updateFilterOperator(index, newOperator)
                                }
                            />
                        ))}
                    </div>

                    <p className="text-xs text-muted-foreground">
                        {`${props.filteredCount}/${props.transactions.length} Transactions`}
                    </p>
                </div>
            )}

            <div className="flex gap-1 items-center">
                <Select
                    value={option.attribute}
                    onValueChange={(newAttribute) => {
                        const option = FILTER_OPTIONS.find(
                            (opt) => opt.attribute === newAttribute
                        );
                        if (option) {
                            setOption(option);
                            setOperator(getAvailableOperators(newAttribute)[0]);
                            setValue(undefined);
                        }
                    }}
                >
                    <SelectTrigger className="w-48" tabIndex={1}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {FILTER_OPTIONS.map((option) => (
                            <SelectItem
                                key={option.attribute}
                                value={option.attribute}
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={operator.name}
                    onValueChange={(newOperator) => {
                        setOperator(
                            getAvailableOperators(option.attribute).find(
                                (op) => op.name === newOperator
                            )!
                        );
                    }}
                    disabled={!option}
                >
                    <SelectTrigger className="w-48" tabIndex={2}>
                        <SelectValue placeholder="Select operator..." />
                    </SelectTrigger>
                    <SelectContent>
                        {getAvailableOperators(option.attribute).map((op) => (
                            <SelectItem key={op.name} value={op.name}>
                                {op.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {option.inputType === "text" && (
                    <TextInput
                        tabIndex={3}
                        value={value as string}
                        onChange={setValue}
                        onKeyDown={submit}
                    />
                )}

                {option.inputType === "currency" && (
                    <CurrencyInput
                        tabIndex={3}
                        value={value as number}
                        onChange={setValue}
                        onKeyDown={submit}
                    />
                )}

                {option.inputType === "date" && (
                    <DateInput
                        tabIndex={3}
                        value={value as Date}
                        onChange={setValue}
                    />
                )}

                {option.inputType === "list" && (
                    <ListInput
                        tabIndex={3}
                        value={value as string}
                        onChange={setValue}
                        options={getListOptions(option, props.transactions)}
                    />
                )}

                <Button
                    className="text-xs"
                    size="sm"
                    onClick={addFilter}
                    disabled={!option || !operator || value === undefined}
                    tabIndex={4}
                >
                    Add
                </Button>

                <div className="flex-grow" />

                <Button
                    variant="ghost"
                    tabIndex={5}
                    className={cn(
                        "text-xs",
                        props.filters.length > 0 && "border border-border"
                    )}
                    onClick={clearAllFilters}
                    disabled={props.filters.length < 1}
                >
                    Clear
                </Button>
            </div>
        </div>
    );
}

function getAvailableOperators(attribute: string) {
    return getOperatorsForFilterOption(attribute, FILTER_OPTIONS, OPERATORS);
}
