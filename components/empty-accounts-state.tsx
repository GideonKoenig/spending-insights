"use client";

import { Button } from "@/components/ui/button";
import { FolderOpen, Download } from "lucide-react";
import { LoadDataModal } from "@/components/load-data-modal/dialog";
import { useState } from "react";

export function EmptyAccountsState() {
    const [isLoadDataOpen, setIsLoadDataOpen] = useState(false);

    const downloadSampleData = () => {
        const link = document.createElement("a");
        link.href = "/sample-transactions.csv";
        link.download = "sample-transactions.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="max-w-md space-y-4">
                <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-semibold">No Accounts Loaded</h2>
                <p className="text-muted-foreground">
                    {`You haven't loaded any transaction data yet. Click the button below to get started, or try the sample dataset first.`}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                    <Button
                        onClick={() => setIsLoadDataOpen(true)}
                        className="flex-1 sm:flex-none"
                    >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Load Data
                    </Button>
                    <Button
                        onClick={downloadSampleData}
                        variant="outline"
                        className="flex-1 sm:flex-none"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Try Sample Data
                    </Button>
                </div>

                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                    <p className="font-medium mb-1">
                        About the Sample Dataset:
                    </p>
                    <p className="text-xs leading-relaxed">
                        Contains 10 realistic bank transactions including
                        groceries, online purchases, salary, subscriptions, and
                        transfers. Perfect for exploring the app&apos;s features
                        like categorization, filtering, and analytics before
                        using your own data.
                    </p>
                </div>
            </div>

            <LoadDataModal
                isOpen={isLoadDataOpen}
                closeDialog={() => setIsLoadDataOpen(false)}
            />
        </div>
    );
}
