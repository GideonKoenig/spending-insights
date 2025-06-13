"use client";

import { DatePicker } from "@/components/date-picker";
import { cn } from "@/lib/utils";

export function DateInput(props: {
    value: Date | undefined;
    onChange: (value: Date | undefined) => void;
    disabled?: boolean;
    placeholder?: string;
    tabIndex?: number;
    className?: string;
}) {
    return (
        <DatePicker
            value={props.value}
            onChange={props.onChange}
            disabled={props.disabled}
            placeholder={props.placeholder}
            tabIndex={props.tabIndex}
            className={cn(`w-48`, props.className)}
        />
    );
}
