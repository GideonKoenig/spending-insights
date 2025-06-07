import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PreparedFile } from "@/lib/data-injestion/types";
import { useAccounts } from "@/contexts/accounts/provider";

export function PreparedFileItem(props: {
    file: PreparedFile;
    updateFile: (newFile: PreparedFile) => void;
    removeFile: () => void;
}) {
    const { accounts } = useAccounts();

    return (
        <>
            <p className="text-xs text-muted-foreground truncate">
                {props.file.fileName}
            </p>

            <Input
                className="text-md"
                value={props.file.name}
                onChange={(event) => {
                    props.updateFile({
                        ...props.file,
                        name: event.target.value,
                    });
                }}
                placeholder="Enter name..."
            />

            {props.file.format ? (
                <Badge variant="default" className="text-xs h-7 w-full">
                    {props.file.format.displayName}
                </Badge>
            ) : (
                <Badge variant="outline" className="text-xs h-7 w-full">
                    Unknown
                </Badge>
            )}

            <div className="grid grid-cols-[1fr_1fr] gap-1">
                <Select
                    value={props.file.action}
                    onValueChange={(value: "add" | "merge") => {
                        props.updateFile({
                            ...props.file,
                            action: value,
                        });
                    }}
                >
                    <SelectTrigger className="text-xs w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="add">Add</SelectItem>
                        <SelectItem value="merge">Merge</SelectItem>
                    </SelectContent>
                </Select>

                {props.file.action === "merge" && (
                    <Select
                        value={props.file.mergeAccount ?? ""}
                        onValueChange={(value) => {
                            props.updateFile({
                                ...props.file,
                                mergeAccount: value,
                            });
                        }}
                    >
                        <SelectTrigger className="text-xs w-full">
                            <SelectValue placeholder="Target" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.length === 0 && (
                                <SelectItem disabled value="none">
                                    {"No accounts found"}
                                </SelectItem>
                            )}
                            {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                    {account.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={props.removeFile}
                className="h-7 w-7 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
            >
                ×
            </Button>
        </>
    );
}
