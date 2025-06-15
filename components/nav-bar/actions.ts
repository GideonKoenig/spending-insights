import { AccountsContextType } from "@/contexts/accounts/provider";
import { NotificationContextType } from "@/contexts/notification/provider";
import { TagRulesContextType } from "@/contexts/tag-rules/provider";

export interface ActionDependencies {
    tagRules: TagRulesContextType;
    accounts: AccountsContextType;
    notifications: NotificationContextType;
    closePopover?: () => void;
    openLoadDataModal?: () => void;
}

export function createUpdateAllCategories(dependencies: ActionDependencies) {
    return () => {
        dependencies.tagRules.tagRules.forEach((rule) => {
            dependencies.tagRules.updateTagRule(rule.id, {
                ...rule,
            });
        });

        dependencies.notifications.addDebug(
            "updateAllCategories",
            `Updated ${dependencies.tagRules.tagRules.length} tag rules`
        );

        dependencies.closePopover?.();
    };
}

export function createExportTagRules(dependencies: ActionDependencies) {
    return () => {
        dependencies.tagRules.exportTagRules();
        dependencies.closePopover?.();
    };
}

export function createImportTagRules(dependencies: ActionDependencies) {
    return () => {
        dependencies.tagRules.importTagRules();
        dependencies.closePopover?.();
    };
}

export function createExportAccounts(dependencies: ActionDependencies) {
    return () => {
        dependencies.accounts.exportAccounts();
        dependencies.closePopover?.();
    };
}

export function createImportAccounts(dependencies: ActionDependencies) {
    return () => {
        dependencies.accounts.importAccounts();
        dependencies.closePopover?.();
    };
}

export function createLoadData(dependencies: ActionDependencies) {
    return () => {
        dependencies.closePopover?.();
        dependencies.openLoadDataModal?.();
    };
}

export function createClearAllAccounts(dependencies: ActionDependencies) {
    return () => {
        dependencies.accounts.accounts.forEach((account) => {
            dependencies.accounts.deleteAccount(account.id);
        });
        dependencies.accounts.setActiveAccount(true);
        dependencies.closePopover?.();
    };
}
