"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function DateInput(props: {
    value: Date | undefined;
    onChange: (value: Date | undefined) => void;
    disabled?: boolean;
    placeholder?: string;
    tabIndex?: number;
    className?: string;
}) {
    const [open, setOpen] = useState(false);

    const handleDateSelect = (selectedDate: Date | undefined) => {
        props.onChange(selectedDate);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-48 justify-start text-left font-normal",
                        !props.value && "text-muted-foreground",
                        props.className
                    )}
                    disabled={props.disabled}
                    tabIndex={props.tabIndex}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {props.value
                        ? format(props.value, "PPP")
                        : props.placeholder || "Pick a date"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={props.value}
                    onSelect={handleDateSelect}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
