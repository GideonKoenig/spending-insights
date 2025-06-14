"use client";

import { Button } from "@/components/ui/button";
import { Rows3, LayoutList } from "lucide-react";
import { type TransactionViewType } from "@/lib/hooks/use-transaction-view";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function TransactionViewToggle(props: {
    view: {
        viewType: TransactionViewType;
        toggleView: () => void;
    };
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={props.view.toggleView}
                    className="size-9"
                >
                    {props.view.viewType === "standard" ? (
                        <Rows3 className="size-4" />
                    ) : (
                        <LayoutList className="size-4" />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p className="text-xs">
                    {props.view.viewType === "standard"
                        ? "Switch to compact view"
                        : "Switch to detailed view"}
                </p>
            </TooltipContent>
        </Tooltip>
    );
}
