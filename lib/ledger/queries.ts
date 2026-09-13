import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";
import { type Transaction } from "@/lib/db";
import {
  entries,
  ledgerAccounts,
  people,
  postings,
  rules,
  transactions,
} from "@/lib/db/schema";
import { page } from "./contracts";
import { DomainError } from "./errors";

export const transactionFilter = page.extend({
  status: z.enum(["all", "unbooked", "booked"]).default("unbooked"),
});

export async function overview(tx: Transaction, userId: string) {
  const accounts = await tx
    .select({
      ...getTableColumns(ledgerAccounts),
      balance: sql<number>`coalesce(sum(${postings.amount}), 0)::float8 * case when ${ledgerAccounts.kind} in ('liability', 'income', 'equity') then -1 else 1 end`,
    })
    .from(ledgerAccounts)
    .leftJoin(postings, eq(postings.accountId, ledgerAccounts.id))
    .where(eq(ledgerAccounts.userId, userId))
    .groupBy(ledgerAccounts.id)
    .orderBy(asc(ledgerAccounts.name));
  const contacts = await tx
    .select()
    .from(people)
    .where(eq(people.userId, userId))
    .orderBy(asc(people.name));
  const bookingRules = await tx
    .select()
    .from(rules)
    .where(eq(rules.userId, userId))
    .orderBy(asc(rules.priority), asc(rules.createdAt));
  const [pending] = await tx
    .select({ count: count() })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), isNull(transactions.entryId)));
  const [range] = await tx
    .select({
      first: sql<string | null>`min(${entries.date})::text`,
      last: sql<string | null>`max(${entries.date})::text`,
    })
    .from(entries)
    .where(eq(entries.userId, userId));
  return {
    accounts,
    people: contacts,
    rules: bookingRules,
    pending: pending.count,
    firstBooking: range.first,
    lastBooking: range.last,
  };
}

export async function listTransactions(
  tx: Transaction,
  userId: string,
  input: z.infer<typeof transactionFilter>,
) {
  const filter = and(
    eq(transactions.userId, userId),
    input.accountId ? eq(transactions.accountId, input.accountId) : undefined,
    input.from ? gte(transactions.date, input.from) : undefined,
    input.to ? lte(transactions.date, input.to) : undefined,
    input.status === "unbooked"
      ? isNull(transactions.entryId)
      : input.status === "booked"
        ? isNotNull(transactions.entryId)
        : undefined,
    input.search
      ? or(
          ilike(transactions.description, `%${input.search}%`),
          ilike(transactions.counterparty, `%${input.search}%`),
          ilike(transactions.externalId, `%${input.search}%`),
        )
      : undefined,
  );
  const rows = await tx
    .select()
    .from(transactions)
    .where(filter)
    .orderBy(desc(transactions.date), desc(transactions.id))
    .limit(input.limit)
    .offset(input.offset);
  const [total] = await tx
    .select({ count: count() })
    .from(transactions)
    .where(filter);
  return { rows, total: total.count };
}

export async function listBookings(
  tx: Transaction,
  userId: string,
  input: z.infer<typeof page>,
) {
  const accountEntries = input.accountId
    ? tx
        .select({ id: postings.entryId })
        .from(postings)
        .where(
          and(
            eq(postings.userId, userId),
            eq(postings.accountId, input.accountId),
          ),
        )
    : undefined;
  const filter = and(
    eq(entries.userId, userId),
    accountEntries ? inArray(entries.id, accountEntries) : undefined,
    input.from ? gte(entries.date, input.from) : undefined,
    input.to ? lte(entries.date, input.to) : undefined,
    input.search ? ilike(entries.description, `%${input.search}%`) : undefined,
  );
  const rows = await tx
    .select()
    .from(entries)
    .where(filter)
    .orderBy(desc(entries.date), desc(entries.createdAt), desc(entries.id))
    .limit(input.limit)
    .offset(input.offset);
  const [total] = await tx
    .select({ count: count() })
    .from(entries)
    .where(filter);
  const lines = rows.length
    ? await tx
        .select()
        .from(postings)
        .where(
          and(
            eq(postings.userId, userId),
            inArray(
              postings.entryId,
              rows.map((row) => row.id),
            ),
          ),
        )
    : [];
  return {
    rows: rows.map((row) => ({
      ...row,
      postings: lines.filter((line) => line.entryId === row.id),
    })),
    total: total.count,
  };
}

