"use client";

import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { Download, Upload } from "lucide-react";
import { useAction } from "@/lib/client";
import { euro } from "@/lib/utils";
import { Button, ErrorMessage, Input, Modal } from "./ui/controls";

export function ImportDialog({ onClose }: { onClose: () => void }) {
  const action = useAction("import_csv");
  const [csv, setCsv] = useState("");
  const [fileError, setFileError] = useState<Error | null>(null);
  const [filename, setFilename] = useState("");
  function change(value: string) {
    setCsv(value);
    action.reset();
    setFileError(null);
  }
  const preview = action.data?.preview ? action.data : null;
  return (
    <Modal wide title="Import transactions" onClose={onClose}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild>
          <a href="/api/template">
            <Download className="size-4" />
            Download CSV template
          </a>
        </Button>
        <span className="text-xs text-muted-foreground">
          EUR · Up to 10,000 rows / 5 MB
        </span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Use your account&apos;s import key and a stable ID per transaction.
        Dates use YYYY-MM-DD; amounts use a decimal point. Positive amounts
        increase assets or reduce debt; negative amounts reduce assets or
        increase debt.
      </p>
      <fieldset disabled={action.isPending} className="grid gap-4">
        <label className="relative flex cursor-pointer items-center gap-3 rounded-xl focus-within:ring-2 focus-within:ring-primary border border-dashed border-border p-5 hover:bg-muted/30">
          <Upload className="size-5 text-primary" />
          <span className="min-w-0 flex-1 truncate text-sm">
            {filename || "Choose CSV file"}
          </span>
          <Input
            className="sr-only"
            aria-label="CSV file"
            type="file"
            accept=".csv,text/csv"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              change("");
              setFilename("");
              if (file.size > 5_000_000) {
                setFileError(new Error("CSV files must be smaller than 5 MB."));
                return;
              }
              try {
                change(await file.text());
                setFilename(file.name);
              } catch {
                setFileError(new Error("Could not read this file."));
              }
            }}
          />
        </label>
        <Textarea
          className="input h-40 resize-y font-mono text-xs"
          aria-label="CSV contents"
          placeholder="Or paste your CSV here"
          value={csv}
          onChange={(event) => change(event.target.value)}
        />
      </fieldset>
      <ErrorMessage error={action.error ?? fileError} />
      {preview && (
        <div className="rounded-lg border border-primary/25 p-4">
          <p className="text-sm text-primary">
            {preview.imported} new transactions · {preview.skipped} existing
            transactions skipped
          </p>
          <div className="mt-3 divide-y divide-border">
            {preview.sample.map((row, index) => (
              <div
                key={index}
                className="flex justify-between gap-4 py-2 text-xs"
              >
                <span className="truncate text-muted-foreground">
                  {row.date} · {row.description}
                </span>
                <span className="number shrink-0">{euro(row.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        {preview ? (
          <Button
            variant="primary"
            busy={action.isPending}
            disabled={!preview.imported}
            onClick={() =>
              action.mutate({ csv, preview: false }, { onSuccess: onClose })
            }
          >
            Import {preview.imported} transactions
          </Button>
        ) : (
          <Button
            variant="primary"
            busy={action.isPending}
            disabled={!csv.trim()}
            onClick={() => action.mutate({ csv, preview: true })}
          >
            Preview import
          </Button>
        )}
      </div>
    </Modal>
  );
}
