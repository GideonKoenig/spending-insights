import { useAccounts } from "@/contexts/accounts/provider";
import { useTagRules } from "@/contexts/tag-rules/provider";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function LoadingState(props: { className?: string }) {
    const accountContext = useAccounts();
    const tagRuleContext = useTagRules();

    return (
        <div className="flex flex-col gap-1 items-center justify-center h-full w-full">
            <div
                className={cn(
                    "flex gap-1 items-center justify-center",
                    props.className
                )}
            >
                <Loader2 className="w-4 h-4 animate-spin" />
                <p>Loading...</p>
            </div>
            {accountContext.loading && (
                <p className="text-sm text-muted-foreground">
                    Loading accounts...
                </p>
            )}
            {tagRuleContext.loading && (
                <p className="text-sm text-muted-foreground">
                    Loading tag rules...
                </p>
            )}
        </div>
    );
}
