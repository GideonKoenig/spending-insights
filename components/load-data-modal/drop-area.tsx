import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function DropArea(props: {
    handleFileSelect: (files: FileList | null) => void;
}) {
    const [isDragOver, setIsDragOver] = useState(false);

    return (
        <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-transform duration-200 ${
                isDragOver
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-muted-foreground/25 hover:border-muted-foreground/40 hover:bg-muted/20"
            }`}
            onDragOver={(event) => {
                event.preventDefault();
                setIsDragOver(true);
            }}
            onDragLeave={(event) => {
                event.preventDefault();
                setIsDragOver(false);
            }}
            onDrop={(event) => {
                event.preventDefault();
                setIsDragOver(false);
                props.handleFileSelect(event.dataTransfer.files);
            }}
        >
            <div className="flex flex-col gap-4 w-full justify-center items-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <svg
                        className="w-6 h-6 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>
                </div>
                <div>
                    <p className="text-base font-medium text-foreground mb-1">
                        Drop CSV files here
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                        or click to browse from your computer
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="pointer-events-none"
                    >
                        Choose Files
                    </Button>
                </div>
            </div>
            <Input
                type="file"
                multiple
                accept=".csv"
                onChange={(event) => props.handleFileSelect(event.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
        </div>
    );
}
