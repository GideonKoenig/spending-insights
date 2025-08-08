"use client";

import { cn } from "@/lib/utils";
import { MoveHorizontal } from "lucide-react";

export function SmallScreenGuard(props: { className?: string }) {
    const title = "Your screen is too small for this page";
    const description =
        "This page is optimized for larger screens. Please use a tablet/desktop or resize your browser.";

    return (
        <div
            className={cn(
                "h-full w-full flex items-center justify-center text-center p-8",
                props.className
            )}
        >
            <div className="max-w-md w-full border border-dashed rounded-xl p-8 bg-muted/20">
                <div className="flex flex-col items-center gap-4">
                    <div className="rounded-lg border p-3">
                        <MoveHorizontal className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}
