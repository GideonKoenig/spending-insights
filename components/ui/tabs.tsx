"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Tabs = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        defaultValue?: string;
        value?: string;
        onValueChange?: (value: string) => void;
    }
>(({ className, defaultValue, value, onValueChange, ...props }, ref) => {
    const [selectedValue, setSelectedValue] = React.useState(
        defaultValue || ""
    );
    const actualValue = value !== undefined ? value : selectedValue;

    const handleValueChange = (newValue: string) => {
        if (value === undefined) {
            setSelectedValue(newValue);
        }
        onValueChange?.(newValue);
    };

    return (
        <div
            ref={ref}
            className={cn("w-full", className)}
            data-value={actualValue}
            {...props}
        >
            {React.Children.map(props.children, (child) =>
                React.isValidElement(child)
                    ? React.cloneElement(
                          child as React.ReactElement<{
                              value: string;
                              onValueChange: (value: string) => void;
                          }>,
                          {
                              value: actualValue,
                              onValueChange: handleValueChange,
                          }
                      )
                    : child
            )}
        </div>
    );
});
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
            className
        )}
        {...props}
    />
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, ...props }, ref) => {
    const parent = React.useContext(TabsContext);
    const isSelected = parent?.value === value;

    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isSelected
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:bg-background/50",
                className
            )}
            onClick={() => parent?.onValueChange?.(value)}
            {...props}
        />
    );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => {
    const parent = React.useContext(TabsContext);
    const isSelected = parent?.value === value;

    if (!isSelected) return null;

    return <div ref={ref} className={cn("mt-2", className)} {...props} />;
});
TabsContent.displayName = "TabsContent";

const TabsContext = React.createContext<{
    value?: string;
    onValueChange?: (value: string) => void;
} | null>(null);

const TabsProvider: React.FC<{
    children: React.ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
}> = ({ children, value, onValueChange }) => {
    return (
        <TabsContext.Provider value={{ value, onValueChange }}>
            {children}
        </TabsContext.Provider>
    );
};

// Wrap Tabs to provide context
const TabsWithContext = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<typeof Tabs>
>((props, ref) => {
    const { value, onValueChange, children, ...restProps } = props;
    return (
        <Tabs
            ref={ref}
            value={value}
            onValueChange={onValueChange}
            {...restProps}
        >
            <TabsProvider value={value} onValueChange={onValueChange}>
                {children}
            </TabsProvider>
        </Tabs>
    );
});
TabsWithContext.displayName = "Tabs";

export { TabsWithContext as Tabs, TabsList, TabsTrigger, TabsContent };
