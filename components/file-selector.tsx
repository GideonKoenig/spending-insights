"use client";

import { useData } from "@/contexts/data-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, RefreshCw } from "lucide-react";

export function FileSelector() {
    const {
        selectFile,
        fileHandle,
        hasPermission,
        restoreFileAccess,
        loading,
        error,
    } = useData();

    const fileName = fileHandle?.name || null;

    async function handleSelectFile() {
        await selectFile();
    }

    async function handleRestoreAccess() {
        await restoreFileAccess();
    }

    if (fileHandle && !hasPermission) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                        <CardTitle>Permission Required</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-center text-muted-foreground">
                            You previously selected <strong>{fileName}</strong>{" "}
                            but we need your permission to access it again.
                        </p>

                        <div className="space-y-2">
                            <Button
                                onClick={handleRestoreAccess}
                                className="w-full"
                                size="lg"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Restore Access to {fileName}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Or
                                    </span>
                                </div>
                            </div>

                            <Button
                                onClick={handleSelectFile}
                                variant="outline"
                                className="w-full"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Select Different File
                            </Button>
                        </div>

                        {error && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <CardTitle>Select Bank Statement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-center text-muted-foreground">
                        Upload your bank statement CSV file to get started with
                        transaction analysis.
                    </p>

                    <Button
                        onClick={handleSelectFile}
                        className="w-full"
                        size="lg"
                        disabled={loading}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {loading ? "Loading..." : "Select CSV File"}
                    </Button>

                    {error && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <div className="text-xs text-center text-muted-foreground">
                        Your file will be processed locally in your browser. No
                        data is sent to any server.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
