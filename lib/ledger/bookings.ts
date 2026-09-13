import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { type Transaction } from "@/lib/db";
import {
  entries,
  ledgerAccounts,
  postings,
  transactions,
} from "@/lib/db/schema";
import { cents, decimal, type Booking } from "./contracts";
import { DomainError } from "./errors";

export async function saveBooking(
  tx: Transaction,
  userId: string,
  input: Booking,
  origin: typeof entries.$inferInsert.origin = "manual",
  ruleId?: string,
) {
  const id = input.id ?? crypto.randomUUID();
  const [existing] = await tx
    .select()
    .from(entries)
    .where(and(eq(entries.userId, userId), eq(entries.id, id)));
  if (
    input.revision !== undefined &&
    (!existing || existing.revision !== input.revision)
  )
    throw new DomainError(
      "This booking changed. Reload it before saving.",
      409,
    );
  if (existing && input.revision === undefined)
    throw new DomainError(
      "This booking already exists. Supply its current revision to edit it.",
      409,
    );
  const amounts = input.postings.map((posting) => ({
    userId,
    entryId: id,
    accountId: posting.accountId,
    amount: cents(posting.amount),
  }));
  if (amounts.some((posting) => posting.amount === 0))
    throw new DomainError("Booking amounts must be non-zero.");
  if (amounts.reduce((sum, posting) => sum + posting.amount, 0) !== 0)
    throw new DomainError("Debits and credits must balance exactly.");
  if (
    new Set(amounts.map((posting) => posting.accountId)).size !== amounts.length
  )
    throw new DomainError("Use one posting per account.");
  if (new Set(input.sourceIds).size !== input.sourceIds.length)
    throw new DomainError("A source transaction was selected twice.");
  const accounts = await tx
    .select()
    .from(ledgerAccounts)
    .where(
      and(
        eq(ledgerAccounts.userId, userId),
        inArray(
          ledgerAccounts.id,
          amounts.map((posting) => posting.accountId),
        ),
      ),
    );
  if (accounts.length !== amounts.length)
    throw new DomainError("One or more accounts were not found.", 404);
  if (accounts.some((account) => account.archived))
    throw new DomainError("Restore archived accounts before booking to them.");
  const sources = input.sourceIds.length
    ? await tx
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            inArray(transactions.id, input.sourceIds),
          ),
        )
    : [];
  if (sources.length !== input.sourceIds.length)
    throw new DomainError(
      "One or more source transactions were not found.",
      404,
    );
  if (sources.some((source) => source.entryId && source.entryId !== id))
    throw new DomainError(
      "A selected transaction is already booked. Unbook it first.",
      409,
    );
  const sourceTotals = new Map<string, number>();
  for (const source of sources)
    sourceTotals.set(
      source.accountId,
      (sourceTotals.get(source.accountId) ?? 0) + source.amount,
    );
  for (const [accountId, amount] of sourceTotals) {
    if (
      amounts.find((posting) => posting.accountId === accountId)?.amount !==
      amount
    )
      throw new DomainError(
        "The booking must preserve the amount on each imported account.",
      );
  }
  if (existing) {
    await tx
      .update(transactions)
      .set({ entryId: null })
      .where(
        and(eq(transactions.userId, userId), eq(transactions.entryId, id)),
      );
    await tx
      .delete(postings)
      .where(and(eq(postings.userId, userId), eq(postings.entryId, id)));
    await tx
      .update(entries)
      .set({
        date: input.date,
        description: input.description,
        revision: existing.revision + 1,
        origin: "manual",
        ruleId: null,
      })
      .where(eq(entries.id, id));
  } else {
    await tx.insert(entries).values({
      id,
      userId,
      date: input.date,
      description: input.description,
      origin: sources.length && origin === "manual" ? "import" : origin,
      ruleId,
    });
  }
  await tx.insert(postings).values(amounts);
  if (input.sourceIds.length)
    await tx
      .update(transactions)
      .set({ entryId: id })
      .where(
        and(
          eq(transactions.userId, userId),
          inArray(transactions.id, input.sourceIds),
        ),
      );
  return { id, revision: existing ? existing.revision + 1 : 1 };
}

export async function deleteBooking(
  tx: Transaction,
  userId: string,
  id: string,
  revision: number,
) {
  const [entry] = await tx
    .select()
    .from(entries)
    .where(and(eq(entries.userId, userId), eq(entries.id, id)));
  if (!entry) throw new DomainError("Booking not found.", 404);
  if (entry.revision !== revision)
    throw new DomainError("This booking changed. Reload before deleting.", 409);
  await tx
    .update(transactions)
    .set({ entryId: null })
    .where(and(eq(transactions.userId, userId), eq(transactions.entryId, id)));
  await tx
    .delete(entries)
    .where(and(eq(entries.userId, userId), eq(entries.id, id)));
  return { id };
}

export async function getBooking(tx: Transaction, userId: string, id: string) {
  const [entry] = await tx
    .select()
    .from(entries)
    .where(and(eq(entries.userId, userId), eq(entries.id, id)));
  if (!entry) throw new DomainError("Booking not found.", 404);
  const lines = await tx
    .select()
    .from(postings)
    .where(and(eq(postings.userId, userId), eq(postings.entryId, id)));
  const sources = await tx
    .select()
    .from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.entryId, id)));
  return { entry, postings: lines, sources };
}

export async function findMatches(
  tx: Transaction,
  userId: string,
  transactionId: string,
) {
  const [source] = await tx
    .select()
    .from(transactions)
    .where(
      and(eq(transactions.userId, userId), eq(transactions.id, transactionId)),
    );
  if (!source) throw new DomainError("Transaction not found.", 404);
  if (source.entryId) return [];
  return tx
    .select({
      id: entries.id,
      date: entries.date,
      description: entries.description,
      revision: entries.revision,
    })
    .from(entries)
    .innerJoin(postings, eq(postings.entryId, entries.id))
    .where(
      and(
        eq(entries.userId, userId),
        eq(postings.accountId, source.accountId),
        eq(postings.amount, source.amount),
        sql`${entries.date} between ${source.date}::date - 7 and ${source.date}::date + 7`,
        sql`not exists (select 1 from transactions source where source."entryId" = ${entries.id} and source."accountId" = ${source.accountId})`,
      ),
    )
    .orderBy(asc(entries.date), asc(entries.id))
    .limit(20);
}

export async function linkTransaction(
  tx: Transaction,
  userId: string,
  input: { transactionId: string; entryId: string; revision: number },
) {
  const booking = await getBooking(tx, userId, input.entryId);
  return saveBooking(tx, userId, {
    id: booking.entry.id,
    revision: input.revision,
    date: booking.entry.date,
    description: booking.entry.description,
    sourceIds: [
      ...booking.sources.map((source) => source.id),
      input.transactionId,
    ],
    postings: booking.postings.map((posting) => ({
      accountId: posting.accountId,
      amount: decimal(posting.amount),
    })),
  });
}
