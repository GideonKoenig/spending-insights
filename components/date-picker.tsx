"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker(props: {
    value: Date | undefined;
    onChange: (value: Date | undefined) => void;
    disabled?: boolean;
    placeholder?: string;
    tabIndex?: number;
    className?: string;
}) {
    const [open, setOpen] = React.useState(false);
    const [month, setMonth] = React.useState<Date | undefined>(props.value);
    const [inputValue, setInputValue] = React.useState(formatDate(props.value));

    const currentDatePlaceholder = formatDate(new Date());

    return (
        <div className="relative flex gap-2">
            <Input
                value={inputValue}
                placeholder={props.placeholder || currentDatePlaceholder}
                className={cn("bg-background pr-10", props.className)}
                disabled={props.disabled}
                tabIndex={props.tabIndex}
                onChange={(e) => {
                    const value = e.target.value;
                    setInputValue(value);

                    const parts = value.split(".");
                    if (parts.length === 3) {
                        const day = parseInt(parts[0], 10);
                        const month = parseInt(parts[1], 10) - 1;
                        const year = parseInt(parts[2], 10);
                        const date = new Date(year, month, day);

                        if (
                            isValidDate(date) &&
                            date.getDate() === day &&
                            date.getMonth() === month &&
                            date.getFullYear() === year
                        ) {
                            props.onChange(date);
                            setMonth(date);
                        }
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setOpen(true);
                    }
                }}
            />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                        disabled={props.disabled}
                    >
                        <CalendarIcon className="size-3.5" />
                        <span className="sr-only">Select date</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="end"
                    alignOffset={-8}
                    sideOffset={10}
                >
                    <Calendar
                        mode="single"
                        selected={props.value}
                        captionLayout="dropdown"
                        month={month}
                        onMonthChange={setMonth}
                        onSelect={(date) => {
                            props.onChange(date);
                            setInputValue(formatDate(date));
                            setOpen(false);
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

function formatDate(date: Date | undefined) {
    if (!date) {
        return "";
    }

    return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function isValidDate(date: Date | undefined) {
    if (!date) {
        return false;
    }
    return !isNaN(date.getTime());
}
