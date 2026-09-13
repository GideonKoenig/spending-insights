import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const user = pgTable("auth_user", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable(
  "auth_session",
  {
    id: text().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text().notNull().unique(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    ipAddress: text(),
    userAgent: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index().on(table.userId)],
);

export const account = pgTable(
  "auth_account",
  {
    id: text().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountId: text().notNull(),
    providerId: text().notNull(),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    password: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index().on(table.userId),
    unique().on(table.providerId, table.accountId),
  ],
);

export const verification = pgTable(
  "auth_verification",
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index().on(table.identifier)],
);

export const kind = pgEnum("account_kind", [
  "asset",
  "liability",
  "income",
  "expense",
  "equity",
]);
export const role = pgEnum("account_role", [
  "bank",
  "cash",
  "investment",
  "debt",
  "receivable",
  "payable",
  "category",
  "opening",
]);

export const people = pgTable(
  "people",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text().notNull(),
    archived: boolean().notNull().default(false),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique().on(table.userId, table.id)],
);

export const ledgerAccounts = pgTable(
  "ledger_accounts",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    key: text().notNull(),
    name: text().notNull(),
    kind: kind().notNull(),
    role: role().notNull(),
    parentId: uuid(),
    personId: uuid(),
    bankName: text(),
    system: boolean().notNull().default(false),
    archived: boolean().notNull().default(false),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique().on(table.userId, table.id),
    unique().on(table.userId, table.key),
    foreignKey({
      columns: [table.userId, table.parentId],
      foreignColumns: [table.userId, table.id],
    }),
    foreignKey({
      columns: [table.userId, table.personId],
      foreignColumns: [people.userId, people.id],
    }),
    check(
      "account_role_kind",
      sql`(${table.role} in ('bank', 'cash', 'investment', 'receivable') and ${table.kind} = 'asset') or (${table.role} in ('debt', 'payable') and ${table.kind} = 'liability') or (${table.role} = 'category' and ${table.kind} in ('income', 'expense')) or (${table.role} = 'opening' and ${table.kind} = 'equity')`,
    ),
  ],
);

export type RuleConditions = {
  accountId?: string;
  description?: string;
  counterparty?: string;
  direction: "all" | "incoming" | "outgoing";
  minimum?: number;
  maximum?: number;
};

export const rules = pgTable(
  "booking_rules",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text().notNull(),
    priority: integer().notNull().default(100),
    enabled: boolean().notNull().default(true),
    conditions: jsonb().$type<RuleConditions>().notNull(),
    targetId: uuid().notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique().on(table.userId, table.id),
    foreignKey({
      columns: [table.userId, table.targetId],
      foreignColumns: [ledgerAccounts.userId, ledgerAccounts.id],
    }),
  ],
);

export const entries = pgTable(
  "journal_entries",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date().notNull(),
    description: text().notNull(),
    origin: text({ enum: ["manual", "import", "rule", "opening"] }).notNull(),
    ruleId: uuid().references(() => rules.id, { onDelete: "set null" }),
    revision: integer().notNull().default(1),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique().on(table.userId, table.id),
    index().on(table.userId, table.date),
  ],
);

export const postings = pgTable(
  "postings",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text().notNull(),
    entryId: uuid().notNull(),
    accountId: uuid().notNull(),
    // Positive = debit, negative = credit. All money is stored as integer EUR cents.
    amount: bigint({ mode: "number" }).notNull(),
  },
  (table) => [
    index().on(table.userId, table.accountId),
    index().on(table.entryId),
    foreignKey({
      columns: [table.userId, table.entryId],
      foreignColumns: [entries.userId, entries.id],
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId, table.accountId],
      foreignColumns: [ledgerAccounts.userId, ledgerAccounts.id],
    }),
    check(
      "posting_amount",
      sql`${table.amount} != 0 and abs(${table.amount}) <= 1000000000000`,
    ),
  ],
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountId: uuid().notNull(),
    externalId: text().notNull(),
    date: date().notNull(),
    amount: bigint({ mode: "number" }).notNull(),
    description: text().notNull(),
    counterparty: text().notNull().default(""),
    reference: text().notNull().default(""),
    entryId: uuid(),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique().on(table.userId, table.accountId, table.externalId),
    index().on(table.userId, table.date),
    index().on(table.userId, table.entryId),
    foreignKey({
      columns: [table.userId, table.accountId],
      foreignColumns: [ledgerAccounts.userId, ledgerAccounts.id],
    }),
    foreignKey({
      columns: [table.userId, table.entryId],
      foreignColumns: [entries.userId, entries.id],
    }),
    check(
      "transaction_amount",
      sql`${table.amount} != 0 and abs(${table.amount}) <= 1000000000000`,
    ),
  ],
);

export const tokens = pgTable("api_tokens", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text().notNull(),
  hash: text().notNull().unique(),
  prefix: text().notNull(),
  createdAt: timestamp({ withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp({ withTimezone: true, mode: "string" }).notNull(),
});
