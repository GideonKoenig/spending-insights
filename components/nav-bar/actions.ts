import { TagRule, TagRuleListSchema } from "@/lib/transaction-tags/types";
import { tryCatchAsync } from "@/lib/utils";
import superjson from "superjson";

export interface ActionDependencies {
    tagRules: {
        tagRules: TagRule[];
        addTagRule: (tagRule: TagRule) => void;
        updateTagRule: (id: string, updatedTagRule: TagRule) => void;
        isLoaded: boolean;
    };
    notifications: {
        addError: (origin: string, message: string) => void;
        addDebug: (origin: string, message: string) => void;
    };
    closePopover?: () => void;
}

export function createExportTagRules(dependencies: ActionDependencies) {
    return () => {
        const dataStr = JSON.stringify(
            superjson.serialize(dependencies.tagRules.tagRules),
            null,
            4
        );
        const dataUri =
            "data:application/json;charset=utf-8," +
            encodeURIComponent(dataStr);

        const exportFileDefaultName = "tag-rules.json";

        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click();

        dependencies.notifications.addDebug(
            "Export Tag Rules",
            `Successfully exported ${dependencies.tagRules.tagRules.length} tag rules`
        );

        dependencies.closePopover?.();
    };
}

export function createImportTagRules(dependencies: ActionDependencies) {
    return () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.onchange = async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const fileReadResult = await tryCatchAsync(async () => {
                const text = await file.text();
                return superjson.parse<TagRule[]>(text);
            });

            if (!fileReadResult.success) {
                dependencies.notifications.addError(
                    "Import Tag Rules",
                    `Failed to read file: ${fileReadResult.error}`
                );
                return;
            }

            const validationResult = TagRuleListSchema.safeParse(
                fileReadResult.value
            );
            if (!validationResult.success) {
                dependencies.notifications.addError(
                    "Import Tag Rules",
                    "Invalid tag rules format"
                );
                return;
            }

            const existingIds = new Set(
                dependencies.tagRules.tagRules.map((rule) => rule.id)
            );
            const newRules = validationResult.data.filter(
                (rule) => !existingIds.has(rule.id)
            );
            const skippedCount = validationResult.data.length - newRules.length;

            for (const rule of newRules) {
                dependencies.tagRules.addTagRule(rule);
            }

            if (newRules.length > 0) {
                dependencies.notifications.addDebug(
                    "Import Tag Rules",
                    `Successfully imported ${newRules.length} new tag rules${
                        skippedCount > 0
                            ? ` (${skippedCount} duplicates skipped)`
                            : ""
                    }`
                );
            } else {
                dependencies.notifications.addDebug(
                    "Import Tag Rules",
                    "No new tag rules to import (all were duplicates)"
                );
            }

            dependencies.closePopover?.();
        };
        input.click();
    };
}

export function createUpdateAllCategories(dependencies: ActionDependencies) {
    return () => {
        const updatedRules = dependencies.tagRules.tagRules.map((rule) => ({
            ...rule,
            tag: {
                ...rule.tag,
                category: rule.tag.category.toLowerCase(),
                subCategory: rule.tag.subCategory?.toLowerCase(),
            },
        }));

        dependencies.notifications.addDebug(
            "updateAllCategories",
            `Updated ${updatedRules.length} tag rules`
        );

        for (const rule of updatedRules) {
            dependencies.tagRules.updateTagRule(rule.id, rule);
        }

        dependencies.closePopover?.();
    };
}
