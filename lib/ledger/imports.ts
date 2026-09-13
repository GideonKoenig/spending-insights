import { and, eq, inArray } from "drizzle-orm";
import { type Transaction } from "@/lib/db";
import { entries, ledgerAccounts, transactions } from "@/lib/db/schema";
import { cents, type ImportRow } from "./contracts";
import { deleteBooking } from "./bookings";
import { DomainError } from "./errors";

export async function importTransactions(
  tx: Transaction,
  userId: string,
  rows: ImportRow[],
  preview: boolean,
) {
  const accounts = await tx
    .select()
    .from(ledgerAccounts)
    .where(eq(ledgerAccounts.userId, userId));
  const accountByKey = new Map(
    accounts.map((account) => [account.key, account]),
  );
  const existing = await tx
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        inArray(
          transactions.externalId,
          rows.map((row) => row.externalId),
        ),
      ),
    );
  const byKey = new Map(
    existing.map((row) => [`${row.accountId}:${row.externalId}`, row]),
  );
  const additions: (typeof transactions.$inferInsert)[] = [];
  let skipped = 0;
  for (const [index, row] of rows.entries()) {
    const account = accountByKey.get(row.account);
    if (
      !account ||
      account.archived ||
      !["bank", "cash", "investment", "debt"].includes(account.role)
    )
      throw new DomainError(
        `Row ${index + 2}: '${row.account}' is not an active real-world account key.`,
      );
    const amount = cents(row.amount);
    if (amount === 0)
      throw new DomainError(`Row ${index + 2}: amount must be non-zero.`);
    const key = `${account.id}:${row.externalId}`;
    const record = {
      userId,
      accountId: account.id,
      externalId: row.externalId,
      date: row.date,
      amount,
      description: row.description,
      counterparty: row.counterparty,
      reference: row.reference,
    };
    const duplicate = byKey.get(key);
    if (duplicate) {
      if (
        duplicate.date !== record.date ||
        duplicate.amount !== record.amount ||
        duplicate.description !== record.description ||
        duplicate.counterparty !== record.counterparty ||
        duplicate.reference !== record.reference
      )
        throw new DomainError(
          `Row ${index + 2}: ID '${row.externalId}' already exists with different data. Edit it explicitly or use its original contents.`,
          409,
        );
      skipped++;
      continue;
    }
    additions.push(record);
    byKey.set(key, { id: "", entryId: null, createdAt: "", ...record });
  }
  if (!preview && additions.length) {
    for (let offset = 0; offset < additions.length; offset += 500)
      await tx
        .insert(transactions)
        .values(additions.slice(offset, offset + 500));
  }
  return {
    preview,
    imported: additions.length,
    skipped,
    sample: additions.slice(0, 10).map((row) => ({
      date: row.date,
      description: row.description,
      amount: row.amount,
      accountId: row.accountId,
    })),
  };
}

export async function updateTransaction(
  tx: Transaction,
  userId: string,
  input: {
    id: string;
    date: string;
    amount: string;
    description: string;
    counterparty: string;
    reference: string;
  },
) {
  const [record] = await tx
    .select()
    .from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.id, input.id)));
  if (!record) throw new DomainError("Transaction not found.", 404);
  if (record.entryId)
    throw new DomainError(
      "Unbook this transaction before changing its imported data.",
    );
  const amount = cents(input.amount);
  if (amount === 0) throw new DomainError("Amount must be non-zero.");
  await tx
    .update(transactions)
    .set({
      date: input.date,
      amount,
      description: input.description,
      counterparty: input.counterparty,
      reference: input.reference,
    })
    .where(and(eq(transactions.userId, userId), eq(transactions.id, input.id)));
  return { id: input.id };
}

export async function deleteTransaction(
  tx: Transaction,
  userId: string,
  id: string,
) {
  const [record] = await tx
    .select()
    .from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.id, id)));
  if (!record) throw new DomainError("Transaction not found.", 404);
  if (record.entryId) {
    const [entry] = await tx
      .select()
      .from(entries)
      .where(and(eq(entries.userId, userId), eq(entries.id, record.entryId)));
    await deleteBooking(tx, userId, entry.id, entry.revision);
  }
  await tx
    .delete(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.id, id)));
  return { id };
}
