"use client";

import React from "react";
import { useData } from "@/contexts/data-provider";
import { Navigation } from "@/components/navigation";

export function LayoutContent(props: { children: React.ReactNode }) {
    const { fileHandle, hasPermission } = useData();
    const showNavigation = fileHandle && hasPermission;

    return (
        <div className="flex flex-col h-dvh w-dvw overflow-hidden">
            {showNavigation && <Navigation />}
            <div className="flex-1 overflow-hidden">{props.children}</div>
        </div>
    );
}
