"use client";

import { useData } from "@/contexts/data-provider";
import { FileSelector } from "@/components/file-selector";
import { PatternCreator } from "@/components/pattern-creator";
import { TransactionViewer } from "@/components/transaction-viewer";

export default function PatternsPage() {
    const { fileHandle, hasPermission } = useData();

    if (!fileHandle || !hasPermission) {
        return <FileSelector />;
    }

    return (
        <main className="h-full flex flex-col">
            <div className="mx-auto max-w-7xl px-4 py-8 w-full flex flex-col h-full">
                <div className="space-y-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Pattern Management
                        </h1>
                        <p className="text-muted-foreground">
                            Create rules to automatically categorize your
                            transactions
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
                    <TransactionViewer />
                    <PatternCreator />
                </div>
            </div>
        </main>
    );
}
