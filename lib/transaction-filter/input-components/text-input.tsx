import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function TextInput(props: {
    value: string | undefined;
    onChange: (value: string) => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    disabled?: boolean;
    placeholder?: string;
    tabIndex?: number;
    className?: string;
}) {
    return (
        <Input
            placeholder={props.placeholder || "Value"}
            value={props.value || ""}
            onChange={(event) => props.onChange(event.target.value)}
            className={cn("w-48 text-sm", props.className)}
            type="text"
            disabled={props.disabled}
            tabIndex={props.tabIndex}
            onKeyDown={props.onKeyDown}
        />
    );
}
