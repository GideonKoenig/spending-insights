"use client";

import { useState, useEffect } from "react";
import { TagRule, TagRuleListSchema } from "@/lib/transaction-tags/types";
import { useNotifications } from "@/contexts/notification/provider";

const STORAGE_KEY = "bank-history-tag-rules";

export function useTagRules() {
    const { addError } = useNotifications();
    const [tagRules, setTagRulesRaw] = useState<TagRule[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = TagRuleListSchema.safeParse(JSON.parse(stored));
            if (parsed.success) {
                setTagRulesRaw(parsed.data);
            } else {
                addError("Failed to parse tag rules", parsed.error.message);
            }
        }
        setIsLoaded(true);
    }, []);

    const setTagRules = (
        rules: TagRule[] | ((prev: TagRule[]) => TagRule[])
    ) => {
        const newRules = typeof rules === "function" ? rules(tagRules) : rules;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newRules));
        setTagRulesRaw(newRules);
    };

    const addTagRule = (tagRule: TagRule) => {
        setTagRules((prev) => [...prev, tagRule]);
    };
    const updateTagRule = (id: string, updatedTagRule: TagRule) => {
        setTagRules((prev) =>
            prev.map((m) => (m.id === id ? updatedTagRule : m))
        );
    };
    const removeTagRule = (id: string) => {
        setTagRules((prev) => prev.filter((m) => m.id !== id));
    };

    return {
        tagRules,
        addTagRule,
        updateTagRule,
        removeTagRule,
        isLoaded,
    };
}
