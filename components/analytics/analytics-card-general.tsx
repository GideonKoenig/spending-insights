import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";

export function AnalyticsCardGeneral(props: {
    title: string;
    className?: string;
    icon: React.ReactNode;
    children?: React.ReactNode;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">
                    {props.title}
                </CardTitle>
                {React.cloneElement(
                    props.icon as React.ReactElement,
                    {
                        className: "h-4 w-4 text-muted-foreground",
                    } as any
                )}
            </CardHeader>
            <CardContent className={props.className}>
                {props.children}
            </CardContent>
        </Card>
    );
}
