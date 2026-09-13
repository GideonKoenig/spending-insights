"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useAction, useCommand } from "@/lib/client";
import { euro } from "@/lib/utils";
import { BookingEditor, BookingForm } from "./booking-form";
import { Actions } from "./ui/actions";
import {
  DatePicker,
  SelectItem,
  Button,
  ScrollArea,
  Empty,
  ErrorMessage,
  Input,
  Loading,
  PageHeader,
  Pagination,
  Select,
} from "./ui/controls";

export function Bookings() {
  const params = useSearchParams();
  const overview = useCommand("overview", {});
  const [accountId, setAccountId] = useState(params.get("account") ?? "");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [offset, setOffset] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const data = useCommand("list_bookings", {
    accountId: accountId || undefined,
    search,
    from: from || undefined,
    to: to || undefined,
    offset,
  });
  const remove = useAction("delete_booking");
  const accounts = overview.data?.accounts ?? [];
  const labels = new Map(
    accounts.map((account) => [
      account.id,
      account.parentId
        ? `${accounts.find((parent) => parent.id === account.parentId)?.name} / ${account.name}`
        : account.name,
    ]),
  );
  return (
    <>
      <PageHeader title="Bookings">
        <Button variant="primary" onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          New booking
        </Button>
      </PageHeader>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <Input
          className="col-span-2 min-w-0 sm:min-w-48 sm:flex-1"
          aria-label="Search bookings"
          placeholder="Search bookings"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setOffset(0);
          }}
        />
        <Select
          aria-label="Booking account filter"
          className="col-span-2 w-full sm:w-auto sm:max-w-72"
          value={accountId}
          onValueChange={(value) => {
            setAccountId(value);
            setOffset(0);
          }}
        >
          <SelectItem value="">All accounts</SelectItem>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {labels.get(account.id)}
            </SelectItem>
          ))}
        </Select>
        <DatePicker
          className="w-full sm:w-auto"

          aria-label="Bookings from"
          placeholder="From"
          value={from}
          onValueChange={(value) => {
            setFrom(value);
            setOffset(0);
          }}
        />
        <DatePicker
          className="w-full sm:w-auto"

          aria-label="Bookings to"
          placeholder="To"
          value={to}
          onValueChange={(value) => {
            setTo(value);
            setOffset(0);
          }}
        />
      </div>
      <ErrorMessage error={data.error ?? overview.error ?? remove.error} />
      {data.isPending ? (
        <Loading />
      ) : data.error ? null : !data.data?.rows.length ? (
        <Empty>No bookings in this view.</Empty>
      ) : (
        <ScrollArea
          className="table-panel"
          aria-busy={data.fetchStatus !== "idle"}
          inert={data.isPlaceholderData}
        >
          <table className="data-table entry-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Booking</th>
                <th>Source</th>
                <th className="text-right">Amount</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.data.rows.map((entry) => (
                <tr key={entry.id}>
                  <td className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                    {entry.date}
                  </td>
                  <td className="entry-description min-w-0">
                    <p className="break-words">{entry.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground sm:hidden">
                      {entry.date} · {entry.origin}
                    </p>
                    <p className="mt-1 max-w-lg truncate text-xs text-muted-foreground">
                      {entry.postings
                        .filter((posting) => posting.amount < 0)
                        .map((posting) => labels.get(posting.accountId))
                        .join(" + ")}{" "}
                      →{" "}
                      {entry.postings
                        .filter((posting) => posting.amount > 0)
                        .map((posting) => labels.get(posting.accountId))
                        .join(" + ")}
                    </p>
                  </td>
                  <td className="hidden sm:table-cell">
                    <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {entry.origin}
                    </span>
                  </td>
                  <td className="entry-amount number text-right whitespace-nowrap">
                    {euro(
                      entry.postings.reduce(
                        (sum, posting) => sum + Math.max(0, posting.amount),
                        0,
                      ),
                    )}
                  </td>
                  <td className="entry-actions">
                    <div className="flex justify-end gap-1">
                      <Actions
                        name={entry.description}
                        onEdit={() => setEditing(entry.id)}
                        onDelete={() =>
                          remove.mutate({
                            id: entry.id,
                            revision: entry.revision,
                          })
                        }
                        pending={remove.isPending}
                        description="Linked imported transactions will return to the inbox."
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
      {editing &&
        (editing === "new" ? (
          <BookingForm accounts={accounts} onClose={() => setEditing(null)} />
        ) : (
          <BookingEditor
            id={editing}
            accounts={accounts}
            onClose={() => setEditing(null)}
          />
        ))}
    </>
  );
}
