import { and, eq, inArray, or } from "drizzle-orm";
import { z } from "zod";
import { type Transaction } from "@/lib/db";
import {
  ledgerAccounts,
  people,
  postings,
  rules,
  transactions,
} from "@/lib/db/schema";
import { accountKey, cents, date, decimal, id, money, name } from "./contracts";
import { getAccount } from "./core";
import { saveBooking } from "./bookings";
import { DomainError } from "./errors";

export const newAccount = z
  .object({
    name,
    key: accountKey,
    role: z.enum(["bank", "cash", "investment", "debt", "category"]),
    parentId: id.optional(),
    bankName: z.string().trim().max(120).optional(),
    openingBalance: money.default("0"),
    openingDate: date.optional(),
  })
  .refine(
    (value) => cents(value.openingBalance) === 0 || Boolean(value.openingDate),
    "Provide a date for the opening balance.",
  );

export async function createAccount(
  tx: Transaction,
  userId: string,
  input: z.infer<typeof newAccount>,
) {
  const parent = input.parentId
    ? await getAccount(tx, userId, input.parentId)
    : null;
  if (
    input.role === "category" &&
    (!parent || parent.role !== "category" || !parent.system || parent.archived)
  )
    throw new DomainError(
      "Choose an active main category for the derivative account.",
    );
  if (input.role !== "category" && parent)
    throw new DomainError("Only categories can have a parent.");
  if (input.role === "category" && cents(input.openingBalance) !== 0)
    throw new DomainError("Categories cannot have opening balances.");
  const [existing] = await tx
    .select({ id: ledgerAccounts.id })
    .from(ledgerAccounts)
    .where(
      and(eq(ledgerAccounts.userId, userId), eq(ledgerAccounts.key, input.key)),
    );
  if (existing)
    throw new DomainError("That account key is already in use.", 409);
  const [account] = await tx
    .insert(ledgerAccounts)
    .values({
      userId,
      name: input.name,
      key: input.key,
      role: input.role,
      kind: parent
        ? parent.kind
        : input.role === "debt"
          ? "liability"
          : "asset",
      parentId: parent?.id,
      bankName: input.bankName,
    })
    .returning();
  const balance = cents(input.openingBalance);
  if (balance !== 0 && input.openingDate) {
    const [opening] = await tx
      .select()
      .from(ledgerAccounts)
      .where(
        and(
          eq(ledgerAccounts.userId, userId),
          eq(ledgerAccounts.key, "opening-balances"),
        ),
      );
    const amount = account.kind === "liability" ? -balance : balance;
    await saveBooking(
      tx,
      userId,
      {
        date: input.openingDate,
        description: `Opening balance: ${account.name}`,
        sourceIds: [],
        postings: [
          { accountId: account.id, amount: decimal(amount) },
          { accountId: opening.id, amount: decimal(-amount) },
        ],
      },
      "opening",
    );
  }
  return account;
}

export async function updateAccount(
  tx: Transaction,
  userId: string,
  input: { id: string; name: string; archived: boolean; bankName?: string },
) {
  const account = await getAccount(tx, userId, input.id);
  if (account.system || account.personId)
    throw new DomainError(
      "Main categories are fixed. Manage person accounts through the person.",
    );
  await tx
    .update(ledgerAccounts)
    .set({
      name: input.name,
      archived: input.archived,
      bankName: input.bankName ?? null,
    })
    .where(
      and(eq(ledgerAccounts.userId, userId), eq(ledgerAccounts.id, input.id)),
    );
  return { id: input.id };
}

export async function deleteAccount(
  tx: Transaction,
  userId: string,
  id: string,
) {
  const account = await getAccount(tx, userId, id);
  if (account.system || account.personId)
    throw new DomainError("This account is managed automatically.");
  await assertUnused(tx, userId, [id]);
  await tx
    .delete(ledgerAccounts)
    .where(and(eq(ledgerAccounts.userId, userId), eq(ledgerAccounts.id, id)));
  return { id };
}

export async function createPerson(
  tx: Transaction,
  userId: string,
  name: string,
) {
  const [person] = await tx.insert(people).values({ userId, name }).returning();
  await tx.insert(ledgerAccounts).values([
    {
      userId,
      personId: person.id,
      key: `owed-by-${person.id}`,
      name: `${name} owes me`,
      kind: "asset",
      role: "receivable",
    },
    {
      userId,
      personId: person.id,
      key: `owed-to-${person.id}`,
      name: `I owe ${name}`,
      kind: "liability",
      role: "payable",
    },
  ]);
  return person;
}

export async function updatePerson(
  tx: Transaction,
  userId: string,
  input: { id: string; name: string; archived: boolean },
) {
  const [person] = await tx
    .update(people)
    .set({ name: input.name, archived: input.archived })
    .where(and(eq(people.userId, userId), eq(people.id, input.id)))
    .returning();
  if (!person) throw new DomainError("Person not found.", 404);
  for (const role of ["receivable", "payable"] as const) {
    await tx
      .update(ledgerAccounts)
      .set({
        name:
          role === "receivable"
            ? `${person.name} owes me`
            : `I owe ${person.name}`,
        archived: person.archived,
      })
      .where(
        and(
          eq(ledgerAccounts.userId, userId),
          eq(ledgerAccounts.personId, person.id),
          eq(ledgerAccounts.role, role),
        ),
      );
  }
  return person;
}

export async function deletePerson(
  tx: Transaction,
  userId: string,
  id: string,
) {
  const accounts = await tx
    .select()
    .from(ledgerAccounts)
    .where(
      and(eq(ledgerAccounts.userId, userId), eq(ledgerAccounts.personId, id)),
    );
  await assertUnused(
    tx,
    userId,
    accounts.map((account) => account.id),
  );
  await tx
    .delete(ledgerAccounts)
    .where(
      and(eq(ledgerAccounts.userId, userId), eq(ledgerAccounts.personId, id)),
    );
  const [person] = await tx
    .delete(people)
    .where(and(eq(people.userId, userId), eq(people.id, id)))
    .returning();
  if (!person) throw new DomainError("Person not found.", 404);
  return { id };
}

async function assertUnused(tx: Transaction, userId: string, ids: string[]) {
  if (!ids.length) return;
  const [posting] = await tx
    .select({ id: postings.id })
    .from(postings)
    .where(and(eq(postings.userId, userId), inArray(postings.accountId, ids)))
    .limit(1);
  const [source] = await tx
    .select({ id: transactions.id })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        inArray(transactions.accountId, ids),
      ),
    )
    .limit(1);
  const usedRules = await tx
    .select()
    .from(rules)
    .where(eq(rules.userId, userId));
  const [child] = await tx
    .select({ id: ledgerAccounts.id })
    .from(ledgerAccounts)
    .where(
      and(
        eq(ledgerAccounts.userId, userId),
        or(...ids.map((id) => eq(ledgerAccounts.parentId, id))),
      ),
    )
    .limit(1);
  if (
    posting ||
    source ||
    child ||
    usedRules.some(
      (rule) =>
        ids.includes(rule.targetId) ||
        (rule.conditions.accountId && ids.includes(rule.conditions.accountId)),
    )
  )
    throw new DomainError("This account is in use. Archive it instead.");
}
