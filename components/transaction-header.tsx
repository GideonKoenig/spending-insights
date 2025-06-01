"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { type Transaction } from "@/lib/types";
import { type FilterRule } from "@/lib/transaction-filter/types";
import { getOperatorsForType } from "@/lib/transaction-filter/main";
import { getValueType } from "@/lib/transaction-filter/utils";
import { Badge } from "@/components/ui/badge";

// Curated list of filterable attributes, ordered by relevance
const FILTER_ATTRIBUTES: Array<{
    value: keyof Transaction;
    label: string;
    description: string;
}> = [
    {
        value: "amount",
        label: "Amount",
        description: "Transaction amount",
    },
    {
        value: "bookingDate",
        label: "Date",
        description: "Transaction date",
    },
    {
        value: "paymentParticipant",
        label: "Participant",
        description: "Name of the transaction participant",
    },
    {
        value: "purpose",
        label: "Purpose",
        description: "Transaction purpose or description",
    },
    {
        value: "transactionType",
        label: "Type",
        description: "Type of transaction",
    },
    {
        value: "currency",
        label: "Currency",
        description: "Transaction currency",
    },
    {
        value: "balanceAfterTransaction",
        label: "Balance",
        description: "Account balance after transaction",
    },
];

export function TransactionHeader(props: {
    onFiltersChange: (filters: FilterRule[]) => void;
    filters: FilterRule[];
}) {
    const [open, setOpen] = useState(false);
    const [selectedAttribute, setSelectedAttribute] = useState<
        keyof Transaction | ""
    >("");
    const [selectedOperator, setSelectedOperator] = useState("");
    const [filterValue, setFilterValue] = useState("");

    // Get available operators based on the selected attribute
    const getAvailableOperators = () => {
        if (!selectedAttribute) return [];
        const sampleTransaction: Transaction = {
            accountName: "",
            accountIban: "",
            accountBic: "",
            bankName: "",
            bookingDate: new Date(),
            valueDate: new Date(),
            paymentParticipant: "",
            paymentParticipantIban: "",
            paymentParticipantBic: "",
            transactionType: "",
            purpose: "",
            amount: 0,
            currency: "EUR",
            balanceAfterTransaction: 0,
            note: "",
            markedTransaction: "",
            creditorId: "",
            mandateReference: "",
        };
        const value = sampleTransaction[selectedAttribute];
        const valueType = getValueType(value);
        return valueType ? getOperatorsForType(valueType) : [];
    };

    const addFilter = () => {
        if (!selectedAttribute || !selectedOperator || !filterValue) return;

        const sampleValue = {
            accountName: "",
            accountIban: "",
            accountBic: "",
            bankName: "",
            bookingDate: new Date(),
            valueDate: new Date(),
            paymentParticipant: "",
            paymentParticipantIban: "",
            paymentParticipantBic: "",
            transactionType: "",
            purpose: "",
            amount: 0,
            currency: "EUR",
            balanceAfterTransaction: 0,
            note: "",
            markedTransaction: "",
            creditorId: "",
            mandateReference: "",
        }[selectedAttribute];

        let parsedValue: string | number | Date = filterValue;
        if (typeof sampleValue === "number") {
            parsedValue = parseFloat(filterValue);
        } else if (sampleValue instanceof Date) {
            parsedValue = new Date(filterValue);
        }

        const newFilter: FilterRule = {
            attribute: selectedAttribute,
            operator: selectedOperator,
            value: parsedValue,
        };

        props.onFiltersChange([...props.filters, newFilter]);
        setSelectedAttribute("");
        setSelectedOperator("");
        setFilterValue("");
        setOpen(false);
    };

    const removeFilter = (index: number) => {
        const newFilters = [...props.filters];
        newFilters.splice(index, 1);
        props.onFiltersChange(newFilters);
    };

    return (
        <div className="p-4 border-b space-y-4">
            <div className="flex gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-[200px] justify-between"
                        >
                            {selectedAttribute
                                ? FILTER_ATTRIBUTES.find(
                                      (attr) => attr.value === selectedAttribute
                                  )?.label
                                : "Select field..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                        <Command>
                            <CommandInput placeholder="Search field..." />
                            <CommandEmpty>No field found.</CommandEmpty>
                            <CommandGroup>
                                {FILTER_ATTRIBUTES.map((attr) => (
                                    <CommandItem
                                        key={attr.value}
                                        value={attr.value}
                                        onSelect={(value) => {
                                            setSelectedAttribute(
                                                value as keyof Transaction
                                            );
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedAttribute === attr.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {attr.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-[200px]"
                            disabled={!selectedAttribute}
                        >
                            {selectedOperator || "Select operator..."}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                        <Command>
                            <CommandGroup>
                                {getAvailableOperators().map((op) => (
                                    <CommandItem
                                        key={op.name}
                                        onSelect={() =>
                                            setSelectedOperator(op.name)
                                        }
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedOperator === op.name
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {op.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>

                <Input
                    placeholder="Value"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="w-[200px]"
                    type={selectedAttribute?.includes("Date") ? "date" : "text"}
                    disabled={!selectedOperator}
                />

                <Button
                    onClick={addFilter}
                    disabled={
                        !selectedAttribute || !selectedOperator || !filterValue
                    }
                >
                    Add Filter
                </Button>
            </div>

            {props.filters.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    {props.filters.map((filter, index) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-2"
                        >
                            {FILTER_ATTRIBUTES.find(
                                (attr) => attr.value === filter.attribute
                            )?.label || filter.attribute}{" "}
                            {filter.operator} {filter.value.toString()}
                            <button
                                onClick={() => removeFilter(index)}
                                className="hover:text-destructive"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
