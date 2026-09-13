"use client";

import { useState } from "react";
import { Plus, Workflow } from "lucide-react";
import { useAction, useCommand, type LedgerAccount } from "@/lib/client";
import type { Output } from "@/lib/ledger/commands";
import { realRoles, cents, decimal } from "@/lib/ledger/contracts";
import { euro } from "@/lib/utils";
import { Actions } from "./ui/actions";
import {
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
  Select,
} from "./ui/controls";

type Rule = Output<"overview">["rules"][number];

export function Rules() {
  const overview = useCommand("overview", {});
  const [editing, setEditing] = useState<Rule | "new" | null>(null);
  const [applying, setApplying] = useState(false);
  const remove = useAction("delete_rule");
  const names = new Map(
    overview.data?.accounts.map((account) => [account.id, account.name]),
  );
  return (
    <>
      <PageHeader
        title="Booking rules"
        subtitle="First match wins. Lower priorities run first."
      >
        <Button onClick={() => setApplying(true)}>
          <Workflow className="size-4" />
          Apply rules
        </Button>
        <Button variant="primary" onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          New rule
        </Button>
      </PageHeader>
      <ErrorMessage error={overview.error ?? remove.error} />
      {overview.isPending ? (
        <Loading />
      ) : overview.error ? null : !overview.data?.rules.length ? (
        <Empty>Create a rule for recurring transactions.</Empty>
      ) : (
        <ScrollArea className="table-panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Rule</th>
                <th>Book to</th>
                <th>Status</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {overview.data.rules.map((rule) => (
                <tr key={rule.id}>
                  <td className="number text-muted-foreground">
                    {rule.priority}
                  </td>
                  <td>
                    <p>{rule.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[
                        rule.conditions.accountId
                          ? names.get(rule.conditions.accountId)
                          : "All accounts",
                        rule.conditions.direction !== "all"
                          ? rule.conditions.direction
                          : "",
                        rule.conditions.description
                          ? `description: ${rule.conditions.description}`
                          : "",
                        rule.conditions.counterparty
                          ? `counterparty: ${rule.conditions.counterparty}`
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </td>
                  <td>{names.get(rule.targetId)}</td>
                  <td>
                    <span
                      className={
                        rule.enabled ? "text-primary" : "text-muted-foreground"
                      }
                    >
                      {rule.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <Actions
                        name={rule.name}
                        onEdit={() => setEditing(rule)}
                        onDelete={() => remove.mutate({ id: rule.id })}
                        pending={remove.isPending}
                        description="Existing bookings will stay as they are."
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      )}
      {editing && overview.data && (
        <RuleForm
          rule={editing === "new" ? undefined : editing}
          accounts={overview.data.accounts}
          onClose={() => setEditing(null)}
        />
      )}
      {applying && <ApplyRules onClose={() => setApplying(false)} />}
    </>
  );
}

function RuleForm({
  rule,
  accounts,
  onClose,
}: {
  rule?: Rule;
  accounts: LedgerAccount[];
  onClose: () => void;
}) {
  const save = useAction("save_rule");
  const [name, setName] = useState(rule?.name ?? "");
  const [priority, setPriority] = useState(rule?.priority ?? 100);
  const [enabled, setEnabled] = useState(rule?.enabled ?? true);
  const [accountId, setAccountId] = useState(rule?.conditions.accountId ?? "");
  const [direction, setDirection] = useState<"all" | "incoming" | "outgoing">(
    rule?.conditions.direction ?? "all",
  );
  const [description, setDescription] = useState(
    rule?.conditions.description ?? "",
  );
  const [counterparty, setCounterparty] = useState(
    rule?.conditions.counterparty ?? "",
  );
  const [minimum, setMinimum] = useState(
    rule?.conditions.minimum !== undefined
      ? decimal(rule.conditions.minimum)
      : "",
  );
  const [maximum, setMaximum] = useState(
    rule?.conditions.maximum !== undefined
      ? decimal(rule.conditions.maximum)
      : "",
  );
  const [targetId, setTargetId] = useState(rule?.targetId ?? "");
  const [error, setError] = useState<Error | null>(null);
  const labels = new Map(accounts.map((account) => [account.id, account.name]));
  return (
    <Modal title={rule ? "Edit rule" : "New rule"} onClose={onClose}>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          try {
            save.mutate(
              {
                id: rule?.id,
                name,
                priority,
                enabled,
                targetId,
                conditions: {
                  accountId: accountId || undefined,
                  direction,
                  description: description || undefined,
                  counterparty: counterparty || undefined,
                  minimum: minimum ? cents(minimum) : undefined,
                  maximum: maximum ? cents(maximum) : undefined,
                },
              },
              { onSuccess: onClose },
            );
          } catch {
            setError(new Error("Enter valid minimum and maximum amounts."));
          }
        }}
      >
        <Field label="Name">
          <Input
            autoFocus
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Source account">
            <Select
              value={accountId}
              onValueChange={(value) => setAccountId(value)}
            >
              <SelectItem value="">All accounts</SelectItem>
              {accounts
                .filter(
                  (account) => realRoles[account.role] && !account.archived,
                )
                .map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
            </Select>
          </Field>
          <Field label="Direction">
            <Select
              value={direction}
              onValueChange={(value) => setDirection(value as typeof direction)}
            >
              <SelectItem value="all">Any</SelectItem>
              <SelectItem value="outgoing">Outgoing</SelectItem>
              <SelectItem value="incoming">Incoming</SelectItem>
            </Select>
          </Field>
        </div>
        <Field label="Description contains">
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <Field label="Counterparty contains">
          <Input
            value={counterparty}
            onChange={(event) => setCounterparty(event.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Minimum (€, absolute)">
            <Input
              inputMode="decimal"
              value={minimum}
              onChange={(event) => setMinimum(event.target.value)}
            />
          </Field>
          <Field label="Maximum (€, absolute)">
            <Input
              inputMode="decimal"
              value={maximum}
              onChange={(event) => setMaximum(event.target.value)}
            />
          </Field>
        </div>
        <Field label="Book to">
          <Select
            required
            value={targetId}
            onValueChange={(value) => setTargetId(value)}
          >
            {accounts
              .filter(
                (account) => !account.archived && account.role !== "opening",
              )
              .map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.parentId ? `${labels.get(account.parentId)} / ` : ""}
                  {account.name}
                </SelectItem>
              ))}
          </Select>
        </Field>
        <div className="flex items-end gap-5">
          <Field label="Priority">
            <Input
              type="number"
              min={0}
              max={10000}
              value={priority}
              onChange={(event) => setPriority(Number(event.target.value))}
            />
          </Field>
          <label className="mb-3 flex items-center gap-2 text-sm">
            <Checkbox
              checked={enabled}
              onCheckedChange={(value) => setEnabled(value)}
            />
            Enabled
          </label>
        </div>
        <ErrorMessage error={save.error ?? error} />
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" busy={save.isPending}>
            Save rule
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function ApplyRules({
  transactionIds,
  onClose,
}: {
  transactionIds?: string[];
  onClose: () => void;
}) {
  const preview = useCommand("apply_rules", { preview: true, transactionIds });
  const apply = useAction("apply_rules");
  const ready =
    preview.data?.results.filter((result) => result.status === "ready")
      .length ?? 0;
  return (
    <Modal wide title="Apply booking rules" onClose={onClose}>
      <ErrorMessage error={preview.error ?? apply.error} />
      {preview.isPending ? (
        <Loading variant="form" />
      ) : preview.error ? null : (
        <>
          <p className="text-sm text-muted-foreground">
            {ready} transactions ready to book. Existing bookings stay as they
            are.
          </p>
          {!preview.data?.results.length ? (
            <Empty>No unbooked transactions match your rules.</Empty>
          ) : (
            <ScrollArea viewportClassName="max-h-80">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Rule</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.data.results.map((result) => (
                    <tr key={result.transactionId}>
                      <td>
                        <span className="text-sm">{result.description}</span>
                        {result.status !== "ready" && (
                          <p className="mt-1 text-xs text-accent">
                            {result.status === "needs-transfer-match"
                              ? "Match this transfer manually"
                              : "Account unavailable"}
                          </p>
                        )}
                      </td>
                      <td className="text-xs text-muted-foreground">
                        {result.ruleName}
                      </td>
                      <td className="number text-right">
                        {euro(result.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              busy={apply.isPending}
              disabled={!ready}
              onClick={() =>
                apply.mutate(
                  { preview: false, transactionIds },
                  { onSuccess: onClose },
                )
              }
            >
              Book {ready} transactions
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
