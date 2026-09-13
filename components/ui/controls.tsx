"use client";

import {
  useEffect,
  useId,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import { Checkbox as CheckboxRoot } from "./checkbox";
import {
  Select as SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem as Item,
} from "./select";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./dialog";

const emptyValue = "__empty__";

type SelectProps = Pick<
  ComponentProps<typeof SelectRoot>,
  "value" | "onValueChange" | "disabled" | "required"
> & {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
};

export { Button } from "./button";
export { Input } from "./input";
export { DatePicker } from "./date-picker";
export { SelectGroup, SelectLabel } from "./select";
export { ScrollArea } from "./scroll-area";

export function Select({
  value,
  onValueChange,
  disabled,
  required,
  children,
  className,
  "aria-label": label,
}: SelectProps) {
  return (
    <SelectRoot
      value={value || (required ? "" : emptyValue)}
      onValueChange={(value) =>
        onValueChange?.(value === emptyValue ? "" : value)
      }
      disabled={disabled}
      required={required}
    >
      <SelectTrigger
        aria-label={label}
        className={cn("input w-full", className)}
      >
        <SelectValue placeholder="Choose account" />
      </SelectTrigger>
      <SelectContent position="popper" align="start">
        {children}
      </SelectContent>
    </SelectRoot>
  );
}

export function SelectItem({ value, ...props }: ComponentProps<typeof Item>) {
  return <Item value={value || emptyValue} {...props} />;
}

export function Checkbox({
  onCheckedChange,
  ...props
}: Omit<ComponentProps<typeof CheckboxRoot>, "onCheckedChange"> & {
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <CheckboxRoot
      onCheckedChange={(checked) => onCheckedChange?.(checked === true)}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Modal({
  title,
  description,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const descriptionId = useId();
  const [opener] = useState(() =>
    typeof document !== "undefined" &&
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null,
  );
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className={cn(
          "max-h-[90dvh] gap-0 overflow-hidden p-0",
          wide && "sm:max-w-3xl",
        )}
        aria-describedby={description ? descriptionId : undefined}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          opener?.focus();
          if (document.activeElement === opener && opener !== document.body)
            return;
          document.querySelector<HTMLElement>("main")?.focus();
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 pr-16">
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription id={descriptionId}>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <ScrollArea viewportClassName="max-h-[calc(90dvh-6rem)]">
          <div className="grid gap-4 px-6 pb-6 pt-1">{children}</div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function ErrorMessage({ error }: { error: Error | null | undefined }) {
  if (!error) return null;
  return (
    <p
      role="alert"
      className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger"
    >
      {error.message}
    </p>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-52 items-center justify-center rounded-xl border border-dashed border-border px-6 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

export function Loading({
  variant = "table",
}: {
  variant?: "table" | "dashboard" | "form";
}) {
  if (variant === "form")
    return (
      <div
        role="status"
        className="flex min-h-36 items-center justify-center gap-3 text-sm text-muted-foreground"
      >
        <LoaderCircle aria-hidden className="size-4 animate-spin" />
        Loading…
      </div>
    );
  return (
    <div role="status" className="grid gap-5">
      <span className="sr-only">Loading…</span>
      {variant === "dashboard" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="panel h-32 animate-pulse" />
            ))}
          </div>
          <div className="panel h-96 animate-pulse" />
        </>
      ) : (
        <div className="panel overflow-hidden" aria-hidden>
          <div className="h-12 border-b border-border bg-muted/30" />
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="flex h-[69px] items-center justify-between gap-6 border-b border-border/60 px-4 last:border-0"
            >
              <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}
    </div>
  );
}

export function Pagination({
  offset,
  total,
  onChange,
  size = 50,
  fetchStatus = "idle",
}: {
  offset: number;
  total: number | undefined;
  onChange: (offset: number) => void;
  size?: number;
  fetchStatus?: "idle" | "fetching" | "paused";
}) {
  const pending = fetchStatus !== "idle";
  const lastOffset = Math.max(0, Math.ceil((total ?? 0) / size) - 1) * size;
  useEffect(() => {
    if (!pending && total !== undefined && offset > lastOffset)
      onChange(lastOffset);
  }, [pending, total, offset, lastOffset, onChange]);
  return (
    <div className="mt-4 flex items-center justify-between gap-4 text-sm text-muted-foreground">
      <span role="status">
        {fetchStatus === "paused"
          ? "Waiting for connection…"
          : pending
            ? "Updating…"
            : total === undefined
              ? "Results unavailable"
              : total
                ? `${Math.min(offset + 1, total)}–${Math.min(offset + size, total)} of ${total}`
                : "0 results"}
      </span>
      <div className="flex gap-2">
        <Button
          disabled={pending || !offset}
          onClick={() => onChange(Math.max(0, offset - size))}
        >
          Previous
        </Button>
        <Button
          disabled={pending || total === undefined || offset + size >= total}
          onClick={() => onChange(offset + size)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
