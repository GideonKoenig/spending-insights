import { z } from "zod";
import { FilterRuleSchema } from "@/lib/transaction-filter/types";

export type Tag = z.infer<typeof TagSchema>;
export const TagSchema = z.object({
    category: z.string(),
    subCategory: z.string().optional(),
    spreadOverMonths: z.number().optional(),
});

export type PartialTagRule = Partial<Omit<TagRule, "tag" | "filters">> & {
    filters: TagRule["filters"];
    tag?: Partial<Tag>;
};
export type TagRule = z.infer<typeof TagRuleSchema>;
export const TagRuleSchema = z.object({
    id: z.string(),
    name: z.string(),
    filters: z.array(FilterRuleSchema),
    tag: TagSchema,
});

export type TagRuleList = z.infer<typeof TagRuleListSchema>;
export const TagRuleListSchema = z.array(TagRuleSchema);

export const MAIN_CATEGORIES = [
    "Groceries",
    "Transportation",
    "Healthcare",
    "Entertainment",
    "Utilities",
    "Housing",
    "Insurance",
    "Education",
    "Professional",
    "Investments",
    "Income",
    "Other",
] as const;
