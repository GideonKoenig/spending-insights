"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import type { Transaction } from "@/lib/types";
import type { FilterCondition } from "@/lib/filtering/types";
import type { DateRangeFilter } from "@/lib/filtering/types";
import { cn } from "@/lib/utils";

const FIELD_OPTIONS: { value: keyof Transaction; label: string }[] = [
    { value: "paymentParticipant", label: "Participant" },
    { value: "purpose", label: "Purpose" },
    { value: "amount", label: "Amount" },
    { value: "transactionType", label: "Type" },
];

const OPERATOR_OPTIONS = [
    { value: "equals", label: "Equals" },
    { value: "contains", label: "Contains" },
    { value: "includes", label: "Includes (multiple)" },
    { value: "greater", label: "Greater than" },
    { value: "less", label: "Less than" },
    { value: "greaterEqual", label: "Greater or equal" },
    { value: "lessEqual", label: "Less or equal" },
] as const;

interface FilterPanelProps {
    dateRange: DateRangeFilter;
    setDateRange: (range: DateRangeFilter) => void;
    filterConditions: FilterCondition<Transaction>[];
    addFilterCondition: (condition: FilterCondition<Transaction>) => void;
    removeFilterCondition: (id: string) => void;
}

export function FilterPanel(props: FilterPanelProps) {
    const { dateRange, setDateRange } = props;

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-medium mb-2">Date Range</h3>
                <div className="flex items-center space-x-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !dateRange.from && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from
                                    ? format(dateRange.from, "PPP")
                                    : "From date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateRange.from}
                                onSelect={(date) =>
                                    setDateRange({
                                        ...dateRange,
                                        from: date,
                                    })
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <span className="text-muted-foreground">to</span>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !dateRange.to && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.to
                                    ? format(dateRange.to, "PPP")
                                    : "To date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateRange.to}
                                onSelect={(date) =>
                                    setDateRange({
                                        ...dateRange,
                                        to: date,
                                    })
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            {/* Additional filter UI components will go here */}
        </div>
    );
}

function MultiValueInput(props: {
    value: string[];
    onChange: (values: string[]) => void;
}) {
    const [inputValue, setInputValue] = useState("");

    function addValue() {
        if (inputValue.trim() && !props.value.includes(inputValue.trim())) {
            props.onChange([...props.value, inputValue.trim()]);
            setInputValue("");
        }
    }

    function removeValue(index: number) {
        props.onChange(props.value.filter((_, i) => i !== index));
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-1 rounded-md border border-border bg-background p-2 min-h-[40px]">
                {props.value.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-sm"
                    >
                        <span>{item}</span>
                        <button
                            onClick={() => removeValue(index)}
                            className="hover:text-destructive"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addValue();
                        }
                    }}
                    placeholder="Add value..."
                    className="min-w-32 flex-1 border-none bg-transparent px-1 py-1 text-sm outline-none"
                />
            </div>
        </div>
    );
}
