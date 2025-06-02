import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function CurrencyInput(props: {
    value: number | undefined;
    onChange: (value: number) => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    disabled?: boolean;
    placeholder?: string;
    tabIndex?: number;
    className?: string;
}) {
    return (
        <div className={cn("relative w-48", props.className)}>
            <Input
                placeholder={props.placeholder || "0.00"}
                value={props.value?.toString() || ""}
                onChange={(event) => props.onChange(Number(event.target.value))}
                className="pr-8 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                type="number"
                step="0.01"
                disabled={props.disabled}
                tabIndex={props.tabIndex}
                onKeyDown={props.onKeyDown}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                €
            </span>
        </div>
    );
}
