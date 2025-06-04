"use client";

import { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MAIN_CATEGORIES, PartialTagRule } from "@/lib/transaction-tags/types";
import React from "react";

export function TagPanel(props: {
    selectedRule: PartialTagRule;
    setCurrentRule: Dispatch<SetStateAction<PartialTagRule>>;
}) {
    return (
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

                <div className="col-span-2 border-t border-border my-2"></div>

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

                <Label
                    htmlFor="rule-name"
                    className={`text-sm ${
                        !props.selectedRule.name ? "text-muted-foreground" : ""
                    }`}
                >
                    Name
                </Label>
                <Input
                    id="rule-name"
                    value={props.selectedRule.name ?? ""}
                    onChange={(event) =>
                        props.setCurrentRule((prev) => ({
                            ...prev,
                            name: event.target.value,
                        }))
                    }
                    placeholder="Enter name..."
                    className="bg-background placeholder:text-sm"
                />

                <Label
                    htmlFor="spread-months"
                    className={`text-sm ${
                        !props.selectedRule.tag?.spreadOverMonths
                            ? "text-muted-foreground"
                            : ""
                    }`}
                >
                    Months
                </Label>
                <Select
                    value={
                        props.selectedRule.tag?.spreadOverMonths?.toString() ??
                        ""
                    }
                    onValueChange={(value) => {
                        const spreadOverMonths =
                            value === "none" ? undefined : parseInt(value, 10);
                        props.setCurrentRule((prev) => ({
                            ...prev,
                            tag: {
                                ...prev.tag,
                                spreadOverMonths,
                            },
                        }));
                    }}
                >
                    <SelectTrigger className="bg-background w-full">
                        <SelectValue placeholder="Select months..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {[2, 3, 4, 5, 6, 12, 24].map((months) => (
                            <SelectItem key={months} value={months.toString()}>
                                {months} month{months !== 1 ? "s" : ""}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
