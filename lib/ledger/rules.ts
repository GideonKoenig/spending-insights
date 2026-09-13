import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";
import { type Transaction } from "@/lib/db";
import {
  ledgerAccounts,
  rules,
  transactions,
  type RuleConditions,
} from "@/lib/db/schema";
import { conditions, decimal, id, name } from "./contracts";
import { getAccount } from "./core";
import { saveBooking } from "./bookings";
import { DomainError } from "./errors";

export const ruleInput = z.object({
  id: id.optional(),
  name,
  priority: z.number().int().min(0).max(10_000).default(100),
  enabled: z.boolean().default(true),
  conditions,
  targetId: id,
});

export async function saveRule(
  tx: Transaction,
  userId: string,
  input: z.infer<typeof ruleInput>,
) {
  const target = await getAccount(tx, userId, input.targetId);
  if (target.archived || target.role === "opening")
    throw new DomainError("Choose an active booking account.");
  if (input.conditions.accountId) {
    const source = await getAccount(tx, userId, input.conditions.accountId);
    if (
      source.archived ||
      !["bank", "cash", "investment", "debt"].includes(source.role)
    )
      throw new DomainError("Choose an active real-world source account.");
    if (source.id === target.id)
      throw new DomainError(
        "Source and destination must be different accounts.",
      );
  }
  const values = {
    name: input.name,
    priority: input.priority,
    enabled: input.enabled,
    conditions: input.conditions,
    targetId: input.targetId,
  };
  if (input.id) {
    const [rule] = await tx
      .update(rules)
      .set(values)
      .where(and(eq(rules.userId, userId), eq(rules.id, input.id)))
      .returning();
    if (!rule) throw new DomainError("Rule not found.", 404);
    return rule;
  }
  const [rule] = await tx
    .insert(rules)
    .values({
      userId,
      name: input.name,
      priority: input.priority,
      enabled: input.enabled,
      conditions: input.conditions,
      targetId: input.targetId,
    })
    .returning();
  return rule;
}

export function matches(
  row: {
    accountId: string;
    amount: number;
    description: string;
    counterparty: string;
  },
  filter: RuleConditions,
) {
  if (filter.accountId && filter.accountId !== row.accountId) return false;
  if (filter.direction === "incoming" && row.amount <= 0) return false;
  if (filter.direction === "outgoing" && row.amount >= 0) return false;
  if (
    filter.description &&
    !row.description.toLowerCase().includes(filter.description.toLowerCase())
  )
    return false;
  if (
    filter.counterparty &&
    !row.counterparty.toLowerCase().includes(filter.counterparty.toLowerCase())
  )
    return false;
  if (filter.minimum !== undefined && Math.abs(row.amount) < filter.minimum)
    return false;
  if (filter.maximum !== undefined && Math.abs(row.amount) > filter.maximum)
    return false;
  return true;
}

// Transfers to another imported account need an explicit match, so rules leave those in the inbox.
export async function applyRules(
  tx: Transaction,
  userId: string,
  input: { preview: boolean; transactionIds?: string[] },
) {
  const available = await tx
    .select()
    .from(rules)
    .where(and(eq(rules.userId, userId), eq(rules.enabled, true)))
    .orderBy(asc(rules.priority), asc(rules.createdAt), asc(rules.id));
  const accounts = await tx
    .select()
    .from(ledgerAccounts)
    .where(eq(ledgerAccounts.userId, userId));
  const byId = new Map(accounts.map((account) => [account.id, account]));
  const sources = await tx
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        isNull(transactions.entryId),
        input.transactionIds
          ? inArray(transactions.id, input.transactionIds)
          : undefined,
      ),
    )
    .orderBy(asc(transactions.date), asc(transactions.id))
    .limit(10_001);
  if (sources.length > 10_000)
    throw new DomainError(
      "Apply rules to at most 10,000 transactions at a time.",
    );
  const results: {
    transactionId: string;
    description: string;
    amount: number;
    ruleId: string;
    ruleName: string;
    targetId: string;
    status: "ready" | "needs-transfer-match" | "account-unavailable";
  }[] = [];
  for (const source of sources) {
    const rule = available.find(
      (rule) =>
        rule.targetId !== source.accountId && matches(source, rule.conditions),
    );
    if (!rule) continue;
    const target = byId.get(rule.targetId);
    const status =
      !target || target.archived || byId.get(source.accountId)?.archived
        ? "account-unavailable"
        : ["bank", "cash", "investment", "debt"].includes(target.role)
          ? "needs-transfer-match"
          : "ready";
    results.push({
      transactionId: source.id,
      description: source.description,
      amount: source.amount,
      ruleId: rule.id,
      ruleName: rule.name,
      targetId: rule.targetId,
      status,
    });
    if (!input.preview && status === "ready") {
      await saveBooking(
        tx,
        userId,
        {
          date: source.date,
          description: source.description,
          sourceIds: [source.id],
          postings: [
            { accountId: source.accountId, amount: decimal(source.amount) },
            { accountId: rule.targetId, amount: decimal(-source.amount) },
          ],
        },
        "rule",
        rule.id,
      );
    }
  }
  return {
    preview: input.preview,
    matched: results.length,
    booked: input.preview
      ? 0
      : results.filter((result) => result.status === "ready").length,
    results,
  };
}
