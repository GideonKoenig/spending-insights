"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  useAction,
  useCommand,
  type LedgerAccount,
  type Source,
} from "@/lib/client";
import type { Output } from "@/lib/ledger/commands";
import { cents, decimal } from "@/lib/ledger/contracts";
import { euro, today } from "@/lib/utils";
import {
  DatePicker,
  SelectItem,
  SelectGroup,
  SelectLabel,
  Button,
  ErrorMessage,
  Field,
  Input,
  Loading,
  Modal,
  Select,
} from "./ui/controls";

type Line = {
  key: string;
  accountId: string;
  debit: string;
  credit: string;
  locked: boolean;
};

type FormProps = {
  accounts: LedgerAccount[];
  sources?: Source[];
  existing?: Output<"get_booking">;
  onClose: () => void;
  onSave?: () => void;
};

const kinds = {
  asset: "Assets",
  liability: "Liabilities",
  expense: "Expenses",
  income: "Income",
  equity: "Opening balances",
} as const;

export function BookTransaction({
  source,
  accounts,
  onClose,
  onSave = onClose,
}: {
  source: Source;
  accounts: LedgerAccount[];
  onClose: () => void;
  onSave?: () => void;
}) {
  const matches = useCommand("find_matches", { transactionId: source.id });
  const link = useAction("link_transaction");
  const [create, setCreate] = useState(false);
  const showForm = create || matches.data?.length === 0;
  return (
    <Modal
      wide
      title={showForm ? "New booking" : "Match an existing booking"}
      description={
        showForm
          ? undefined
          : "These bookings already contain this account movement. Linking avoids recording it twice."
      }
      onClose={onClose}
    >
      {!showForm && <ErrorMessage error={matches.error ?? link.error} />}
      {showForm ? (
        <BookingFields
          accounts={accounts}
          sources={[source]}
          onClose={onClose}
          onSave={onSave}
        />
      ) : matches.isPending ? (
        <Loading variant="form" />
      ) : (
        <>
          <div className="divide-y divide-border">
            {matches.data?.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div>
                  <p className="text-sm">{match.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {match.date} · {euro(source.amount)}
                  </p>
                </div>
                <Button
                  busy={link.isPending}
                  onClick={() =>
                    link.mutate(
                      {
                        transactionId: source.id,
                        entryId: match.id,
                        revision: match.revision,
                      },
                      { onSuccess: onSave },
                    )
                  }
                >
                  Link
                </Button>
              </div>
            ))}
          </div>
          <Button variant="ghost" onClick={() => setCreate(true)}>
            Create a separate booking
          </Button>
        </>
      )}
    </Modal>
  );
}

export function BookingEditor({
  id,
  accounts,
  onClose,
  onSave,
}: {
  id: string;
  accounts: LedgerAccount[];
  onClose: () => void;
  onSave?: () => void;
}) {
  const result = useCommand("get_booking", { id });
  return (
    <Modal wide title="Edit booking" onClose={onClose}>
      {result.data ? (
        <BookingFields
          accounts={accounts}
          existing={result.data}
          sources={result.data.sources}
          onClose={onClose}
          onSave={onSave}
        />
      ) : (
        <>
          <ErrorMessage error={result.error} />
          {result.isPending && <Loading variant="form" />}
        </>
      )}
    </Modal>
  );
}

export function BookingForm({
  accounts,
  sources = [],
  existing,
  onClose,
  onSave,
}: FormProps) {
  return (
    <Modal
      wide
      title={
        existing
          ? "Edit booking"
          : sources.length > 1
            ? "Book selected transactions"
            : "New booking"
      }
      onClose={onClose}
    >
      <BookingFields
        accounts={accounts}
        sources={sources}
        existing={existing}
        onClose={onClose}
        onSave={onSave}
      />
    </Modal>
  );
}

