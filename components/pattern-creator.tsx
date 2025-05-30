"use client";

import { useState } from "react";
import { useData } from "@/contexts/data-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Download, Upload, Trash2 } from "lucide-react";
import type { PatternRule, FilterCondition, Transaction } from "@/lib/types";
import { tryCatch } from "@/lib/utils";

const FIELD_OPTIONS: { value: keyof Transaction; label: string }[] = [
    { value: "paymentParticipant", label: "Payment Participant" },
    { value: "purpose", label: "Purpose" },
    { value: "transactionType", label: "Transaction Type" },
    { value: "amount", label: "Amount" },
    { value: "currency", label: "Currency" },
    { value: "accountName", label: "Account Name" },
    { value: "bankName", label: "Bank Name" },
];

const OPERATOR_OPTIONS = [
    { value: "equals", label: "Equals" },
    { value: "contains", label: "Contains" },
    { value: "includes", label: "Includes (multiple)" },
    { value: "greater", label: "Greater than" },
    { value: "less", label: "Less than" },
    { value: "greaterEqual", label: "Greater or equal" },
    { value: "lessEqual", label: "Less or equal" },
] as const;

const CATEGORY_SUGGESTIONS = [
    "Groceries",
    "Transportation",
    "Entertainment",
    "Utilities",
    "Healthcare",
    "Shopping",
    "Dining",
    "Travel",
    "Education",
    "Insurance",
    "Investment",
    "Salary",
    "Other",
];

