"use client";

import { useState } from "react";
import Link from "next/link";
import { Archive, Plus } from "lucide-react";
import { useAction, useCommand, type LedgerAccount } from "@/lib/client";
import { realRoles, roleNames } from "@/lib/ledger/contracts";
import { euro, today, cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Actions } from "./ui/actions";
import {
  Checkbox,
  DatePicker,
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
  Select,
} from "./ui/controls";

export function Accounts() {
  const overview = useCommand("overview", {});
  const [tab, setTab] = useState<"real" | "booking">("real");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<LedgerAccount | "new" | null>(null);
  const remove = useAction("delete_account");
  const accounts =
    overview.data?.accounts.filter(
      (account) =>
        (showArchived || !account.archived) &&
        (tab === "real"
          ? realRoles[account.role]
          : ["category", "receivable", "payable", "opening"].includes(
              account.role,
            )),
    ) ?? [];
  const byId = new Map(
    overview.data?.accounts.map((account) => [account.id, account]),
  );
  return (
    <>
      <PageHeader title="Accounts">
        <Button variant="primary" onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          {tab === "real" ? "Add account" : "Add derivative"}
        </Button>
      </PageHeader>
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as typeof tab)}
        className="gap-0"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="real">Real accounts</TabsTrigger>
            <TabsTrigger value="booking">Booking accounts</TabsTrigger>
          </TabsList>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={showArchived}
              onCheckedChange={(value) => setShowArchived(value)}
            />
            Show archived
          </label>
        </div>
        <TabsContent value={tab}>
          <ErrorMessage error={overview.error ?? remove.error} />
          {overview.isPending ? (
            <Loading />
          ) : overview.error ? null : !accounts.length ? (
            <Empty>
              Add a bank, cash, investment or debt account to get started.
            </Empty>
          ) : (
            <ScrollArea className="table-panel">
              <table className="data-table entry-table">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Type</th>
                    {tab === "real" && <th>Import key</th>}
                    <th className="text-right">Balance</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr
                      key={account.id}
                      className={account.archived ? "opacity-50" : ""}
                    >
                      <td className="entry-description min-w-0">
                        <Link
                          className="[overflow-wrap:anywhere] hover:text-primary"
                          href={`/bookings?account=${account.id}`}
                        >
                          {account.parentId && (
                            <span className="text-muted-foreground">
                              {byId.get(account.parentId)?.name} /{" "}
                            </span>
                          )}
                          {account.name}
                        </Link>
                        {account.bankName && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {account.bankName}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground sm:hidden">
                          {roleNames[account.role]}
                          {tab === "real" && (
                            <span className="break-all font-mono">
                              {" · "}
                              {account.key}
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="hidden text-muted-foreground sm:table-cell">
                        {roleNames[account.role]}
                      </td>
                      {tab === "real" && (
                        <td className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                          {account.key}
                        </td>
                      )}
                      <td
                        className={cn(
                          "entry-amount number whitespace-nowrap text-right",
                          account.kind === "liability" && "text-accent",
                        )}
                      >
                        {euro(account.balance)}
                      </td>
                      <td className="entry-actions">
                        <div className="flex justify-end gap-1">
                          {account.archived && (
                            <Archive className="m-2 size-4 text-muted-foreground" />
                          )}
                          {!account.system && !account.personId && (
                            <Actions
                              name={account.name}
                              onEdit={() => setEditing(account)}
                              onDelete={() => remove.mutate({ id: account.id })}
                              pending={remove.isPending}
                              description="Only unused accounts can be deleted. Archive an account to keep its bookings."
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
      {editing && overview.data && (
        <AccountForm
          key={editing === "new" ? `new-${tab}` : editing.id}
          account={editing === "new" ? undefined : editing}
          categories={overview.data.accounts.filter(
            (account) => account.role === "category" && account.system,
          )}
          derivative={tab === "booking"}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function AccountForm({
  account,
  categories,
  derivative,
  onClose,
}: {
  account?: LedgerAccount;
  categories: LedgerAccount[];
  derivative: boolean;
  onClose: () => void;
}) {
  const create = useAction("create_account");
  const update = useAction("update_account");
  const [name, setName] = useState(account?.name ?? "");
  const [key, setKey] = useState(account?.key ?? "");
  const [role, setRole] = useState<
    "bank" | "cash" | "investment" | "debt" | "category"
  >(derivative ? "category" : "bank");
  const [parentId, setParentId] = useState(
    account?.parentId ?? categories[0]?.id ?? "",
  );
  const [bankName, setBankName] = useState(account?.bankName ?? "");
  const [balance, setBalance] = useState("0");
  const [date, setDate] = useState(today());
  const [archived, setArchived] = useState(account?.archived ?? false);
  return (
    <Modal
      title={
        account
          ? "Edit account"
          : derivative
            ? "Add derivative account"
            : "Add account"
      }
      onClose={onClose}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (account)
            update.mutate(
              { id: account.id, name, bankName, archived },
              { onSuccess: onClose },
            );
          else
            create.mutate(
              {
                name,
                key,
                role,
                parentId: derivative ? parentId : undefined,
                bankName: bankName || undefined,
                openingBalance: balance,
                openingDate: date,
              },
              { onSuccess: onClose },
            );
        }}
      >
        <Field label="Name">
          <Input
            autoFocus
            required
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (!account)
                setKey(
                  event.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "")
                    .slice(0, 64),
                );
            }}
          />
        </Field>
        {!account && (
          <>
            <Field label={derivative ? "Account key" : "Import key"}>
              <Input
                required
                pattern="[a-z0-9][a-z0-9_-]{0,63}"
                value={key}
                onChange={(event) => setKey(event.target.value)}
              />
            </Field>
            {derivative ? (
              <Field label="Main category">
                <Select
                  value={parentId}
                  onValueChange={(value) => setParentId(value)}
                >
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.kind === "income" ? "Income" : "Expense"} /{" "}
                      {category.name}
                    </SelectItem>
                  ))}
                </Select>
              </Field>
            ) : (
              <>
                <Field label="Type">
                  <Select
                    value={role}
                    onValueChange={(value) => setRole(value as typeof role)}
                  >
                    <SelectItem value="bank">Bank account</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="debt">Debt</SelectItem>
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label={
                      role === "debt"
                        ? "Amount owed (€)"
                        : "Opening balance (€)"
                    }
                  >
                    <Input
                      inputMode="decimal"
                      required
                      value={balance}
                      onChange={(event) => setBalance(event.target.value)}
                    />
                  </Field>
                  <Field label="As of">
                    <DatePicker
                      required

                      value={date}
                      onValueChange={(value) => setDate(value)}
                    />
                  </Field>
                </div>
              </>
            )}
          </>
        )}
        {!derivative && (
          <Field label="Bank / institution">
            <Input
              value={bankName}
              onChange={(event) => setBankName(event.target.value)}
            />
          </Field>
        )}
        {account && (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={archived}
              onCheckedChange={(value) => setArchived(value)}
            />
            Archived
          </label>
        )}
        <ErrorMessage error={create.error ?? update.error} />
        <div className="mt-2 flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="primary"
            busy={create.isPending || update.isPending}
          >
            {account ? "Save changes" : "Create account"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
