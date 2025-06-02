import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function ListInput(props: {
    value: string | undefined;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    tabIndex?: number;
    options: string[];
    className?: string;
}) {
    return (
        <Select
            value={props.value || ""}
            onValueChange={props.onChange}
            disabled={props.disabled}
        >
            <SelectTrigger
                className={cn("w-48 text-sm", props.className)}
                tabIndex={props.tabIndex}
            >
                <SelectValue
                    placeholder={props.placeholder || "Select option..."}
                />
            </SelectTrigger>
            <SelectContent>
                {props.options.map((option) => (
                    <SelectItem key={option} value={option}>
                        {option}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
