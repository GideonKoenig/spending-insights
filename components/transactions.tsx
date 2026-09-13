"use client";

import { useState } from "react";
import { Plus, Search, Upload, Workflow } from "lucide-react";
import { Actions } from "./ui/actions";
import {
  useAction,
  useCommand,
  type LedgerAccount,
  type Source,
} from "@/lib/client";
import { realRoles, decimal } from "@/lib/ledger/contracts";
import { euro, today, cn } from "@/lib/utils";
import { BookingEditor, BookingForm, BookTransaction } from "./booking-form";
import { ImportDialog } from "./import-dialog";
import { ApplyRules } from "./rules";
import {
  DatePicker,
  Checkbox,
  SelectItem,
  Button,
  ScrollArea,
  Empty,
  ErrorMessage,
  Field,
  Input,
  Loading,
  Modal,
  PageHeader,
  Pagination,
  Select,
} from "./ui/controls";

export function Transactions() {
  const overview = useCommand("overview", {});
  const [status, setStatus] = useState<"all" | "booked" | "unbooked">(
    "unbooked",
  );
  const [accountId, setAccountId] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<Source[]>([]);
  const [importing, setImporting] = useState(false);
  const [editing, setEditing] = useState<Source | "new" | null>(null);
  const [booking, setBooking] = useState<Source[] | string | null>(null);
  const [applying, setApplying] = useState(false);
  const data = useCommand("list_transactions", {
    status,
    accountId: accountId || undefined,
    search,
    from: from || undefined,
    to: to || undefined,
    offset,
  });
  const remove = useAction("delete_transaction");
  const available = data.data?.rows.filter((row) => !row.entryId) ?? [];
  const selectedCount = available.filter((row) =>
    selected.some((item) => item.id === row.id),
  ).length;
  const accounts = overview.data?.accounts ?? [];
  const names = new Map(accounts.map((account) => [account.id, account.name]));
  function finishBooking() {
    setBooking(null);
    setSelected([]);
  }
  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle={`${overview.data?.pending ?? "…"} waiting to be booked`}
      >
        <Button onClick={() => setApplying(true)}>
          <Workflow className="size-4" />
          Apply rules
        </Button>
        <Button onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          Add
        </Button>
        <Button variant="primary" onClick={() => setImporting(true)}>
          <Upload className="size-4" />
          Import CSV
        </Button>
      </PageHeader>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <div className="relative col-span-2 min-w-0 sm:min-w-52 sm:flex-1">
          <Search className="absolute top-3 left-3 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            aria-label="Search transactions"
            placeholder="Search description, person or ID"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setOffset(0);
            }}
          />
        </div>
        <Select
          aria-label="Transaction status"
          className="w-full sm:w-auto"
          value={status}
          onValueChange={(value) => {
            setStatus(value as typeof status);
            setOffset(0);
          }}
        >
          <SelectItem value="unbooked">Unbooked</SelectItem>
          <SelectItem value="booked">Booked</SelectItem>
          <SelectItem value="all">All transactions</SelectItem>
        </Select>
        <Select
          className="w-full sm:w-auto sm:max-w-64"
          aria-label="Filter account"
          value={accountId}
          onValueChange={(value) => {
            setAccountId(value);
            setOffset(0);
          }}
        >
          <SelectItem value="">All accounts</SelectItem>
          {accounts
            .filter((account) => realRoles[account.role])
            .map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
        </Select>
        <DatePicker
          className="w-full sm:w-auto"
          aria-label="Transactions from"
          placeholder="From"

          value={from}
          onValueChange={(value) => {
            setFrom(value);
            setOffset(0);
          }}
        />
        <DatePicker
          className="w-full sm:w-auto"
          aria-label="Transactions to"
          placeholder="To"

          value={to}
          onValueChange={(value) => {
            setTo(value);
            setOffset(0);
          }}
        />
      </div>
      <div className="mb-4 grid gap-3 sm:flex sm:min-h-10 sm:flex-wrap sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            aria-label="Select unbooked transactions on this page"
            disabled={
              !available.length ||
              data.fetchStatus !== "idle" ||
              data.isPlaceholderData
            }
            checked={
              selectedCount === 0
                ? false
                : selectedCount === available.length
                  ? true
                  : "indeterminate"
            }
            onCheckedChange={(checked) =>
              setSelected(
                checked
                  ? [
                      ...selected.filter(
                        (item) => !available.some((row) => row.id === item.id),
                      ),
                      ...available,
                    ]
                  : selected.filter(
                      (item) => !available.some((row) => row.id === item.id),
                    ),
              )
            }
          />
          Select page
        </label>
        <div className="flex min-h-10 items-center justify-end gap-2">
          {selected.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {selected.length} selected
            </span>
          )}
          <Button
            disabled={!selected.length || data.isPlaceholderData}
            variant="secondary"
            onClick={() => setBooking(selected)}
          >
            Book selected
          </Button>
          {selected.length > 0 && (
            <Button variant="ghost" onClick={() => setSelected([])}>
              Clear
            </Button>
          )}
        </div>
      </div>
      <ErrorMessage error={overview.error ?? data.error ?? remove.error} />
      {data.isPending ? (
        <Loading />
      ) : data.error ? null : !data.data?.rows.length ? (
        <Empty>
          {status === "unbooked" && !search && !accountId && !from && !to
            ? "Your inbox is clear. Import transactions to continue."
            : "No transactions match these filters."}
        </Empty>
      ) : (
        <ScrollArea
          className="table-panel"
          aria-busy={data.fetchStatus !== "idle"}
          inert={data.isPlaceholderData}
        >
          <table className="data-table entry-table transaction-table">
            <thead>
              <tr>
                <th></th>
                <th>Date</th>
                <th>Description</th>
                <th>Account</th>
                <th className="text-right">Amount</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.data.rows.map((row) => (
                <tr key={row.id}>
                  <td className="transaction-select">
                    <Checkbox
                      aria-label={`Select ${row.description}`}

                      disabled={Boolean(row.entryId)}
                      checked={selected.some((item) => item.id === row.id)}
                      onCheckedChange={(value) =>
                        setSelected(
                          value
                            ? [...selected, row]
                            : selected.filter((item) => item.id !== row.id),
                        )
                      }
                    />
                  </td>
                  <td className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                    {row.date}
                  </td>
                  <td className="entry-description min-w-0 sm:max-w-md">
                    <p className="truncate">{row.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground sm:hidden">
                      {row.date} · {names.get(row.accountId)}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {row.counterparty || row.externalId}
                      {row.reference && ` · ${row.reference}`}
                    </p>
                  </td>
                  <td className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                    {names.get(row.accountId)}
                  </td>
                  <td
                    className={cn(
                      "entry-amount number text-right whitespace-nowrap",
                      row.amount > 0 ? "text-primary" : "text-foreground",
                    )}
                  >
                    {euro(row.amount)}
                  </td>
                  <td className="entry-actions">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant={row.entryId ? "ghost" : "secondary"}
                        onClick={() => setBooking(row.entryId ?? [row])}
                      >
                        {row.entryId ? "Booked" : "Book"}
                      </Button>

                      <Actions
                        name={row.description}
                        onEdit={
                          !row.entryId ? () => setEditing(row) : undefined
                        }
                        onDelete={() =>
                          remove.mutate(
                            { id: row.id },
                            {
                              onSuccess: () =>
                                setSelected(
                                  selected.filter((item) => item.id !== row.id),
                                ),
                            },
                          )
                        }
                        pending={remove.isPending}
                        description={
                          row.entryId
                            ? "The booking will also be deleted. Other linked transactions return to the inbox."
                            : "This removes the imported transaction from your inbox."
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      )}
      <Pagination
        offset={offset}
        total={data.data?.total}
        onChange={setOffset}
        fetchStatus={data.fetchStatus}
      />
      {importing && <ImportDialog onClose={() => setImporting(false)} />}
      {editing && (
        <TransactionForm
          source={editing === "new" ? undefined : editing}
          accounts={accounts}
          onClose={() => setEditing(null)}
          onSave={() => {
            setEditing(null);
            setSelected([]);
          }}
        />
      )}
      {booking &&
        (typeof booking === "string" ? (
          <BookingEditor
            id={booking}
            accounts={accounts}
            onClose={() => setBooking(null)}
            onSave={finishBooking}
          />
        ) : booking.length === 1 ? (
          <BookTransaction
            source={booking[0]}
            accounts={accounts}
            onClose={() => setBooking(null)}
            onSave={finishBooking}
          />
        ) : (
          <BookingForm
            accounts={accounts}
            sources={booking}
            onClose={() => setBooking(null)}
            onSave={finishBooking}
          />
        ))}
      {applying && (
        <ApplyRules
          transactionIds={
            selected.length ? selected.map((row) => row.id) : undefined
          }
          onClose={() => {
            setApplying(false);
            setSelected([]);
          }}
        />
      )}
    </>
  );
}

function TransactionForm({
  source,
  accounts,
  onClose,
  onSave,
}: {
  source?: Source;
  accounts: LedgerAccount[];
  onClose: () => void;
  onSave: () => void;
}) {
  const create = useAction("import_transactions");
  const update = useAction("update_transaction");
  const real = accounts.filter(
    (account) => realRoles[account.role] && !account.archived,
  );
  const [account, setAccount] = useState(
    accounts.find((account) => account.id === source?.accountId)?.key ??
      real[0]?.key ??
      "",
  );
  const [externalId, setExternalId] = useState(
    source?.externalId ?? crypto.randomUUID(),
  );
  const [date, setDate] = useState(source?.date ?? today());
  const [amount, setAmount] = useState(source ? decimal(source.amount) : "");
  const [description, setDescription] = useState(source?.description ?? "");
  const [counterparty, setCounterparty] = useState(source?.counterparty ?? "");
  const [reference, setReference] = useState(source?.reference ?? "");
  return (
    <Modal
      title={source ? "Edit transaction" : "Add transaction"}
      onClose={onClose}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (source)
            update.mutate(
              {
                id: source.id,
                date,
                amount,
                description,
                counterparty,
                reference,
              },
              { onSuccess: onSave },
            );
          else
            create.mutate(
              {
                rows: [
                  {
                    externalId,
                    account,
                    date,
                    amount,
                    currency: "EUR",
                    description,
                    counterparty,
                    reference,
                  },
                ],
                preview: false,
              },
              { onSuccess: onSave },
            );
        }}
      >
        <Field label="Account">
          <Select
            required
            disabled={Boolean(source)}
            value={account}
            onValueChange={(value) => setAccount(value)}
          >
            {real.map((account) => (
              <SelectItem key={account.id} value={account.key}>
                {account.name}
              </SelectItem>
            ))}
          </Select>
        </Field>
        <Field label="Transaction ID">
          <Input
            required
            disabled={Boolean(source)}
            value={externalId}
            onChange={(event) => setExternalId(event.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <DatePicker
              required
              value={date}
              onValueChange={(value) => setDate(value)}
            />
          </Field>
          <Field label="Amount (€)">
            <Input
              required
              inputMode="decimal"
              placeholder="-42.50"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </Field>
        </div>
        <Field label="Description">
          <Input
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <Field label="Counterparty">
          <Input
            value={counterparty}
            onChange={(event) => setCounterparty(event.target.value)}
          />
        </Field>
        <Field label="Reference">
          <Input
            value={reference}
            onChange={(event) => setReference(event.target.value)}
          />
        </Field>
        <ErrorMessage error={create.error ?? update.error} />
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            type="submit"
            busy={create.isPending || update.isPending}
          >
            {source ? "Save changes" : "Add to inbox"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
