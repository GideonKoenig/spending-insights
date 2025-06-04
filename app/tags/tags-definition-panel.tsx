"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Tag, TagMatcher, MAIN_CATEGORIES } from "@/lib/types";
import React from "react";

export function TagDefinitionPanel(props: {
    onTagsChange: (name: string, tags: Tag | null) => void;
    selectedMatcher: TagMatcher | null;
    hasActiveFilters: boolean;
}) {
    const [matcherName, setMatcherName] = useState("");
    const [mainCategory, setMainCategory] = useState<string>("");
    const [spreadOverMonths, setSpreadOverMonths] = useState<
        number | undefined
    >();
    const [additionalTags, setAdditionalTags] = useState<string[]>([]);
    const [newAdditionalTag, setNewAdditionalTag] = useState("");

    const updateTags = () => {
        if (!matcherName.trim() || !mainCategory) {
            props.onTagsChange("", null);
            return;
        }

        const tags: Tag = {
            mainCategory,
            spreadOverMonths,
            additionalTags,
        };

        props.onTagsChange(matcherName.trim(), tags);
    };

    const addAdditionalTag = () => {
        if (
            newAdditionalTag.trim() &&
            !additionalTags.includes(newAdditionalTag.trim())
        ) {
            setAdditionalTags([...additionalTags, newAdditionalTag.trim()]);
            setNewAdditionalTag("");
        }
    };

    const removeAdditionalTag = (tagToRemove: string) => {
        setAdditionalTags(additionalTags.filter((tag) => tag !== tagToRemove));
    };

    const clearAll = () => {
        setMatcherName("");
        setMainCategory("");
        setSpreadOverMonths(undefined);
        setAdditionalTags([]);
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            addAdditionalTag();
        }
    };

    React.useEffect(() => {
        if (props.selectedMatcher) {
            setMatcherName(props.selectedMatcher.name);
            setMainCategory(props.selectedMatcher.tags.mainCategory);
            setSpreadOverMonths(props.selectedMatcher.tags.spreadOverMonths);
            setAdditionalTags(props.selectedMatcher.tags.additionalTags);
        } else {
            clearAll();
        }
    }, [props.selectedMatcher]);

    React.useEffect(() => {
        updateTags();
    }, [matcherName, mainCategory, spreadOverMonths, additionalTags]);

    return (
        <div className="space-y-3 p-4 bg-card rounded-md border border-border shadow-sm">
            <div className="flex items-center gap-3">
                <Label htmlFor="matcher-name" className="w-20 text-sm">
                    Name
                </Label>
                <Input
                    id="matcher-name"
                    value={matcherName}
                    onChange={(e) => setMatcherName(e.target.value)}
                    placeholder="e.g., Grocery Store Purchases"
                    className="flex-1"
                />
            </div>

            <div className="flex items-center gap-3">
                <Label htmlFor="main-category" className="w-20 text-sm">
                    Category
                </Label>
                <Select value={mainCategory} onValueChange={setMainCategory}>
                    <SelectTrigger className="flex-1">
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
            </div>

            <div className="flex items-center gap-3">
                <Label htmlFor="spread-months" className="w-20 text-sm">
                    Months
                </Label>
                <Input
                    id="spread-months"
                    type="number"
                    min="1"
                    max="24"
                    value={spreadOverMonths || ""}
                    onChange={(e) =>
                        setSpreadOverMonths(
                            e.target.value
                                ? parseInt(e.target.value, 10)
                                : undefined
                        )
                    }
                    placeholder="6"
                    className="flex-1"
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <Label className="w-20 text-sm">Tags</Label>
                    <div className="flex gap-2 flex-1">
                        <Input
                            value={newAdditionalTag}
                            onChange={(e) =>
                                setNewAdditionalTag(e.target.value)
                            }
                            onKeyPress={handleKeyPress}
                            placeholder="Add custom tag..."
                            className="flex-1"
                        />
                        <Button
                            size="sm"
                            onClick={addAdditionalTag}
                            disabled={!newAdditionalTag.trim()}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                {additionalTags.length > 0 && (
                    <div className="ml-23 flex flex-wrap gap-2">
                        {additionalTags.map((tag) => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className="flex items-center gap-1"
                            >
                                {tag}
                                <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => removeAdditionalTag(tag)}
                                />
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
