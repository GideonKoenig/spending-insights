"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface LoadDataModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoadDataModal({ isOpen, onClose }: LoadDataModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Load Data</DialogTitle>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
