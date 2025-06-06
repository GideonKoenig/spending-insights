import { z } from "zod";
import { FilterRuleSchema } from "@/lib/transaction-filter/types";

export type Tag = z.infer<typeof TagSchema>;
export const TagSchema = z.object({
    category: z.string(),
    subCategory: z.string().optional(),
    spreadOverMonths: z.number().optional(),
    ignore: z.boolean().optional(),
    ruleId: z.string().optional(),
    ruleName: z.string().optional(),
});

export type TagRule = z.infer<typeof TagRuleSchema>;
export const TagRuleSchema = z.object({
    id: z.string(),
    name: z.string(),
    filters: z.array(FilterRuleSchema),
    tag: TagSchema,
});

export type PartialTagRule = Partial<Omit<TagRule, "tag" | "filters">> & {
    filters: TagRule["filters"];
    tag?: Partial<Tag>;
};

export const MAIN_CATEGORIES = [
    "advance-money",
    "entertainment",
    "groceries",
    "housing",
    "household-items",
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