export function PatternCreator() {
    const {
        patterns,
        addPattern,
        updatePattern,
        removePattern,
        exportPatterns,
    } = useData();

    const [editingPattern, setEditingPattern] = useState<PatternRule | null>(
        null
    );
    const [newPattern, setNewPattern] = useState<Partial<PatternRule>>({
        name: "",
        category: "",
        conditions: [],
        enabled: true,
    });

    function handleAddCondition() {
        const condition: FilterCondition = {
            id: Date.now().toString(),
            field: "paymentParticipant",
            operator: "contains",
            value: "",
        };

        if (editingPattern) {
            setEditingPattern({
                ...editingPattern,
                conditions: [...editingPattern.conditions, condition],
            });
        } else {
            setNewPattern({
                ...newPattern,
                conditions: [...(newPattern.conditions || []), condition],
            });
        }
    }

    function handleRemoveCondition(conditionId: string) {
        if (editingPattern) {
            setEditingPattern({
                ...editingPattern,
                conditions: editingPattern.conditions.filter(
                    (c) => c.id !== conditionId
                ),
            });
        } else {
            setNewPattern({
                ...newPattern,
                conditions: (newPattern.conditions || []).filter(
                    (c) => c.id !== conditionId
                ),
            });
        }
    }

    function handleUpdateCondition(
        conditionId: string,
        updates: Partial<FilterCondition>
    ) {
        const updateConditions = (conditions: FilterCondition[]) =>
            conditions.map((c) =>
                c.id === conditionId ? { ...c, ...updates } : c
            );

        if (editingPattern) {
            setEditingPattern({
                ...editingPattern,
                conditions: updateConditions(editingPattern.conditions),
            });
        } else {
            setNewPattern({
                ...newPattern,
                conditions: updateConditions(newPattern.conditions || []),
            });
        }
    }

    function handleSavePattern() {
        const pattern = editingPattern || newPattern;

        if (
            pattern.name &&
            pattern.category &&
            pattern.conditions &&
            pattern.conditions.length > 0
        ) {
            if (editingPattern) {
                updatePattern(editingPattern.id, editingPattern);
                setEditingPattern(null);
            } else {
                addPattern({
                    id: Date.now().toString(),
                    name: pattern.name,
                    category: pattern.category,
                    conditions: pattern.conditions,
                    enabled: pattern.enabled ?? true,
                });
            }

            setNewPattern({
                name: "",
                category: "",
                conditions: [],
                enabled: true,
            });
        }
    }

    function handleCancelEdit() {
        setEditingPattern(null);
        setNewPattern({
            name: "",
            category: "",
            conditions: [],
            enabled: true,
        });
    }

    function handleImportPatterns() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = tryCatch(() => {
                        const imported = JSON.parse(e.target?.result as string);
                        if (Array.isArray(imported)) {
                            imported.forEach((pattern) => {
                                addPattern({
                                    ...pattern,
                                    id:
                                        Date.now().toString() +
                                        Math.random().toString(36).substr(2, 9),
                                });
                            });
                        }
                    });

                    if (!result.success) {
                        console.error(
                            "Failed to import patterns:",
                            result.error
                        );
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    const currentPattern = editingPattern || newPattern;
    const currentConditions = currentPattern.conditions || [];

    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Pattern Creator Form */}
            <Card className="shrink-0">
                <CardHeader>
                    <CardTitle>
                        {editingPattern ? "Edit Pattern" : "Create New Pattern"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="pattern-name">Pattern Name</Label>
                            <Input
                                id="pattern-name"
                                value={currentPattern.name || ""}
                                onChange={(e) => {
                                    if (editingPattern) {
                                        setEditingPattern({
                                            ...editingPattern,
                                            name: e.target.value,
                                        });
                                    } else {
                                        setNewPattern({
                                            ...newPattern,
                                            name: e.target.value,
                                        });
                                    }
                                }}
                                placeholder="e.g., Grocery Store Purchases"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pattern-category">Category</Label>
                            <Select
                                value={currentPattern.category || ""}
                                onValueChange={(value) => {
                                    if (editingPattern) {
                                        setEditingPattern({
                                            ...editingPattern,
                                            category: value,
                                        });
                                    } else {
                                        setNewPattern({
                                            ...newPattern,
                                            category: value,
                                        });
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORY_SUGGESTIONS.map((category) => (
                                        <SelectItem
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Conditions</Label>
                            <Button onClick={handleAddCondition} size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Condition
                            </Button>
                        </div>

                        {currentConditions.map((condition) => (
                            <div
                                key={condition.id}
                                className="grid grid-cols-12 gap-2 items-end"
                            >
                                <div className="col-span-3">
                                    <Select
                                        value={condition.field}
                                        onValueChange={(value) =>
                                            handleUpdateCondition(
                                                condition.id,
                                                {
                                                    field: value as keyof Transaction,
                                                }
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {FIELD_OPTIONS.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="col-span-3">
                                    <Select
                                        value={condition.operator}
                                        onValueChange={(value) =>
                                            handleUpdateCondition(
                                                condition.id,
                                                {
                                                    operator:
                                                        value as FilterCondition["operator"],
                                                }
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {OPERATOR_OPTIONS.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="col-span-5">
                                    {condition.operator === "includes" ? (
                                        <MultiValueInput
                                            value={
                                                Array.isArray(condition.value)
                                                    ? condition.value
                                                    : []
                                            }
                                            onChange={(values) =>
                                                handleUpdateCondition(
                                                    condition.id,
                                                    { value: values }
                                                )
                                            }
                                        />
                                    ) : (
                                        <Input
                                            value={String(
                                                condition.value || ""
                                            )}
                                            onChange={(e) =>
                                                handleUpdateCondition(
                                                    condition.id,
                                                    { value: e.target.value }
                                                )
                                            }
                                            placeholder="Enter value..."
                                        />
                                    )}
                                </div>

                                <div className="col-span-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handleRemoveCondition(condition.id)
                                        }
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {currentConditions.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>
                                    No conditions added yet. Click &ldquo;Add
                                    Condition&rdquo; to get started.
                                </p>
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={currentPattern.enabled ?? true}
                                onCheckedChange={(checked) => {
                                    if (editingPattern) {
                                        setEditingPattern({
                                            ...editingPattern,
                                            enabled: checked,
                                        });
                                    } else {
                                        setNewPattern({
                                            ...newPattern,
                                            enabled: checked,
                                        });
                                    }
                                }}
                            />
                            <Label>Enable this pattern</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            {editingPattern && (
                                <Button
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button onClick={handleSavePattern}>
                                {editingPattern
                                    ? "Update Pattern"
                                    : "Save Pattern"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Existing Patterns */}
            <Card className="flex-1 min-h-0">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            Existing Patterns ({patterns.length})
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleImportPatterns}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Import
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportPatterns}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 h-[calc(100%-5rem)]">
                    <div className="h-full overflow-y-auto">
                        <div className="space-y-2 p-4">
                            {patterns.map((pattern) => (
                                <div
                                    key={pattern.id}
                                    className="p-4 rounded-lg border bg-card"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-medium">
                                                    {pattern.name}
                                                </h4>
                                                <Badge variant="secondary">
                                                    {pattern.category}
                                                </Badge>
                                                {!pattern.enabled && (
                                                    <Badge variant="outline">
                                                        Disabled
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                {pattern.conditions.map(
                                                    (condition, index) => (
                                                        <div
                                                            key={condition.id}
                                                            className="text-sm text-muted-foreground"
                                                        >
                                                            {index > 0 && (
                                                                <span className="mr-2">
                                                                    AND
                                                                </span>
                                                            )}
                                                            <span className="font-medium">
                                                                {
                                                                    FIELD_OPTIONS.find(
                                                                        (f) =>
                                                                            f.value ===
                                                                            condition.field
                                                                    )?.label
                                                                }
                                                            </span>{" "}
                                                            <span>
                                                                {
                                                                    OPERATOR_OPTIONS.find(
                                                                        (o) =>
                                                                            o.value ===
                                                                            condition.operator
                                                                    )?.label
                                                                }
                                                            </span>{" "}
                                                            <span className="font-medium">
                                                                {Array.isArray(
                                                                    condition.value
                                                                )
                                                                    ? condition.value.join(
                                                                          ", "
                                                                      )
                                                                    : String(
                                                                          condition.value
                                                                      )}
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 ml-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setEditingPattern(pattern)
                                                }
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    removePattern(pattern.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {patterns.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>
                                        No patterns created yet. Create your
                                        first pattern above.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function MultiValueInput(props: {
    value: string[];
    onChange: (values: string[]) => void;
}) {
    const [inputValue, setInputValue] = useState("");

    function addValue() {
        if (inputValue.trim() && !props.value.includes(inputValue.trim())) {
            props.onChange([...props.value, inputValue.trim()]);
            setInputValue("");
        }
    }

    function removeValue(index: number) {
        props.onChange(props.value.filter((_, i) => i !== index));
    }

    return (
        <div className="flex flex-wrap items-center gap-1 rounded-md border border-border bg-background p-2 min-h-[40px]">
            {props.value.map((item, index) => (
                <div
                    key={index}
                    className="flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-sm"
                >
                    <span>{item}</span>
                    <button
                        onClick={() => removeValue(index)}
                        className="hover:text-destructive"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            ))}
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        addValue();
                    }
                }}
                placeholder="Add value..."
                className="min-w-32 flex-1 border-none bg-transparent px-1 py-1 text-sm outline-none"
            />
        </div>
    );
}
