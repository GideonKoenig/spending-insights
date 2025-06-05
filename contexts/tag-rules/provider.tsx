"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import { TagRule, TagRuleListSchema } from "@/lib/transaction-tags/types";
import { useNotifications } from "@/contexts/notification/provider";
import superjson from "superjson";

const STORAGE_KEY = "bank-history-tag-rules";

interface TagRulesContextType {
    tagRules: TagRule[];
    addTagRule: (tagRule: TagRule) => void;
    updateTagRule: (id: string, updatedTagRule: TagRule) => void;
    removeTagRule: (id: string) => void;
    isLoaded: boolean;
}

const TagRulesContext = createContext<TagRulesContextType | null>(null);

export function useTagRules() {
    const context = useContext(TagRulesContext);
    if (!context) {
        throw new Error("useTagRules must be used within a TagRulesProvider");
    }
    return context;
}

export function TagRulesProvider(props: { children: ReactNode }) {
    const { addError } = useNotifications();
    const [tagRules, setTagRulesRaw] = useState<TagRule[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = TagRuleListSchema.safeParse(
                superjson.parse<TagRule[]>(stored)
            );
            if (parsed.success) {
                setTagRulesRaw(parsed.data);
            } else {
                addError("Failed to parse tag rules", parsed.error.message);
            }
        }
        setIsLoaded(true);
    }, [addError]);

    const setTagRules = (
        rules: TagRule[] | ((prev: TagRule[]) => TagRule[])
    ) => {
        const newRules = typeof rules === "function" ? rules(tagRules) : rules;
        localStorage.setItem(STORAGE_KEY, superjson.stringify(newRules));
        setTagRulesRaw(newRules);
    };

    const addTagRule = (tagRule: TagRule) => {
        setTagRules((prev) => [...prev, tagRule]);
    };

    const updateTagRule = (id: string, updatedTagRule: TagRule) => {
        setTagRules((prev) =>
            prev.map((rule) => (rule.id === id ? updatedTagRule : rule))
        );
    };

    const removeTagRule = (id: string) => {
        setTagRules((prev) => prev.filter((rule) => rule.id !== id));
    };

    const value: TagRulesContextType = {
        tagRules,
        addTagRule,
        updateTagRule,
        removeTagRule,
        isLoaded,
    };

    return (
        <TagRulesContext.Provider value={value}>
            {props.children}
        </TagRulesContext.Provider>
    );
}
