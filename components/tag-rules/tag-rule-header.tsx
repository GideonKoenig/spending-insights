"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Category, MAIN_CATEGORIES } from "@/lib/tag-rule-engine/types";

export function TagRuleHeader(props: {
    className?: string;
    filter: Category;
    setFilter: (category: Category) => void;
    sortSelector?: React.ReactNode;
}) {
    return (
        <div className={cn("flex flex-col gap-2", props.className)}>
            <div className="flex gap-1 items-center w-full">
                <Select
                    value={props.filter}
                    onValueChange={(value) =>
                        props.setFilter(value as Category)
                    }
                >
                    <SelectTrigger
                        className={cn(
                            "bg-background",
                            !props.sortSelector ? "flex-grow" : "min-w-44"
                        )}
                    >
                        <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {MAIN_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() +
                                    category.slice(1).replace("-", " ")}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {props.sortSelector && (
                    <>
                        <div className="flex-grow" />
                        {props.sortSelector}
                    </>
                )}
            </div>
        </div>
    );
}
