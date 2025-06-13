"use client";

import { TooltipContent } from "@/components/ui/tooltip";
import { type TagRule } from "@/lib/tag-rule-engine/types";
import { OPERATORS } from "@/lib/transaction-filter/main";
import { Calendar, Hash, Filter, Tag } from "lucide-react";

export function TagRuleCardTooltip(props: { tagRule: TagRule }) {
    return (
        <TooltipContent
            side="right"
            sideOffset={10}
            className="max-w-md p-4 bg-popover border border-border shadow-lg"
        >
            <div className="grid grid-cols-[auto_1fr] gap-3">
                <div className="flex items-center gap-2 col-span-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">Tag Rule Details</h4>
                </div>

                <div className="col-span-2 border-b border-border" />

                <div className="flex items-center gap-1 text-muted-foreground">
                    <Hash className="h-3 w-3" />
                    <span>ID:</span>
                </div>
                <code className="font-mono text-xs">{props.tagRule.id}</code>

                <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Created:</span>
                </div>
                <p>{formatDate(props.tagRule.createdAt)}</p>

                <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Updated:</span>
                </div>
                <span>{formatDate(props.tagRule.updatedAt)}</span>

                <div className="col-span-2 border-b border-border" />

                <h5 className="font-medium text-sm col-span-2 flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Tag Information
                </h5>

                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">
                    {props.tagRule.tag.category}
                </span>

                <span className="text-muted-foreground">Subcategory:</span>
                <span className="font-medium">
                    {props.tagRule.tag.subCategory}
                </span>

                {props.tagRule.tag.ignore && (
                    <>
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-orange-600 font-medium">
                            Ignored
                        </span>
                    </>
                )}

                <div className="col-span-2 border-b border-border" />

                <h5 className="font-medium col-span-2 text-sm flex items-center gap-1">
                    <Filter className="h-3 w-3" />
                    Filters ({props.tagRule.filters.length})
                </h5>

                <div className="col-span-2 flex flex-col gap-2">
                    {props.tagRule.filters.map((filter, index) => (
                        <div
                            key={index}
                            className="bg-muted/50 p-2 col-span-2 rounded text-xs border border-border/50"
                        >
                            <div className="flex items-center gap-1 font-medium text-primary">
                                <p>{filter.attribute}</p>
                                <p className="text-muted-foreground">
                                    {OPERATORS.find(
                                        (operator) =>
                                            operator.name === filter.operator
                                    )?.label ?? filter.operator}
                                </p>
                                <p className="text-muted-foreground break-words">
                                    {formatFilterValue(filter.value)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </TooltipContent>
    );
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("de-DE", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function formatFilterValue(value: string | number | Date): string {
    if (value instanceof Date) {
        return formatDate(value);
    }
    if (typeof value === "string" && value.length > 30) {
        return value.substring(0, 30) + "...";
    }
    return String(value);
}
