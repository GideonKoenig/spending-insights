import { z } from "zod";
import { FilterRuleSchema } from "@/lib/transaction-filter/types";

export type Tag = z.infer<typeof TagSchema>;
export const TagSchema = z.object({
    category: z.string(),
    subCategory: z.string(),
    ruleId: z.string(),
    ignore: z.boolean().optional(),
});

export type TagRule = z.infer<typeof TagRuleSchema>;
export const TagRuleSchema = z.object({
    id: z.string(),
    filters: z.array(FilterRuleSchema),
    tag: TagSchema,
    createdAt: z.date().default(new Date()),
    updatedAt: z.date().default(new Date()),
});

export type PartialTagRule = Partial<Omit<TagRule, "tag" | "filters">> & {
    filters: TagRule["filters"];
    tag?: Partial<Tag>;
};

export type Category = (typeof MAIN_CATEGORIES)[number] | "all";
export const MAIN_CATEGORIES = [
    "advance-money",
    "entertainment",
    "food",
    "housing",
    "household-items",
    "household-supplies",
    "income",
    "insurance",
    "investments",
    "other",
    "personal-care",
    "professional",
    "reimbursements",
    "transportation",
    "utilities",
] as const;
