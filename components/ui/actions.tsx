"use client";

import { useRef, useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";

export function Actions({
  name,
  onEdit,
  onDelete,
  description,
  pending = false,
  deleteLabel = "Delete",
}: {
  name: string;
  onEdit?: () => void;
  onDelete: () => void;
  description: string;
  pending?: boolean;
  deleteLabel?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={trigger}
            variant="ghost"
            size="icon"
            disabled={pending}
            aria-label={`Actions for ${name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem
              onSelect={() =>
                requestAnimationFrame(() => {
                  trigger.current?.focus();
                  onEdit();
                })
              }
            >
              <Pencil />
              Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-danger focus:text-danger"
            onSelect={() => setConfirming(true)}
          >
            <Trash2 />
            {deleteLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent
          className="max-h-[calc(100dvh-2rem)] grid-rows-[minmax(0,1fr)_auto]"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            trigger.current?.focus();
            if (document.activeElement !== trigger.current)
              document.querySelector<HTMLElement>("main")?.focus();
          }}
        >
          <ScrollArea className="min-h-0">
            <AlertDialogHeader>
              <AlertDialogTitle className="[overflow-wrap:anywhere]">
                {deleteLabel} {name}?
              </AlertDialogTitle>
              <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
          </ScrollArea>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="danger" onClick={onDelete}>
              {deleteLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
