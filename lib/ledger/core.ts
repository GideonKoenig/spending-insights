import { and, eq } from "drizzle-orm";
import { db, type Transaction } from "@/lib/db";
import { ledgerAccounts, user } from "@/lib/db/schema";
import { categories } from "./contracts";
import { DomainError } from "./errors";

// Serialize changes within one user's ledger, including imports and rule application.
export async function inLedger<T>(
  userId: string,
  run: (tx: Transaction) => Promise<T>,
) {
  return db.transaction(async (tx) => {
    const [owner] = await tx
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userId))
      .for("update");
    if (!owner) throw new DomainError("Sign in to continue.", 401);
    const [opening] = await tx
      .select({ id: ledgerAccounts.id })
      .from(ledgerAccounts)
      .where(
        and(
          eq(ledgerAccounts.userId, userId),
          eq(ledgerAccounts.key, "opening-balances"),
        ),
      );
    if (!opening) {
      await tx.insert(ledgerAccounts).values([
        {
          userId,
          key: "opening-balances",
          name: "Opening balances",
          kind: "equity",
          role: "opening",
          system: true,
        },
        ...categories.map((category) => ({
          userId,
          key: category.key,
          name: category.name,
          kind: category.kind,
          role: "category" as const,
          system: true,
        })),
      ]);
    }
    return run(tx);
  });
}

export async function getAccount(tx: Transaction, userId: string, id: string) {
  const [account] = await tx
    .select()
    .from(ledgerAccounts)
    .where(and(eq(ledgerAccounts.userId, userId), eq(ledgerAccounts.id, id)));
  if (!account) throw new DomainError("Account not found.", 404);
  return account;
}
