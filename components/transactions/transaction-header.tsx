"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { type Transaction } from "@/lib/types";
import {
    type FilterRule,
    type TypedOperator,
} from "@/lib/transaction-filter/types";
import { FILTER_OPTIONS } from "@/lib/transaction-filter/transaction-filter-options";
import { getOperatorsForFilterOption } from "@/lib/transaction-filter/utils";
import { OPERATORS } from "@/lib/transaction-filter/main";
import { TextInput } from "@/lib/transaction-filter/input-components/text-input";
import { CurrencyInput } from "@/lib/transaction-filter/input-components/currency-input";
import { DateInput } from "@/lib/transaction-filter/input-components/date-input";
import { ListInput } from "@/lib/transaction-filter/input-components/list-input";
import { getListOptions } from "@/lib/transaction-filter/utils";
import { TransactionFilterBadge } from "@/lib/transaction-filter/badge";
import { type SortOption } from "@/lib/transaction-sorter";
import { cn } from "@/lib/utils";

type Value = string | number | Date | undefined;

export function TransactionHeader(props: {
    className?: string;
    onFiltersChange: (filters: FilterRule[]) => void;
    filters: FilterRule[];
    transactions: Transaction[];
    sortSelector?: React.ReactNode;
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
            value: typeof value === "string" ? value.trim() : value,
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
        <div className={cn("flex flex-col gap-2", props.className)}>
            {props.filters.length > 0 && (
                <div className="flex gap-2">
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

                    <div className="flex items-end justify-end">
                        <Button
                            variant="ghost"
                            className="text-xs border border-border"
                            onClick={clearAllFilters}
                            disabled={props.filters.length < 1}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex gap-1 items-center w-full">
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
                    <SelectTrigger
                        className="min-w-44 bg-background"
                        tabIndex={1}
                    >
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
                    <SelectTrigger
                        className="min-w-28 bg-background"
                        tabIndex={2}
                    >
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
                        className={cn(
                            "bg-background",
                            !props.sortSelector ? "flex-grow " : ""
                        )}
                        tabIndex={3}
                        value={value as string}
                        onChange={setValue}
                        onKeyDown={submit}
                    />
                )}

                {option.inputType === "currency" && (
                    <CurrencyInput
                        className={cn(
                            "bg-background",
                            !props.sortSelector ? "flex-grow" : ""
                        )}
                        tabIndex={3}
                        value={value as number}
                        onChange={setValue}
                        onKeyDown={submit}
                    />
                )}

                {option.inputType === "date" && (
                    <DateInput
                        className={cn(
                            "bg-background",
                            !props.sortSelector ? "flex-grow" : ""
                        )}
                        tabIndex={3}
                        value={value as Date}
                        onChange={setValue}
                    />
                )}

                {option.inputType === "list" && (
                    <ListInput
                        className={cn(
                            "bg-background",
                            !props.sortSelector ? "flex-grow" : ""
                        )}
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

                {props.sortSelector && (
                    <>
                        <div className="flex-grow" />
                        {props.sortSelector}
                    </>
                )}
            </div>
        </div>
    );
}

function getAvailableOperators(attribute: string) {
    return getOperatorsForFilterOption(attribute, FILTER_OPTIONS, OPERATORS);
}
