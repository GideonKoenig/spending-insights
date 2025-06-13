"use client";

import { Button } from "@/components/ui/button";
import { TagBadge } from "@/components/tag-rules/tag-badge";
import { type TagRule } from "@/lib/tag-rule-engine/types";
import { cn } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";
import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { TagRuleCardTooltip } from "@/components/tag-rules/tag-rule-card-tooltip";

export function TagRuleCard(props: {
    tagRule: TagRule;
    count?: number;
    className?: string;
    style?: React.CSSProperties;
    selectTagRule: (tagRule: TagRule) => void;
    deleteTagRule: (tagRule: TagRule) => void;
}) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={20}>
                <TooltipTrigger asChild>
                    <div
                        className={cn(
                            "p-6 flex items-center gap-4 bg-card text-card-foreground rounded-md border shadow-sm cursor-help hover:bg-accent/5 transition-colors",
                            props.className
                        )}
                        style={props.style}
                    >
                        <div className="flex-grow flex items-center gap-3">
                            <TagBadge tag={props.tagRule.tag} />

                            {props.tagRule.tag.subCategory && (
                                <div className="flex flex-col">
                                    <p className="text-xs text-muted-foreground">
                                        {props.tagRule.tag.subCategory}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{props.count ?? 0} transactions</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    props.selectTagRule(props.tagRule)
                                }
                                className="h-8 w-8 p-0"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    props.deleteTagRule(props.tagRule)
                                }
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </TooltipTrigger>
                <TagRuleCardTooltip tagRule={props.tagRule} />
            </Tooltip>
        </TooltipProvider>
    );
}