export async function reports(
  tx: Transaction,
  userId: string,
  input: {
    from: string;
    to: string;
    granularity: "month" | "quarter" | "year";
  },
) {
  if (input.from > input.to)
    throw new DomainError("Start date must precede end date.");
  const start = new Date(`${input.from}T00:00:00Z`);
  const end = new Date(`${input.to}T00:00:00Z`);
  if (end.getUTCFullYear() - start.getUTCFullYear() > 100)
    throw new DomainError("Choose a period shorter than 100 years.");
  const [opening] = await tx
    .select({
      value: sql<number>`coalesce(sum(${postings.amount}) filter (where ${ledgerAccounts.kind} in ('asset', 'liability')), 0)::float8`,
    })
    .from(postings)
    .innerJoin(entries, eq(entries.id, postings.entryId))
    .innerJoin(ledgerAccounts, eq(ledgerAccounts.id, postings.accountId))
    .where(
      and(
        eq(postings.userId, userId),
        sql`${entries.date} < ${input.from}::date`,
      ),
    );
  const aggregates = await tx
    .select({
      month: sql<string>`to_char(${entries.date}, 'YYYY-MM')`,
      income: sql<number>`coalesce(-sum(${postings.amount}) filter (where ${ledgerAccounts.kind} = 'income'), 0)::float8`,
      expense: sql<number>`coalesce(sum(${postings.amount}) filter (where ${ledgerAccounts.kind} = 'expense'), 0)::float8`,
      movement: sql<number>`coalesce(sum(${postings.amount}) filter (where ${ledgerAccounts.kind} in ('asset', 'liability')), 0)::float8`,
      cashIn: sql<number>`coalesce(sum(${postings.amount}) filter (where ${ledgerAccounts.role} in ('bank', 'cash') and ${postings.amount} > 0), 0)::float8`,
      cashOut: sql<number>`coalesce(-sum(${postings.amount}) filter (where ${ledgerAccounts.role} in ('bank', 'cash') and ${postings.amount} < 0), 0)::float8`,
    })
    .from(postings)
    .innerJoin(entries, eq(entries.id, postings.entryId))
    .innerJoin(ledgerAccounts, eq(ledgerAccounts.id, postings.accountId))
    .where(
      and(
        eq(postings.userId, userId),
        gte(entries.date, input.from),
        lte(entries.date, input.to),
      ),
    )
    .groupBy(sql`to_char(${entries.date}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${entries.date}, 'YYYY-MM')`);
  const categoryRows = await tx
    .select({
      id: ledgerAccounts.id,
      parentId: ledgerAccounts.parentId,
      name: ledgerAccounts.name,
      kind: ledgerAccounts.kind,
      amount: sql<number>`sum(${postings.amount})::float8 * case when ${ledgerAccounts.kind} = 'income' then -1 else 1 end`,
    })
    .from(postings)
    .innerJoin(entries, eq(entries.id, postings.entryId))
    .innerJoin(ledgerAccounts, eq(ledgerAccounts.id, postings.accountId))
    .where(
      and(
        eq(postings.userId, userId),
        gte(entries.date, input.from),
        lte(entries.date, input.to),
        inArray(ledgerAccounts.kind, ["income", "expense"]),
      ),
    )
    .groupBy(ledgerAccounts.id);
  const baseAccounts = await tx
    .select()
    .from(ledgerAccounts)
    .where(
      and(eq(ledgerAccounts.userId, userId), eq(ledgerAccounts.system, true)),
    );
  const categories = baseAccounts
    .filter((account) => account.role === "category")
    .map((account) => {
      const children = categoryRows.filter(
        (row) => row.id === account.id || row.parentId === account.id,
      );
      return {
        id: account.id,
        name: account.name,
        kind: account.kind,
        amount: children.reduce((sum, row) => sum + row.amount, 0),
        children,
      };
    })
    .filter((category) => category.children.length)
    .sort((left, right) => right.amount - left.amount);
  const byMonth = new Map(aggregates.map((row) => [row.month, row]));
  const periods: {
    label: string;
    income: number;
    expense: number;
    netWorth: number;
    cashIn: number;
    cashOut: number;
  }[] = [];
  let netWorth = opening.value;
  const cursor = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1),
  );
  while (cursor <= end) {
    const month = cursor.toISOString().slice(0, 7);
    const row = byMonth.get(month);
    netWorth += row?.movement ?? 0;
    const label =
      input.granularity === "year"
        ? month.slice(0, 4)
        : input.granularity === "quarter"
          ? `${month.slice(0, 4)} Q${Math.floor(cursor.getUTCMonth() / 3) + 1}`
          : month;
    const previous = periods.at(-1);
    if (previous?.label === label) {
      previous.income += row?.income ?? 0;
      previous.expense += row?.expense ?? 0;
      previous.cashIn += row?.cashIn ?? 0;
      previous.cashOut += row?.cashOut ?? 0;
      previous.netWorth = netWorth;
    } else
      periods.push({
        label,
        income: row?.income ?? 0,
        expense: row?.expense ?? 0,
        netWorth,
        cashIn: row?.cashIn ?? 0,
        cashOut: row?.cashOut ?? 0,
      });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  const duration = end.getTime() - start.getTime() + 86_400_000;
  const priorFrom = new Date(start.getTime() - duration)
    .toISOString()
    .slice(0, 10);
  const priorTo = new Date(start.getTime() - 86_400_000)
    .toISOString()
    .slice(0, 10);
  const [prior] = await tx
    .select({
      income: sql<number>`coalesce(-sum(${postings.amount}) filter (where ${ledgerAccounts.kind} = 'income'), 0)::float8`,
      expense: sql<number>`coalesce(sum(${postings.amount}) filter (where ${ledgerAccounts.kind} = 'expense'), 0)::float8`,
    })
    .from(postings)
    .innerJoin(entries, eq(entries.id, postings.entryId))
    .innerJoin(ledgerAccounts, eq(ledgerAccounts.id, postings.accountId))
    .where(
      and(
        eq(postings.userId, userId),
        gte(entries.date, priorFrom),
        lte(entries.date, priorTo),
      ),
    );
  return {
    from: input.from,
    to: input.to,
    periods,
    categories,
    totals: {
      income: periods.reduce((sum, row) => sum + row.income, 0),
      expense: periods.reduce((sum, row) => sum + row.expense, 0),
      netWorth,
      openingNetWorth: opening.value,
    },
    previous: {
      from: priorFrom,
      to: priorTo,
      income: prior.income,
      expense: prior.expense,
    },
  };
}
