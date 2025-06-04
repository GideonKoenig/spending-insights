"use client";

import { useData } from "@/contexts/data/provider";
import { Button } from "@/components/ui/button";

export function FileSelector() {
    const {
        loading,
        needsFileHandle,
        needsPermission,
        selectFiles,
        requestPermissions,
    } = useData();

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (needsFileHandle) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground text-center">
                    Select CSV files to start analyzing your transactions
                </p>
                <Button onClick={selectFiles}>Select Files</Button>
            </div>
        );
    }

    if (needsPermission) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground text-center">
                    Permission required to access previously selected files
                </p>
                <Button onClick={requestPermissions}>Grant Permission</Button>
            </div>
        );
    }

    return null;
}
