import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "input file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
