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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { PreparedFile } from "@/lib/data-injestion/types";
import { useAccounts } from "@/contexts/accounts/provider";
import { Info } from "lucide-react";

export function PreparedFileItem(props: {
    file: PreparedFile;
    updateFile: (newFile: PreparedFile) => void;
    removeFile: () => void;
}) {
    const accountsContext = useAccounts();

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

            {props.file.format && props.file.format.note && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge
                                variant="default"
                                className="text-xs h-7 w-full cursor-help"
                            >
                                {props.file.format.displayName}
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="max-w-xs">
                                <p className="text-xs text-foreground">
                                    {props.file.format.note}
                                </p>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            {props.file.format && !props.file.format.note && (
                <Badge variant="default" className="text-xs h-7 w-full">
                    {props.file.format.displayName}
                </Badge>
            )}

            {!props.file.format && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Badge
                                variant="destructive"
                                className="text-xs h-7 w-full cursor-help"
                            >
                                <Info className="h-3 w-3 mr-1" />
                                Unknown
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="max-w-xs">
                                <p className="text-sm font-medium text-foreground">
                                    CSV format not recognized
                                </p>
                                <p className="text-xs text-foreground/80 mt-1">
                                    {
                                        'This file format is not yet supported. You can select "Notify Developer" to send the file structure and anonymized sample data so it can be added as an option in the future. Adding a new format may take a day or two. If you provide the bank name, you can later check the Guide page to see if the bank appears in the supported formats.'
                                    }
                                </p>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}

            <div className="grid grid-cols-[1fr_1fr] gap-1">
                <Select
                    value={props.file.action}
                    onValueChange={(
                        value:
                            | "add"
                            | "merge"
                            | "notify-developer"
                            | "do-nothing"
                    ) => {
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
                        {props.file.format ? (
                            <>
                                <SelectItem value="add">Add</SelectItem>
                                <SelectItem value="merge">Merge</SelectItem>
                            </>
                        ) : (
                            <>
                                <SelectItem value="notify-developer">
                                    Notify Developer
                                </SelectItem>
                                <SelectItem value="do-nothing">
                                    Do Nothing
                                </SelectItem>
                            </>
                        )}
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
                            {accountsContext.accounts.length === 0 && (
                                <SelectItem disabled value="none">
                                    {"No accounts found"}
                                </SelectItem>
                            )}
                            {accountsContext.accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                    {account.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {props.file.action === "notify-developer" && (
                    <Input
                        className="text-xs"
                        value={props.file.bankName ?? ""}
                        onChange={(event) => {
                            props.updateFile({
                                ...props.file,
                                bankName: event.target.value,
                            });
                        }}
                        placeholder="Bank name..."
                    />
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
