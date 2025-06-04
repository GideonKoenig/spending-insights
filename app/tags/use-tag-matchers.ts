"use client";

import { useState, useEffect } from "react";
import { TagMatcher, TagMatcherListSchema } from "@/lib/types";

const STORAGE_KEY = "bank-history-tag-matchers";

export function useTagMatchers() {
    const [matchers, setMatchersRaw] = useState<TagMatcher[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = TagMatcherListSchema.safeParse(stored);
            if (parsed.success) {
                setMatchersRaw(parsed.data);
            }
        }
        setIsLoaded(true);
    }, []);

    const setMatchers = (
        matchers: TagMatcher[] | ((prev: TagMatcher[]) => TagMatcher[])
    ) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(matchers));
        setMatchersRaw(matchers);
    };

    const addMatcher = (matcher: TagMatcher) => {
        setMatchers((prev) => [...prev, matcher]);
    };
    const updateMatcher = (id: string, updatedMatcher: TagMatcher) => {
        setMatchers((prev) =>
            prev.map((m) => (m.id === id ? updatedMatcher : m))
        );
    };
    const removeMatcher = (id: string) => {
        setMatchers((prev) => prev.filter((m) => m.id !== id));
    };

    return {
        matchers,
        addMatcher,
        updateMatcher,
        removeMatcher,
        isLoaded,
    };
}
