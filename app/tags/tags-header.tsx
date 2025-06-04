"use client";

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
import { TagMatcher, Tag } from "@/lib/types";

export function TagsHeader(props: {
    matchers: TagMatcher[];
    selectedMatcher: TagMatcher | null;
    onSelectMatcher: (matcher: TagMatcher | null) => void;
    onClear: () => void;
    onCreateMatcher: (name: string, tags: Tag) => void;
    hasActiveFilters: boolean;
    matcherName: string;
    tags: Tag | null;
    showOnlyTagged: boolean;
    onShowOnlyTaggedChange: (showOnlyTagged: boolean) => void;
}) {
    const handleCreateMatcher = () => {
        if (!props.matcherName.trim() || !props.tags) return;
        props.onCreateMatcher(props.matcherName.trim(), props.tags);
    };

    return (
        <div className="p-4 bg-card flex flex-col gap-4 rounded-md border border-border shadow-sm">
            <Select
                value={props.selectedMatcher?.id || ""}
                onValueChange={(value) => {
                    const matcher =
                        props.matchers.find((m) => m.id === value) || null;
                    props.onSelectMatcher(matcher);
                }}
            >
                <SelectTrigger className="flex-1 w-full">
                    <SelectValue placeholder="Select existing matcher..." />
                </SelectTrigger>
                <SelectContent>
                    {props.matchers.length === 0 ? (
                        <SelectItem value="no-matchers" disabled>
                            No matchers available
                        </SelectItem>
                    ) : (
                        props.matchers.map((matcher) => (
                            <SelectItem key={matcher.id} value={matcher.id}>
                                {matcher.name}
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
                <Switch
                    id="show-only-tagged"
                    checked={props.showOnlyTagged}
                    onCheckedChange={props.onShowOnlyTaggedChange}
                />
                <Label htmlFor="show-only-tagged" className="text-sm">
                    Show only tagged transactions
                </Label>
            </div>

            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={props.onClear}
                    className="flex-1"
                >
                    Clear
                </Button>
                <Button
                    onClick={handleCreateMatcher}
                    disabled={
                        !props.matcherName.trim() ||
                        !props.tags ||
                        !props.hasActiveFilters
                    }
                    className="flex-1"
                >
                    Create Tag Matcher
                </Button>
            </div>
        </div>
    );
}
