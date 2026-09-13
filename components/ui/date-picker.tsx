"use client";

import { useState, type ComponentProps } from "react";
import { format, isValid, parseISO } from "date-fns";
import { CalendarDays } from "lucide-react";
import { cn, today } from "@/lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Input } from "./input";
import { ScrollArea } from "./scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type Props = Pick<
  ComponentProps<typeof Button>,
  "className" | "disabled" | "aria-label"
> & {
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
};

export function DatePicker({
  value,
  onValueChange,
  required,
  placeholder,
  disabled,
  className,
  "aria-label": label = "Date",
}: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [invalid, setInvalid] = useState(false);
  const selected =
    value && isValid(parseISO(value)) ? parseISO(value) : undefined;
  function choose(value: string) {
    onValueChange(value);
    setOpen(false);
  }
  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        setDraft(value);
        setInvalid(false);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          aria-label={`${label}: ${value || "Any date"}`}
          aria-required={required}
          className={cn(
            "input justify-start font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
          <span className="tabular-nums">
            {selected
              ? format(selected, "dd MMM yyyy")
              : (placeholder ?? label)}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto overflow-hidden p-0">
        <ScrollArea viewportClassName="max-h-[var(--radix-popover-content-available-height)]">
          <div className="border-b border-border p-3">
            <Input
              aria-label="Type date"
              placeholder="YYYY-MM-DD"
              value={draft}
              aria-invalid={invalid || undefined}
              onChange={(event) => {
                setDraft(event.target.value);
                setInvalid(false);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                if (
                  /^\d{4}-\d{2}-\d{2}$/.test(draft) &&
                  isValid(parseISO(draft))
                )
                  choose(draft);
                else setInvalid(true);
              }}
            />
            <p
              className={cn(
                "mt-2 text-xs",
                invalid ? "text-danger" : "text-muted-foreground",
              )}
            >
              {invalid
                ? "Use a valid date: YYYY-MM-DD"
                : "YYYY-MM-DD · Enter to apply"}
            </p>
          </div>
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(date) => {
              if (date) choose(format(date, "yyyy-MM-dd"));
            }}
            weekStartsOn={1}
          />
          <div className="flex justify-between border-t border-border p-2">
            <Button variant="ghost" size="sm" onClick={() => choose(today())}>
              Today
            </Button>
            {!required && (
              <Button variant="ghost" size="sm" onClick={() => choose("")}>
                Clear
              </Button>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
