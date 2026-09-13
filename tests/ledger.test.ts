import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { db, pool } from "@/lib/db";
import { entries, postings, transactions, user } from "@/lib/db/schema";
import { commands } from "@/lib/ledger/commands";
import { cents, decimal } from "@/lib/ledger/contracts";
import { parseCsv } from "@/lib/ledger/csv";

let owner: string;
let outsider: string;

beforeEach(async () => {
  owner = crypto.randomUUID();
  outsider = crypto.randomUUID();
  await db.insert(user).values([
    { id: owner, name: "Ledger test", email: `${owner}@test.invalid` },
    { id: outsider, name: "Other ledger", email: `${outsider}@test.invalid` },
  ]);
});

afterEach(async () => {
  await db.delete(user).where(eq(user.id, owner));
  await db.delete(user).where(eq(user.id, outsider));
});
afterAll(async () => {
  await pool.end();
});

describe("ledger accounting", () => {
  it("keeps transfers, investment contributions and principal repayments out of spending", async () => {
    const bank = await commands.create_account.execute(owner, {
      name: "Bank",
      key: "bank",
      role: "bank",
      openingBalance: "1000",
      openingDate: "2026-01-01",
    });
    const debt = await commands.create_account.execute(owner, {
      name: "Loan",
      key: "loan",
      role: "debt",
      openingBalance: "300",
      openingDate: "2026-01-01",
    });
    const investment = await commands.create_account.execute(owner, {
      name: "Investments",
      key: "investment",
      role: "investment",
    });
    for (const target of [investment, debt])
      await commands.save_booking.execute(owner, {
        date: "2026-02-01",
        description: "Transfer",
        postings: [
          { accountId: bank.id, amount: "-100" },
          { accountId: target.id, amount: "100" },
        ],
      });
    const report = await commands.reports.execute(owner, {
      from: "2026-01-01",
      to: "2026-03-31",
    });
    expect(report.totals).toMatchObject({
      netWorth: 70000,
      income: 0,
      expense: 0,
    });
    expect(report.periods.map((period) => period.netWorth)).toEqual([
      70000, 70000, 70000,
    ]);
    const accounts = await commands.overview.execute(owner, {});
    expect(
      accounts.accounts.find((account) => account.id === debt.id)?.balance,
    ).toBe(20000);
    expect(
      accounts.accounts.find((account) => account.id === bank.id)?.balance,
    ).toBe(80000);
  });

  it("splits a bill into personal spending and a receivable, then clears partial repayments", async () => {
    const bank = await commands.create_account.execute(owner, {
      name: "Bank",
      key: "bank",
      role: "bank",
      openingBalance: "1000",
      openingDate: "2026-01-01",
    });
    const person = await commands.create_person.execute(owner, {
      name: "Brother",
    });
    const overview = await commands.overview.execute(owner, {});
    const receivable = overview.accounts.find(
      (account) =>
        account.personId === person.id && account.role === "receivable",
    )!;
    const restaurant = overview.accounts.find(
      (account) => account.key === "restaurants",
    )!;
    const vapiano = await commands.create_account.execute(owner, {
      name: "Vapiano",
      key: "vapiano",
      role: "category",
      parentId: restaurant.id,
    });
    await commands.save_booking.execute(owner, {
      date: "2026-01-02",
      description: "Dinner",
      postings: [
        { accountId: bank.id, amount: "-120" },
        { accountId: vapiano.id, amount: "60" },
        { accountId: receivable.id, amount: "60" },
      ],
    });
    await commands.save_booking.execute(owner, {
      date: "2026-01-03",
      description: "Partial repayment",
      postings: [
        { accountId: bank.id, amount: "20" },
        { accountId: receivable.id, amount: "-20" },
      ],
    });
    const report = await commands.reports.execute(owner, {
      from: "2026-01-01",
      to: "2026-01-31",
    });
    expect(report.totals).toMatchObject({
      expense: 6000,
      income: 0,
      netWorth: 94000,
    });
    expect(
      report.categories.find((category) => category.id === restaurant.id),
    ).toMatchObject({
      amount: 6000,
      children: [expect.objectContaining({ id: vapiano.id, amount: 6000 })],
    });
    expect(
      (await commands.overview.execute(owner, {})).accounts.find(
        (account) => account.id === receivable.id,
      )?.balance,
    ).toBe(4000);
  });

  it("handles borrowed money and refunds with the correct reporting signs", async () => {
    const bank = await commands.create_account.execute(owner, {
      name: "Bank",
      key: "bank",
      role: "bank",
    });
    const person = await commands.create_person.execute(owner, {
      name: "Friend",
    });
    const accounts = (await commands.overview.execute(owner, {})).accounts;
    const payable = accounts.find(
      (account) => account.personId === person.id && account.role === "payable",
    )!;
    const category = accounts.find((account) => account.key === "shopping")!;
    await commands.save_booking.execute(owner, {
      date: "2026-01-01",
      description: "Loan",
      postings: [
        { accountId: bank.id, amount: "100" },
        { accountId: payable.id, amount: "-100" },
      ],
    });
    await commands.save_booking.execute(owner, {
      date: "2026-01-02",
      description: "Purchase",
      postings: [
        { accountId: bank.id, amount: "-40" },
        { accountId: category.id, amount: "40" },
      ],
    });
    await commands.save_booking.execute(owner, {
      date: "2026-01-03",
      description: "Refund",
      postings: [
        { accountId: bank.id, amount: "10" },
        { accountId: category.id, amount: "-10" },
      ],
    });
    expect(
      (
        await commands.reports.execute(owner, {
          from: "2026-01-01",
          to: "2026-01-31",
        })
      ).totals,
    ).toMatchObject({ income: 0, expense: 3000, netWorth: -3000 });
  });

  it("rejects unbalanced and cross-user postings, including direct database writes", async () => {
    const own = await commands.create_account.execute(owner, {
      name: "Bank",
      key: "bank",
      role: "bank",
    });
    const other = await commands.create_account.execute(outsider, {
      name: "Bank",
      key: "bank",
      role: "bank",
    });
    await expect(
      commands.save_booking.execute(owner, {
        date: "2026-01-01",
        description: "Wrong owner",
        postings: [
          { accountId: own.id, amount: "10" },
          { accountId: other.id, amount: "-10" },
        ],
      }),
    ).rejects.toThrow("not found");
    const category = (await commands.overview.execute(owner, {})).accounts.find(
      (account) => account.key === "restaurants",
    )!;
    await expect(
      commands.save_booking.execute(owner, {
        date: "2026-01-01",
        description: "Unbalanced",
        postings: [
          { accountId: own.id, amount: "-10" },
          { accountId: category.id, amount: "9.99" },
        ],
      }),
    ).rejects.toThrow("balance");
    await expect(
      db.transaction(async (tx) => {
        const [entry] = await tx
          .insert(entries)
          .values({
            userId: owner,
            date: "2026-01-01",
            description: "Direct imbalance",
            origin: "manual",
          })
          .returning();
        await tx.insert(postings).values([
          { userId: owner, entryId: entry.id, accountId: own.id, amount: -100 },
          {
            userId: owner,
            entryId: entry.id,
            accountId: category.id,
            amount: 99,
          },
        ]);
      }),
    ).rejects.toThrow();
    await expect(
      db.transaction(async (tx) => {
        const [entry] = await tx
          .insert(entries)
          .values({
            userId: owner,
            date: "2026-01-01",
            description: "Foreign account",
            origin: "manual",
          })
          .returning();
        await tx.insert(postings).values([
          { userId: owner, entryId: entry.id, accountId: own.id, amount: -100 },
          {
            userId: owner,
            entryId: entry.id,
            accountId: other.id,
            amount: 100,
          },
        ]);
      }),
    ).rejects.toThrow();
    expect((await commands.list_bookings.execute(owner, {})).total).toBe(0);
    await expect(
      commands.delete_account.execute(outsider, { id: own.id }),
    ).rejects.toThrow("not found");
  });
});

