import { TagRule } from "@/lib/tag-rule-engine/types";
import { type Transaction } from "@/lib/types";

export type TagRuleSortOption =
    | "newest-created"
    | "oldest-created"
    | "category-ascending"
    | "category-descending"
    | "newest-updated"
    | "oldest-updated";

export const TAG_RULE_SORT_OPTIONS = [
    { value: "newest-created", label: "Newest Created" },
    { value: "oldest-created", label: "Oldest Created" },
    { value: "category-ascending", label: "Category (A-Z)" },
    { value: "category-descending", label: "Category (Z-A)" },
    { value: "newest-updated", label: "Newest Updated" },
    { value: "oldest-updated", label: "Oldest Updated" },
] as const;

export function sortTagRules(
    tagRules: TagRule[],
    sortBy: TagRuleSortOption
): TagRule[] {
    const sorted = [...tagRules];

    switch (sortBy) {
        case "category-ascending":
            return sorted.sort((a, b) => {
                const category = a.tag.category.localeCompare(b.tag.category);
                if (category !== 0) return category;
                return a.tag.subCategory.localeCompare(b.tag.subCategory);
            });
        case "category-descending":
            return sorted.sort((a, b) => {
                const category = b.tag.category.localeCompare(a.tag.category);
                if (category !== 0) return category;
                return b.tag.subCategory.localeCompare(a.tag.subCategory);
            });
        case "newest-created":
            return sorted.sort(
                (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
            );
        case "oldest-created":
            return sorted.sort(
                (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
            );
        case "newest-updated":
            return sorted.sort(
                (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
            );
        case "oldest-updated":
            return sorted.sort(
                (a, b) => a.updatedAt.getTime() - b.updatedAt.getTime()
            );
        default:
            return sorted;
    }
}