function BookingFields({
  accounts,
  sources = [],
  existing,
  onClose,
  onSave = onClose,
}: FormProps) {
  const save = useAction("save_booking");
  // A refresh must not pair this draft with another edit's revision.
  const [revision] = useState(existing?.entry.revision);
  const [date, setDate] = useState(
    existing?.entry.date ?? sources[0]?.date ?? today(),
  );
  const [description, setDescription] = useState(
    existing?.entry.description ?? sources[0]?.description ?? "",
  );
  const [lines, setLines] = useState<Line[]>(() => {
    if (existing)
      return existing.postings.map((posting) =>
        makeLine(
          posting.accountId,
          posting.amount,
          sources.some((source) => source.accountId === posting.accountId),
        ),
      );
    const totals = new Map<string, number>();
    for (const source of sources)
      totals.set(
        source.accountId,
        (totals.get(source.accountId) ?? 0) + source.amount,
      );
    const initial = Array.from(totals, ([accountId, amount]) =>
      makeLine(accountId, amount, true),
    );
    const balance = sources.reduce((sum, source) => sum + source.amount, 0);
    if (balance !== 0) initial.push(makeLine("", -balance));
    while (initial.length < 2) initial.push(makeLine("", 0));
    return initial;
  });
  const balance = lines.reduce(
    (sum, line) => sum + parsed(line.debit) - parsed(line.credit),
    0,
  );
  const labels = new Map(accounts.map((account) => [account.id, account.name]));
  function change(
    key: string,
    value: Partial<Pick<Line, "accountId" | "debit" | "credit">>,
  ) {
    setLines(
      lines.map((line) =>
        line.key === key
          ? {
              key: line.key,
              locked: line.locked,
              accountId: value.accountId ?? line.accountId,
              debit: value.debit ?? line.debit,
              credit: value.credit ?? line.credit,
            }
          : line,
      ),
    );
  }
  if (lines.some((line) => line.locked && !line.debit && !line.credit))
    return (
      <>
        <p role="alert" className="text-sm text-muted-foreground">
          The selected transactions cancel out within an account. Book them
          separately.
        </p>
        <Button onClick={onClose}>Back to transactions</Button>
      </>
    );
  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate(
          {
            id: existing?.entry.id,
            revision,
            date,
            description,
            sourceIds: sources.map((source) => source.id),
            postings: lines.map((line) => ({
              accountId: line.accountId,
              amount: line.debit ? line.debit : `-${line.credit}`,
            })),
          },
          { onSuccess: onSave },
        );
      }}
    >
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <Field label="Date">
          <DatePicker
            required
            value={date}
            onValueChange={(value) => setDate(value)}
          />
        </Field>
        <Field label="Description">
          <Input
            required
            autoFocus
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
      </div>
      {sources.length > 0 && (
        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          {sources.length} imported transaction{sources.length !== 1 && "s"}{" "}
          linked. Imported account amounts are fixed.
          {sources.length > 1 &&
            new Set(sources.map((source) => source.date)).size > 1 &&
            " The booking date applies to both sides of this transfer."}
        </div>
      )}
      <div className="grid gap-3">
        {lines.map((line) => (
          <div
            key={line.key}
            className="rounded-lg border border-border bg-background/50 p-3 sm:grid sm:grid-cols-[minmax(0,1fr)_112px_112px_32px] sm:items-end sm:gap-3"
          >
            <Field label="Account">
              <Select
                required
                disabled={line.locked}
                aria-label="Booking account"
                value={line.accountId}
                onValueChange={(value) =>
                  change(line.key, { accountId: value })
                }
              >
                {Object.entries(kinds).map(([kind, name]) => (
                  <SelectGroup key={kind}>
                    <SelectLabel>{name}</SelectLabel>
                    {accounts
                      .filter(
                        (account) =>
                          account.kind === kind &&
                          (!account.archived ||
                            account.id === line.accountId) &&
                          !lines.some(
                            (other) =>
                              other.key !== line.key &&
                              other.accountId === account.id,
                          ),
                      )
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.parentId
                            ? `${labels.get(account.parentId)} / `
                            : ""}
                          {account.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                ))}
              </Select>
            </Field>
            <div className="mt-3 grid grid-cols-[1fr_1fr_32px] items-end gap-3 sm:contents">
              <Field label="Debit (€)">
                <Input
                  aria-label="Debit amount"
                  inputMode="decimal"
                  pattern="(?:0|[1-9]\d*)(?:\.\d{1,2})?"
                  disabled={line.locked}
                  value={line.debit}
                  onChange={(event) =>
                    change(line.key, {
                      debit: event.target.value,
                      credit: "",
                    })
                  }
                />
              </Field>
              <Field label="Credit (€)">
                <Input
                  aria-label="Credit amount"
                  inputMode="decimal"
                  pattern="(?:0|[1-9]\d*)(?:\.\d{1,2})?"
                  disabled={line.locked}
                  value={line.credit}
                  onChange={(event) =>
                    change(line.key, {
                      credit: event.target.value,
                      debit: "",
                    })
                  }
                />
              </Field>
              <Button
                variant="ghost"
                size="icon-sm"
                className="mb-1"
                aria-label="Remove posting"
                disabled={line.locked || lines.length <= 2}
                onClick={() =>
                  setLines(lines.filter((item) => item.key !== line.key))
                }
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => setLines([...lines, makeLine("", 0)])}
        >
          <Plus className="size-4" />
          Add split
        </Button>
        <span
          className={`number text-sm ${balance === 0 ? "text-primary" : "text-accent"}`}
        >
          {Number.isNaN(balance)
            ? "Enter valid amounts"
            : balance === 0
              ? "Balanced"
              : `${euro(Math.abs(balance))} remaining`}
        </span>
      </div>
      <ErrorMessage error={save.error} />
      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="primary"
          type="submit"
          busy={save.isPending}
          disabled={
            balance !== 0 ||
            lines.some(
              (line) => !line.accountId || (!line.debit && !line.credit),
            )
          }
        >
          Save booking
        </Button>
      </div>
    </form>
  );
}

function makeLine(accountId: string, amount: number, locked = false): Line {
  return {
    key: crypto.randomUUID(),
    locked,
    accountId,
    debit: amount > 0 ? decimal(amount) : "",
    credit: amount < 0 ? decimal(-amount) : "",
  };
}

function parsed(value: string) {
  if (!value) return 0;
  try {
    return cents(value);
  } catch {
    return NaN;
  }
}
