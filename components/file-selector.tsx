"use client";

import { useData } from "@/contexts/data-provider";
import { Button } from "@/components/ui/button";

export function FileSelector() {
    const dataResult = useData();
    if (!dataResult.success) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
                <p className="text-destructive">Error: {dataResult.error}</p>
            </div>
        );
    }

    const {
        loading,
        error,
        selectFile,
        needsFileHandle,
        needsPermission,
        requestPermission,
    } = dataResult.value;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-8">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (needsPermission) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
                <h2 className="text-xl font-semibold">Permission Required</h2>
                <p className="text-muted-foreground">
                    We need your permission to read the selected bank statement
                </p>
                <Button onClick={requestPermission}>Grant Permission</Button>
                {error && <p className="text-destructive">{error}</p>}
            </div>
        );
    }

    if (needsFileHandle) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
                <h2 className="text-xl font-semibold">
                    No Bank Statement Selected
                </h2>
                <p className="text-muted-foreground">
                    Select a CSV file containing your bank statement to get
                    started
                </p>
                <Button onClick={selectFile}>Select Bank Statement</Button>
                {error && <p className="text-destructive">{error}</p>}
            </div>
        );
    }

    return null;
}
