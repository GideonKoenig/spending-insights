import { z } from "zod";

export const id = z.uuid();
export const date = z.iso.date();
export const name = z.string().trim().min(1).max(120);
export const money = z
  .string()
  .regex(
    /^-?(0|[1-9]\d{0,9})(\.\d{1,2})?$/,
    "Use a decimal amount such as -12.50, without thousands separators.",
  );
export const accountKey = z
  .string()
  .regex(
    /^[a-z0-9][a-z0-9_-]{0,63}$/,
    "Use lowercase letters, numbers, underscores or hyphens.",
  );
export const conditions = z
  .object({
    accountId: id.optional(),
    description: z.string().trim().max(200).optional(),
    counterparty: z.string().trim().max(200).optional(),
    direction: z.enum(["all", "incoming", "outgoing"]).default("all"),
    minimum: z.number().int().min(0).max(1e12).optional(),
    maximum: z.number().int().min(0).max(1e12).optional(),
  })
  .refine(
    (value) =>
      value.minimum === undefined ||
      value.maximum === undefined ||
      value.minimum <= value.maximum,
    "Minimum exceeds maximum.",
  );

export const booking = z.object({
  id: id.optional(),
  revision: z.number().int().positive().optional(),
  date,
  description: z.string().trim().min(1).max(1000),
  sourceIds: z.array(id).max(100).default([]),
  postings: z
    .array(z.object({ accountId: id, amount: money }))
    .min(2)
    .max(100),
});

export const transaction = z.object({
  externalId: z.string().trim().min(1).max(200),
  account: accountKey,
  date,
  amount: money,
  currency: z.literal("EUR"),
  description: z.string().trim().min(1).max(1000),
  counterparty: z.string().trim().max(300).default(""),
  reference: z.string().trim().max(300).default(""),
});

export const page = z.object({
  offset: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(200).default(50),
  from: date.optional(),
  to: date.optional(),
  accountId: id.optional(),
  search: z.string().trim().max(200).default(""),
});

export type Booking = z.infer<typeof booking>;
export type ImportRow = z.infer<typeof transaction>;

export const categories = [
  { key: "restaurants", name: "Restaurants", kind: "expense" },
  { key: "groceries", name: "Groceries", kind: "expense" },
  { key: "housing", name: "Housing", kind: "expense" },
  { key: "utilities", name: "Utilities", kind: "expense" },
  { key: "transport", name: "Transport", kind: "expense" },
  { key: "insurance", name: "Insurance", kind: "expense" },
  { key: "health", name: "Health", kind: "expense" },
  { key: "shopping", name: "Shopping", kind: "expense" },
  { key: "entertainment", name: "Entertainment", kind: "expense" },
  { key: "travel", name: "Travel", kind: "expense" },
  { key: "education", name: "Education", kind: "expense" },
  { key: "gifts", name: "Gifts", kind: "expense" },
  { key: "fees", name: "Fees & taxes", kind: "expense" },
  { key: "other-expenses", name: "Other expenses", kind: "expense" },
  { key: "salary", name: "Salary", kind: "income" },
  { key: "interest", name: "Interest & dividends", kind: "income" },
  { key: "other-income", name: "Other income", kind: "income" },
] as const;

export const roleNames = {
  bank: "Bank account",
  cash: "Cash",
  investment: "Investment",
  debt: "Debt",
  receivable: "Owed to me",
  payable: "I owe",
  category: "Category",
  opening: "Opening balances",
} as const;

export const realRoles = {
  bank: true,
  cash: true,
  investment: true,
  debt: true,
  receivable: false,
  payable: false,
  category: false,
  opening: false,
} satisfies Record<keyof typeof roleNames, boolean>;

export function cents(value: string) {
  const valid = money.parse(value);
  const negative = valid.startsWith("-");
  const [whole, fraction = ""] = valid.replace("-", "").split(".");
  const amount = Number(BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0")));
  return negative ? -amount : amount;
}

export function decimal(value: number) {
  return `${value < 0 ? "-" : ""}${Math.floor(Math.abs(value) / 100)}.${String(Math.abs(value) % 100).padStart(2, "0")}`;
}
