"use client";

import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TagRule, Tag, PartialTagRule } from "@/lib/tag-rule-engine/types";
import { useNotifications } from "@/contexts/notification/provider";
import { cn } from "@/lib/utils";
import {
    createRuleName,
    getIssues,
    hasNoIssues,
} from "@/lib/tag-rule-engine/utils";
import { TagRulesContextType } from "@/contexts/tag-rules/provider";

let index = 0;

export function TagsHeader(props: {
    currentRule: PartialTagRule;
    setCurrentRule: Dispatch<SetStateAction<PartialTagRule>>;
    showOnlyTagged: boolean;
    setShowOnlyTagged: Dispatch<SetStateAction<boolean>>;
    tagRuleContext: TagRulesContextType;
}) {
    const { addWarning } = useNotifications();

    const saveRule = () => {
        const issues = getIssues(
            props.currentRule,
            props.tagRuleContext.tagRules
        );
        if (issues.length > 0) {
            addWarning(
                "TagsHeader",
                `Cannot create tag rule:\n → ${issues.join("\n → ")}`
            );
            return;
        }

        if (!hasNoIssues(props.currentRule, props.tagRuleContext.tagRules)) {
            return;
        }

        const ruleName = createRuleName(props.currentRule)!;
        const tag: Tag = {
            category: props.currentRule.tag.category.toLowerCase(),
            subCategory: props.currentRule.tag.subCategory?.toLowerCase(),
            spreadOverMonths: props.currentRule.tag.spreadOverMonths,
            ignore: props.currentRule.tag.ignore,
            ruleId: props.currentRule.id,
            ruleName: ruleName,
        };

        const newRule: TagRule = {
            id: props.currentRule.id ?? crypto.randomUUID(),
            name: ruleName,
            filters: props.currentRule.filters,
            tag: tag,
        };

        if (props.currentRule.id) {
            props.tagRuleContext.updateTagRule(props.currentRule.id, newRule);
        } else {
            props.tagRuleContext.addTagRule(newRule);
        }
        props.setCurrentRule({ filters: [] });
    };

    return (
        <div className="p-2 bg-card flex flex-col gap-4 rounded-md border border-border shadow-sm">
            <Select
                value={props.currentRule.id || ""}
                onValueChange={(value) => {
                    props.setCurrentRule(
                        props.tagRuleContext.tagRules.find(
                            (m) => m.id === value
                        ) ?? {
                            filters: [],
                        }
                    );
                }}
            >
                <SelectTrigger className="flex-1 w-full bg-background">
                    <SelectValue placeholder="Select saved rule..." />
                </SelectTrigger>
                <SelectContent>
                    {props.tagRuleContext.tagRules.length === 0 ? (
                        <SelectItem value="no-rules" disabled>
                            No rules available
                        </SelectItem>
                    ) : (
                        props.tagRuleContext.tagRules.map((rule) => (
                            <SelectItem key={rule.id} value={rule.id}>
                                {rule.name}
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>

            <div className="flex items-center gap-2 ml-2">
                <Switch
                    id="show-only-tagged"
                    checked={props.showOnlyTagged}
                    onCheckedChange={props.setShowOnlyTagged}
                    className="data-[state=unchecked]:bg-muted-foreground"
                />
                <Label htmlFor="show-only-tagged" className="text-sm">
                    Show only tagged transactions
                </Label>
            </div>

            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={() => props.setCurrentRule({ filters: [] })}
                    className="flex-1"
                >
                    Clear
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => {
                        if (!props.currentRule.id) return;
                        props.tagRuleContext.removeTagRule(
                            props.currentRule.id
                        );
                        props.setCurrentRule({ filters: [] });
                    }}
                    disabled={!props.currentRule.id}
                    className="flex-1"
                >
                    Delete Rule
                </Button>
                <Button
                    onClick={saveRule}
                    className={cn(
                        "flex-2",
                        hasNoIssues(
                            props.currentRule,
                            props.tagRuleContext.tagRules
                        )
                            ? ""
                            : "opacity-50"
                    )}
                >
                    Save Tag Rule
                </Button>
            </div>
        </div>
    );
}
