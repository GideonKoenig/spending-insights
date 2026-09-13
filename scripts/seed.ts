import { config } from "dotenv";
import { and, eq } from "drizzle-orm";

config({ path: ".env.local", quiet: true });
if (
  process.env.NODE_ENV === "production" ||
  process.env.ENABLE_DEV_LOGIN !== "true" ||
  !["localhost", "127.0.0.1"].includes(
    new URL(process.env.DATABASE_URL!).hostname,
  )
)
  throw new Error(
    "Sample data can only be loaded into a local development database.",
  );

const { db, pool } = await import("../lib/db");
const { ledgerAccounts, user } = await import("../lib/db/schema");
const { inLedger } = await import("../lib/ledger/core");
const { createAccount, createPerson } = await import("../lib/ledger/accounts");
const { saveBooking } = await import("../lib/ledger/bookings");
const { importTransactions } = await import("../lib/ledger/imports");
const { applyRules, saveRule } = await import("../lib/ledger/rules");
const { decimal } = await import("../lib/ledger/contracts");

const owner = "local-developer";
try {
  await db
    .insert(user)
    .values({
      id: owner,
      name: "Gideon (local)",
      email: "developer@localhost",
      emailVerified: true,
    })
    .onConflictDoNothing();
  await inLedger(owner, async (tx) => {
    const accounts = await tx
      .select()
      .from(ledgerAccounts)
      .where(eq(ledgerAccounts.userId, owner));
    if (accounts.some((account) => !account.system)) {
      console.log("Local ledger already has data; sample data skipped.");
      return;
    }
    const year = new Date().getFullYear();
    const openingDate = `${year}-01-01`;
    const bank = await createAccount(tx, owner, {
      name: "Everyday account",
      key: "checking",
      bankName: "Sample bank",
      role: "bank",
      openingBalance: "5200",
      openingDate,
    });
    const savings = await createAccount(tx, owner, {
      name: "Savings",
      key: "savings",
      bankName: "Sample bank",
      role: "bank",
      openingBalance: "8000",
      openingDate,
    });
    const investment = await createAccount(tx, owner, {
      name: "Investment portfolio",
      key: "investments",
      role: "investment",
      openingBalance: "12500",
      openingDate,
    });
    await createAccount(tx, owner, {
      name: "Personal loan",
      key: "loan",
      role: "debt",
      openingBalance: "1800",
      openingDate,
    });
    const person = await createPerson(tx, owner, "Alex");
    const restaurant = accounts.find(
      (account) => account.key === "restaurants",
    )!;
    const vapiano = await createAccount(tx, owner, {
      name: "Vapiano",
      key: "vapiano",
      role: "category",
      parentId: restaurant.id,
      openingBalance: "0",
    });
    const recurring = [
      {
        key: "salary",
        name: "Monthly salary",
        amount: 385000,
        counterparty: "Employer",
      },
      {
        key: "housing",
        name: "Rent",
        amount: -110000,
        counterparty: "Property management",
      },
      {
        key: "groceries",
        name: "Groceries",
        amount: -32500,
        counterparty: "Supermarket",
      },
      {
        key: "utilities",
        name: "Utilities",
        amount: -12600,
        counterparty: "Energy provider",
      },
      {
        key: "transport",
        name: "Public transport",
        amount: -6300,
        counterparty: "Transit",
      },
      {
        key: "entertainment",
        name: "Subscriptions",
        amount: -3400,
        counterparty: "Streaming",
      },
    ];
    for (const item of recurring)
      await saveRule(tx, owner, {
        name: item.name,
        priority: 100,
        enabled: true,
        targetId: accounts.find((account) => account.key === item.key)!.id,
        conditions: { counterparty: item.counterparty, direction: "all" },
      });
    await saveRule(tx, owner, {
      name: "Vapiano",
      priority: 10,
      enabled: true,
      targetId: vapiano.id,
      conditions: { counterparty: "Vapiano", direction: "all" },
    });
    const months = new Date().getMonth() + 1;
    for (let month = 1; month <= months; month++) {
      const date = `${year}-${String(month).padStart(2, "0")}-01`;
      const rows = recurring.map((item) => ({
        externalId: `sample-${month}-${item.key}`,
        account: "checking",
        date,
        amount: decimal(
          item.amount + (item.key === "groceries" ? month * -750 : 0),
        ),
        currency: "EUR" as const,
        description: item.name,
        counterparty: item.counterparty,
        reference: "Sample data",
      }));
      rows.push({
        externalId: `sample-${month}-dinner`,
        account: "checking",
        date,
        amount: decimal(-5200 - month * 430),
        currency: "EUR",
        description: "Dinner at Vapiano",
        counterparty: "Vapiano",
        reference: "Sample data",
      });
      await importTransactions(tx, owner, rows, false);
      for (const target of [savings, investment])
        await saveBooking(tx, owner, {
          date,
          description:
            target.id === savings.id
              ? "Monthly savings"
              : "Investment contribution",
          sourceIds: [],
          postings: [
            { accountId: bank.id, amount: "-350" },
            { accountId: target.id, amount: "350" },
          ],
        });
    }
    await applyRules(tx, owner, { preview: false });
    const [receivable] = await tx
      .select()
      .from(ledgerAccounts)
      .where(
        and(
          eq(ledgerAccounts.personId, person.id),
          eq(ledgerAccounts.role, "receivable"),
        ),
      );
    await saveBooking(tx, owner, {
      date: `${year}-01-15`,
      description: "Concert tickets for Alex",
      sourceIds: [],
      postings: [
        { accountId: bank.id, amount: "-85" },
        { accountId: receivable.id, amount: "85" },
      ],
    });
    await importTransactions(
      tx,
      owner,
      [
        {
          externalId: "sample-inbox-1",
          account: "checking",
          date: `${year}-${String(months).padStart(2, "0")}-02`,
          amount: "-74.50",
          currency: "EUR",
          description: "Bike repair",
          counterparty: "Local bike shop",
          reference: "Sample data",
        },
        {
          externalId: "sample-inbox-2",
          account: "checking",
          date: `${year}-${String(months).padStart(2, "0")}-03`,
          amount: "85",
          currency: "EUR",
          description: "Concert tickets repayment",
          counterparty: "Alex",
          reference: "Sample data",
        },
      ],
      false,
    );
    console.log(
      "Fictional sample data added to the local development account.",
    );
  });
} finally {
  await pool.end();
}
