"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import { TagRule, TagRuleSchema } from "@/lib/tag-rule-engine/types";
import { useNotifications } from "@/contexts/notification/provider";
import superjson from "superjson";
import {
    TagRuleDependencies,
    createExportTagRules,
    createImportTagRules,
} from "@/contexts/tag-rules/utils";
import { z } from "zod";

const STORAGE_KEY = "bank-history-tag-rules";

export interface TagRulesContextType {
    tagRules: TagRule[];
    addTagRule: (tagRule: TagRule) => void;
    updateTagRule: (id: string, updatedTagRule: TagRule) => void;
    removeTagRule: (id: string) => void;
    importTagRules: () => void;
    exportTagRules: () => void;
    loading: boolean;
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
    const { addError, addDebug } = useNotifications();
    const [tagRules, setTagRules] = useState<TagRule[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = z
                .array(TagRuleSchema)
                .safeParse(superjson.parse<TagRule[]>(stored));
            if (parsed.success) {
                setTagRules(parsed.data);
            } else {
                addError("Failed to parse tag rules", parsed.error.message);
            }
        }
        setLoading(false);
    }, [addError]);

    function saveTagRules(updater: (rules: TagRule[]) => TagRule[]) {
        setTagRules((prev) => {
            const newRules = updater(prev);
            localStorage.setItem(STORAGE_KEY, superjson.stringify(newRules));
            return newRules;
        });
    }

    const addTagRule = (tagRule: TagRule) => {
        saveTagRules((prev) => [...prev, tagRule]);
    };

    const updateTagRule = (id: string, updatedTagRule: TagRule) => {
        saveTagRules((prev) =>
            prev.map((rule) => (rule.id === id ? updatedTagRule : rule))
        );
    };

    const removeTagRule = (id: string) => {
        setTagRules((prev) => prev.filter((rule) => rule.id !== id));
    };

    const dependencies: TagRuleDependencies = {
        addError,
        addDebug,
        saveTagRules,
        tagRules,
    };
    const importTagRules = createImportTagRules(dependencies);
    const exportTagRules = createExportTagRules(dependencies);

    const value: TagRulesContextType = {
        tagRules,
        addTagRule,
        updateTagRule,
        removeTagRule,
        importTagRules,
        exportTagRules,
        loading: loading,
    };

    return (
        <TagRulesContext.Provider value={value}>
            {props.children}
        </TagRulesContext.Provider>
    );
}
