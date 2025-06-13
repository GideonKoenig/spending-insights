"use client";

import { Button } from "@/components/ui/button";
import { FolderOpen } from "lucide-react";
import { LoadDataModal } from "@/components/load-data-modal/dialog";
import { useState } from "react";

export function EmptyAccountsState() {
    const [isLoadDataOpen, setIsLoadDataOpen] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="max-w-md space-y-4">
                <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-semibold">No Accounts Loaded</h2>
                <p className="text-muted-foreground">
                    {`You haven't loaded any transaction data yet. Click the button below to get started.`}
                </p>
                <Button
                    onClick={() => setIsLoadDataOpen(true)}
                    className="mt-4"
                >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Load Data
                </Button>
            </div>

            <LoadDataModal
                isOpen={isLoadDataOpen}
                closeDialog={() => setIsLoadDataOpen(false)}
            />
        </div>
    );
}
