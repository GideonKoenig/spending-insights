import { TagRule, TagRuleSchema } from "@/lib/tag-rule-engine/types";
import { tryCatchAsync } from "@/lib/utils";
import { SuperJSON } from "superjson";
import z from "zod";

export type TagRuleDependencies = {
    addError: (origin: string, message: string) => void;
    addDebug: (origin: string, message: string) => void;
    saveTagRules: (updater: (rules: TagRule[]) => TagRule[]) => void;
    tagRules: TagRule[];
};

export function createExportTagRules(dependencies: TagRuleDependencies) {
    return () => {
        const dataStr = SuperJSON.stringify(dependencies.tagRules);
        const dataUri =
            "data:application/json;charset=utf-8," +
            encodeURIComponent(dataStr);

        const exportFileDefaultName = "tag-rules.json";

        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click();

        dependencies.addDebug(
            "Export Tag Rules",
            `Successfully exported ${dependencies.tagRules.length} tag rules`
        );
    };
}

export function createImportTagRules(dependencies: TagRuleDependencies) {
    return async () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.onchange = async (event) => {
            const files = (event.target as HTMLInputElement).files;
            if (files) {
                if (files.length > 1) {
                    dependencies.addError(
                        "Import Tag Rules",
                        "Only one file can be imported at a time"
                    );
                    return;
                }
                const file = files[0];
                if (!file) {
                    dependencies.addError(
                        "Import Tag Rules",
                        "No file provided"
                    );
                    return;
                }
                const fileReadResult = await tryCatchAsync(async () => {
                    const text = await file.text();
                    return SuperJSON.parse<TagRule[]>(text);
                });

                if (!fileReadResult.success) {
                    dependencies.addError(
                        "Internal Error",
                        `Failed to read file: ${fileReadResult.error}`
                    );
                    return;
                }

                const validationResult = z
                    .array(TagRuleSchema)
                    .safeParse(fileReadResult.value);
                if (!validationResult.success) {
                    dependencies.addError(
                        "Internal Error",
                        "Invalid tag rules format"
                    );
                    return;
                }

                const existingIds = new Set(
                    dependencies.tagRules.map((rule) => rule.id)
                );
                const newRules = validationResult.data.filter(
                    (rule) => !existingIds.has(rule.id)
                );
                const skippedCount =
                    validationResult.data.length - newRules.length;

                dependencies.saveTagRules((currentRules) => [
                    ...currentRules,
                    ...newRules,
                ]);

                if (newRules.length > 0) {
                    dependencies.addDebug(
                        "Import Tag Rules",
                        `Successfully imported ${
                            newRules.length
                        } new tag rules${
                            skippedCount > 0
                                ? ` (${skippedCount} duplicates skipped)`
                                : ""
                        }`
                    );
                } else {
                    dependencies.addDebug(
                        "Import Tag Rules",
                        "No new tag rules to import (all were duplicates)"
                    );
                }
            }
        };
        input.click();
    };
}
