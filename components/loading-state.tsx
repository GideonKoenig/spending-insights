import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function LoadingState(props: { className?: string }) {
    return (
        <div
            className={cn(
                "flex gap-1 h-full w-full items-center justify-center",
                props.className
            )}
        >
            <Loader2 className="w-4 h-4 animate-spin" />
            <p>Loading...</p>
        </div>
    );
}
