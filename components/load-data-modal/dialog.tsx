"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataInjester } from "@/lib/data-injestion/main";
import { ModalContent } from "@/components/load-data-modal/content";
import { PreparedFile } from "@/lib/data-injestion/types";
import { useNotifications } from "@/contexts/notification/provider";
import { useAccounts } from "@/contexts/accounts/provider";
import {
    createHandleFileSelect,
    createIsValid,
    createLoadData,
    createRemoveFile,
    createUpdateFile,
} from "@/components/load-data-modal/utils";

export function LoadDataModal(props: {
    isOpen: boolean;
    closeDialog: () => void;
}) {
    const notificationContext = useNotifications();
    const accountsContext = useAccounts();
    const [files, setFiles] = useState<PreparedFile[]>([]);

    const dependencies = {
        files,
        setFiles,
        notificationContext,
        accountsContext,
        closeDialog: props.closeDialog,
    };
    const isValid = createIsValid(dependencies);
    const handleFileSelect = createHandleFileSelect(dependencies);
    const updateFile = createUpdateFile(dependencies);
    const removeFile = createRemoveFile(dependencies);
    const loadData = createLoadData(dependencies);

    return (
        <Dialog open={props.isOpen} onOpenChange={props.closeDialog}>
            <DialogContent className="min-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">Load Data</DialogTitle>
                </DialogHeader>

                <ModalContent
                    files={files}
                    updateFile={updateFile}
                    removeFile={removeFile}
                    handleFileSelect={handleFileSelect}
                />

                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setFiles([]);
                            props.closeDialog();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button onClick={loadData} disabled={!isValid()}>
                        Load
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
