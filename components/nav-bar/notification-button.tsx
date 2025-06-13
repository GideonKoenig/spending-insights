"use client";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { cloneElement, ReactElement, useState } from "react";
import type { Notification } from "@/contexts/notification/types";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NotificationButton(props: {
    notifications: Notification[];
    icon: ReactElement;
    activeColorClass: string;
    typeLabel: string;
    emptyMessage: string;
    onMarkAsRead: (id?: number) => void;
    onClear: () => void;
    onAddTest: () => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const hasUnseen = props.notifications.some((n) => !n.seen);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                        if (isOpen) {
                            props.onMarkAsRead();
                        }
                    }}
                >
                    {cloneElement(props.icon, {
                        className: cn(
                            "h-4 w-4",
                            hasUnseen
                                ? props.activeColorClass
                                : "text-muted-foreground"
                        ),
                    } as React.HTMLAttributes<React.ReactElement>)}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-0">
                <div className="flex items-center justify-between p-2 px-3 border-b">
                    <span className="font-medium text-sm">
                        {props.notifications.length} {props.typeLabel}
                        {props.notifications.length !== 1 ? "s" : ""}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            disabled={props.notifications.length === 0}
                            size="sm"
                            onClick={() => {
                                props.onClear();
                                setIsOpen(false);
                            }}
                            className="h-6 text-xs"
                        >
                            Clear All
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={props.onAddTest}
                            className="h-6 text-xs"
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Test
                        </Button>
                    </div>
                </div>
                <ScrollArea className="w-3xl max-h-[48rem]">
                    {props.notifications.length === 0 ? (
                        <div className="p-4 h-40 text-center flex items-center justify-center text-muted-foreground text-sm">
                            {props.emptyMessage}
                        </div>
                    ) : (
                        <div className="p-2 max-h-[48rem]">
                            {props.notifications
                                .slice()
                                .reverse()
                                .map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => {
                                            props.onMarkAsRead(notification.id);
                                        }}
                                        className="p-2 border-b last:border-b-0 text-sm"
                                    >
                                        <p className="font-medium gap-1 flex items-center text-xs text-muted-foreground mb-1">
                                            {notification.origin}
                                            {!notification.seen && (
                                                <span className="w-1 h-1 bg-primary rounded-full  shadow-lg shadow-white/50"></span>
                                            )}
                                        </p>
                                        <p
                                            className={cn(
                                                props.activeColorClass,
                                                "whitespace-pre-wrap"
                                            )}
                                        >
                                            {notification.message}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