describe("imports and saved bookings", () => {
  it("links a later import to an existing transfer without moving money twice", async () => {
    const bank = await commands.create_account.execute(owner, {
      name: "Bank",
      key: "bank",
      role: "bank",
    });
    const savings = await commands.create_account.execute(owner, {
      name: "Savings",
      key: "savings",
      role: "bank",
    });
    const entry = await commands.save_booking.execute(owner, {
      date: "2026-01-01",
      description: "Transfer already booked",
      postings: [
        { accountId: bank.id, amount: "-100" },
        { accountId: savings.id, amount: "100" },
      ],
    });
    await commands.import_transactions.execute(owner, {
      rows: [
        {
          externalId: "later",
          account: "savings",
          date: "2026-01-02",
          amount: "100",
          currency: "EUR",
          description: "Transfer",
        },
      ],
      preview: false,
    });
    const source = (await commands.list_transactions.execute(owner, {}))
      .rows[0];
    expect(
      await commands.find_matches.execute(owner, { transactionId: source.id }),
    ).toEqual([expect.objectContaining({ id: entry.id })]);
    await commands.link_transaction.execute(owner, {
      transactionId: source.id,
      entryId: entry.id,
      revision: entry.revision,
    });
    expect((await commands.list_transactions.execute(owner, {})).total).toBe(0);
    expect((await commands.list_bookings.execute(owner, {})).total).toBe(1);
    expect(
      (await commands.overview.execute(owner, {})).accounts.find(
        (account) => account.id === savings.id,
      )?.balance,
    ).toBe(10000);
  });

  it("deduplicates by ID while preserving identical purchases and rejects conflicting imports atomically", async () => {
    await commands.create_account.execute(owner, {
      name: "Bank",
      key: "bank",
      role: "bank",
    });
    const row = {
      externalId: "first",
      account: "bank",
      date: "2026-01-01",
      amount: "-10.25",
      currency: "EUR",
      description: "Coffee",
    };
    const preview = await commands.import_transactions.execute(owner, {
      rows: [row],
    });
    expect(preview.imported).toBe(1);
    expect((await commands.list_transactions.execute(owner, {})).total).toBe(0);
    expect(
      await commands.import_transactions.execute(owner, {
        rows: [row, { ...row, externalId: "second" }],
        preview: false,
      }),
    ).toMatchObject({ imported: 2 });
    expect(
      await commands.import_transactions.execute(owner, {
        rows: [row],
        preview: false,
      }),
    ).toMatchObject({ imported: 0, skipped: 1 });
    await expect(
      commands.import_transactions.execute(owner, {
        rows: [
          { ...row, externalId: "third" },
          { ...row, amount: "-99" },
        ],
        preview: false,
      }),
    ).rejects.toThrow("different data");
    expect((await commands.list_transactions.execute(owner, {})).total).toBe(2);
    expect(
      (
        await commands.reports.execute(owner, {
          from: "2026-01-01",
          to: "2026-01-31",
        })
      ).totals.expense,
    ).toBe(0);
    await expect(
      commands.import_transactions.execute(outsider, {
        rows: [row],
        preview: false,
      }),
    ).rejects.toThrow("not an active");
  });

  it("matches both imported transfer sides once and restores the other side when one is deleted", async () => {
    const bank = await commands.create_account.execute(owner, {
      name: "Bank",
      key: "bank",
      role: "bank",
    });
    const savings = await commands.create_account.execute(owner, {
      name: "Savings",
      key: "savings",
      role: "bank",
    });
    await commands.import_transactions.execute(owner, {
      rows: [
        {
          externalId: "out",
          account: "bank",
          date: "2026-01-01",
          amount: "-100",
          currency: "EUR",
          description: "Transfer",
        },
        {
          externalId: "in",
          account: "savings",
          date: "2026-01-02",
          amount: "100",
          currency: "EUR",
          description: "Transfer",
        },
      ],
      preview: false,
    });
    const sources = (await commands.list_transactions.execute(owner, {})).rows;
    const booking = {
      date: "2026-01-01",
      description: "Transfer",
      sourceIds: sources.map((row) => row.id),
      postings: [
        { accountId: bank.id, amount: "-100" },
        { accountId: savings.id, amount: "100" },
      ],
    };
    await commands.save_booking.execute(owner, booking);
    expect((await commands.list_transactions.execute(owner, {})).total).toBe(0);
    await expect(commands.save_booking.execute(owner, booking)).rejects.toThrow(
      "already booked",
    );
    expect((await commands.list_bookings.execute(owner, {})).total).toBe(1);
    await commands.delete_transaction.execute(owner, { id: sources[0].id });
    expect((await commands.list_bookings.execute(owner, {})).total).toBe(0);
    expect((await commands.list_transactions.execute(owner, {})).total).toBe(1);
  });

  it("preserves source amounts and rejects stale booking edits", async () => {
    const bank = await commands.create_account.execute(owner, {
      name: "Bank",
      key: "bank",
      role: "bank",
    });
    const category = (await commands.overview.execute(owner, {})).accounts.find(
      (account) => account.key === "restaurants",
    )!;
    await commands.import_transactions.execute(owner, {
      rows: [
        {
          externalId: "one",
          account: "bank",
          date: "2026-01-01",
          amount: "-10",
          currency: "EUR",
          description: "Dinner",
        },
      ],
      preview: false,
    });
    const source = (await commands.list_transactions.execute(owner, {}))
      .rows[0];
    const input = {
      date: source.date,
      description: source.description,
      sourceIds: [source.id],
      postings: [
        { accountId: bank.id, amount: "-9" },
        { accountId: category.id, amount: "9" },
      ],
    };
    await expect(commands.save_booking.execute(owner, input)).rejects.toThrow(
      "preserve",
    );
    input.postings = [
      { accountId: bank.id, amount: "-10" },
      { accountId: category.id, amount: "10" },
    ];
    const entry = await commands.save_booking.execute(owner, input);
    const edited = await commands.save_booking.execute(owner, {
      ...input,
      id: entry.id,
      revision: 1,
      description: "Updated",
    });
    expect(edited.revision).toBe(2);
    await expect(
      commands.save_booking.execute(owner, {
        ...input,
        id: entry.id,
        revision: 1,
      }),
    ).rejects.toThrow("changed");
    await expect(
      commands.get_booking.execute(outsider, { id: entry.id }),
    ).rejects.toThrow("not found");
    await expect(
      db
        .update(transactions)
        .set({ amount: -900 })
        .where(
          and(eq(transactions.userId, owner), eq(transactions.id, source.id)),
        ),
    ).rejects.toThrow();
  });

  it("applies rule priority once and never rewrites manual or previously saved bookings", async () => {
    const bank = await commands.create_account.execute(owner, {
      name: "Bank",
      key: "bank",
      role: "bank",
    });
    const accounts = (await commands.overview.execute(owner, {})).accounts;
    const restaurant = accounts.find(
      (account) => account.key === "restaurants",
    )!;
    const shopping = accounts.find((account) => account.key === "shopping")!;
    const rule = await commands.save_rule.execute(owner, {
      name: "Dinner",
      priority: 1,
      conditions: { description: "DINNER", direction: "outgoing" },
      targetId: restaurant.id,
    });
    await commands.save_rule.execute(owner, {
      name: "Fallback",
      priority: 100,
      conditions: { direction: "outgoing" },
      targetId: shopping.id,
    });
    await commands.import_transactions.execute(owner, {
      rows: [
        {
          externalId: "one",
          account: "bank",
          date: "2026-01-01",
          amount: "-10",
          currency: "EUR",
          description: "Dinner",
        },
      ],
      preview: false,
    });
    expect((await commands.apply_rules.execute(owner, {})).matched).toBe(1);
    expect((await commands.list_bookings.execute(owner, {})).total).toBe(0);
    await Promise.all([
      commands.apply_rules.execute(owner, { preview: false }),
      commands.apply_rules.execute(owner, { preview: false }),
    ]);
    const saved = (await commands.list_bookings.execute(owner, {})).rows;
    expect(saved).toHaveLength(1);
    expect(
      saved[0].postings.find((posting) => posting.accountId === restaurant.id)
        ?.amount,
    ).toBe(1000);
    await commands.save_rule.execute(owner, {
      id: rule.id,
      name: "Changed",
      conditions: { direction: "outgoing" },
      targetId: shopping.id,
    });
    expect(
      (await commands.apply_rules.execute(owner, { preview: false })).booked,
    ).toBe(0);
    expect(
      (
        await commands.get_booking.execute(owner, { id: saved[0].id })
      ).postings.some((posting) => posting.accountId === restaurant.id),
    ).toBe(true);
    await expect(
      commands.delete_account.execute(owner, { id: bank.id }),
    ).rejects.toThrow("in use");
  });
});

describe("the import contract", () => {
  it("parses exact cents and quoted multiline CSV, rejecting ambiguous amounts and currencies", () => {
    expect(cents("0.29")).toBe(29);
    expect(cents("-1234.56")).toBe(-123456);
    expect(decimal(-1)).toBe("-0.01");
    expect(() => cents("1,234.56")).toThrow();
    expect(() => cents("1.001")).toThrow();
    const header =
      "id,account,date,amount,currency,description,counterparty,reference\n";
    expect(
      parseCsv(
        `${header}one,bank,2026-01-01,-10.29,EUR,"Dinner, with\na friend",Vapiano,`,
      )[0],
    ).toMatchObject({
      description: "Dinner, with\na friend",
      amount: "-10.29",
    });
    expect(() =>
      parseCsv(`${header}one,bank,2026-02-30,-10,EUR,Dinner,,`),
    ).toThrow();
    expect(() =>
      parseCsv(`${header}one,bank,2026-01-01,-10,USD,Dinner,,`),
    ).toThrow();
    expect(() => parseCsv("Date,Amount\n2026-01-01,10")).toThrow(
      "exact columns",
    );
  });
});
