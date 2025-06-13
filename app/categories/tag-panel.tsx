"use client";

import { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    MAIN_CATEGORIES,
    PartialTagRule,
    TagRule,
    Tag,
} from "@/lib/tag-rule-engine/types";
import { useNotifications } from "@/contexts/notification/provider";
import { cn } from "@/lib/utils";
import { useTagRules } from "@/contexts/tag-rules/provider";
import React from "react";
import { getCleanTagRule } from "@/lib/tag-rule-engine/utils";
import { Info } from "lucide-react";

export function TagPanel(props: {
    selectedRule: PartialTagRule;
    setCurrentRule: Dispatch<SetStateAction<PartialTagRule>>;
}) {
    const notificationContext = useNotifications();
    const tagRuleContext = useTagRules();

    const saveRule = () => {
        const validation = getCleanTagRule(
            props.selectedRule,
            tagRuleContext.tagRules
        );
        if (!validation.success) {
            notificationContext.addError("Tag Panel", validation.error);
            return;
        }
        const tagRule = validation.value;
        const tagRuleId = tagRule.id ?? crypto.randomUUID();

        const tag: Tag = {
            category: tagRule.tag.category.toLowerCase(),
            subCategory: tagRule.tag.subCategory?.toLowerCase(),
            ignore: tagRule.tag.ignore,
            ruleId: tagRuleId,
        };

        const newRule: TagRule = {
            id: tagRuleId,
            filters: tagRule.filters,
            tag: tag,
            createdAt: tagRule.createdAt ?? new Date(),
            updatedAt: new Date(),
        };

        if (props.selectedRule.id) {
            tagRuleContext.updateTagRule(props.selectedRule.id, newRule);
        } else {
            tagRuleContext.addTagRule(newRule);
        }
        props.setCurrentRule({ filters: [] });
    };

    return (
        <TooltipProvider>
            <div className="p-3 bg-card rounded-md border border-border shadow-sm">
                <div className="grid grid-cols-[7rem_auto] gap-1 items-center">
                    <Label htmlFor="main-category" className="text-sm">
                        Category
                    </Label>
                    <Select
                        value={props.selectedRule.tag?.category ?? ""}
                        onValueChange={(value) => {
                            props.setCurrentRule((prev) => ({
                                ...prev,
                                tag: { ...prev.tag, category: value },
                            }));
                        }}
                    >
                        <SelectTrigger className="bg-background w-full">
                            <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent>
                            {MAIN_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Label
                        htmlFor="sub-category"
                        className={`text-sm ${
                            !props.selectedRule.tag?.subCategory
                                ? "text-muted-foreground"
                                : ""
                        }`}
                    >
                        Subcategory
                    </Label>
                    <Input
                        id="sub-category"
                        value={props.selectedRule.tag?.subCategory ?? ""}
                        onChange={(event) => {
                            props.setCurrentRule((prev) => ({
                                ...prev,
                                tag: {
                                    ...prev.tag,
                                    subCategory: event.target.value,
                                },
                            }));
                        }}
                        placeholder="subcategory"
                        className="bg-background placeholder:text-sm"
                    />

                    <div className="col-span-2 border-t border-border my-2" />

                    <div className="flex items-center gap-1">
                        <Label
                            htmlFor="ignore-toggle"
                            className={`text-sm ${
                                !props.selectedRule.tag?.ignore === true
                                    ? "text-muted-foreground"
                                    : ""
                            }`}
                        >
                            Ignore
                        </Label>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs max-w-xs">
                                    Exclude transactions from calculations and
                                    analysis. Example: Transfers between savings
                                    and checking accounts shouldn't affect your
                                    income totals.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="flex pl-1 h-9 items-center">
                        <Switch
                            id="ignore-toggle"
                            checked={props.selectedRule.tag?.ignore || false}
                            onCheckedChange={(checked) => {
                                props.setCurrentRule((prev) => ({
                                    ...prev,
                                    tag: {
                                        ...prev.tag,
                                        ignore: checked,
                                    },
                                }));
                            }}
                            className="data-[state=unchecked]:bg-muted-foreground"
                        />
                    </div>
                </div>

                <div className="flex gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => props.setCurrentRule({ filters: [] })}
                        className="flex-1"
                    >
                        Clear
                    </Button>
                    <Button
                        onClick={saveRule}
                        className={cn(
                            "flex-2",
                            getCleanTagRule(
                                props.selectedRule,
                                tagRuleContext.tagRules
                            ).success
                                ? ""
                                : "opacity-50"
                        )}
                    >
                        Save Tag Rule
                    </Button>
                </div>
            </div>
        </TooltipProvider>
    );
}
