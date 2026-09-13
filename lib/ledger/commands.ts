import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { type Transaction } from "@/lib/db";
import { rules } from "@/lib/db/schema";
import { booking, date, id, money, name, page, transaction } from "./contracts";
import {
  createAccount,
  createPerson,
  deleteAccount,
  deletePerson,
  newAccount,
  updateAccount,
  updatePerson,
} from "./accounts";
import {
  deleteBooking,
  findMatches,
  getBooking,
  linkTransaction,
  saveBooking,
} from "./bookings";
import { inLedger } from "./core";
import { csvTemplate, parseCsv } from "./csv";
import {
  deleteTransaction,
  importTransactions,
  updateTransaction,
} from "./imports";
import {
  listBookings,
  listTransactions,
  overview,
  reports,
  transactionFilter,
} from "./queries";
import { applyRules, ruleInput, saveRule } from "./rules";
import { DomainError } from "./errors";

export type Command = keyof typeof commands;
export type Input<Key extends Command> = z.input<
  (typeof commands)[Key]["schema"]
>;
export type Output<Key extends Command> = Awaited<
  ReturnType<(typeof commands)[Key]["execute"]>
>;

// This registry is the shared contract for the browser API and MCP tools.
export const commands = {
  overview: command(
    "List all accounts and balances, people, booking rules and the unbooked count. All money is integer EUR cents.",
    z.object({}),
    overview,
    true,
  ),
  create_account: command(
    "Create a bank, cash, investment or debt account, or a child of a fixed income/expense category. A positive debt openingBalance means money owed.",
    newAccount,
    createAccount,
  ),
  update_account: command(
    "Rename or archive an account. Account keys and types remain stable.",
    z.object({
      id,
      name,
      archived: z.boolean(),
      bankName: z.string().max(120).optional(),
    }),
    updateAccount,
  ),
  delete_account: command(
    "Delete an unused account. Archive accounts with transactions or bookings instead.",
    z.object({ id }),
    (tx, userId, input) => deleteAccount(tx, userId, input.id),
  ),
  create_person: command(
    "Create a person and their receivable and payable accounts.",
    z.object({ name }),
    (tx, userId, input) => createPerson(tx, userId, input.name),
  ),
  update_person: command(
    "Rename or archive a person and their associated accounts.",
    z.object({ id, name, archived: z.boolean() }),
    updatePerson,
  ),
  delete_person: command(
    "Delete a person whose generated accounts are unused.",
    z.object({ id }),
    (tx, userId, input) => deletePerson(tx, userId, input.id),
  ),
  import_template: command(
    "Get the only supported CSV format. IDs are stable within each account. Dates YYYY-MM-DD; amount is a signed decimal in EUR. Positive debits increase assets or reduce liabilities. Negative credits reduce assets or increase liabilities.",
    z.object({}),
    async () => ({
      csv: csvTemplate,
      example:
        "bank-001,checking,2026-09-01,-42.50,EUR,Dinner,Vapiano,receipt-001",
      accountFormat: "Use account keys from overview.",
    }),
    true,
  ),
  import_csv: command(
    "Validate and preview a CSV, or save it to the unbooked inbox with preview=false. Identical IDs are skipped; conflicting IDs reject the whole import. Imports do not change reports until booked.",
    z.object({
      csv: z.string().max(5_000_000),
      preview: z.boolean().default(true),
    }),
    (tx, userId, input) =>
      importTransactions(tx, userId, parseCsv(input.csv), input.preview),
  ),
  import_transactions: command(
    "Import structured transactions using the same contract as CSV. Preview defaults to true. Stable externalId values prevent duplicate imports.",
    z.object({
      rows: z.array(transaction).min(1).max(10_000),
      preview: z.boolean().default(true),
    }),
    (tx, userId, input) =>
      importTransactions(tx, userId, input.rows, input.preview),
  ),
  list_transactions: command(
    "Search and paginate imported transactions. Default status is unbooked. Amounts in the response are signed integer EUR cents.",
    transactionFilter,
    listTransactions,
    true,
  ),
  update_transaction: command(
    "Edit an unbooked transaction. Unbook first if it already has a booking.",
    z.object({
      id,
      date,
      amount: money,
      description: z.string().trim().min(1).max(1000),
      counterparty: z.string().max(300),
      reference: z.string().max(300),
    }),
    updateTransaction,
  ),
  delete_transaction: command(
    "Delete one imported transaction and its entire associated booking, if any. Other transactions linked to that booking return to the unbooked inbox.",
    z.object({ id }),
    (tx, userId, input) => deleteTransaction(tx, userId, input.id),
  ),
  list_bookings: command(
    "Search and paginate saved journal entries and their postings. Amounts in the response are signed integer EUR cents.",
    page,
    listBookings,
    true,
  ),
  get_booking: command(
    "Get a journal entry, revision, postings and linked imported transactions.",
    z.object({ id }),
    (tx, userId, input) => getBooking(tx, userId, input.id),
    true,
  ),
  find_matches: command(
    "Find existing bookings with the same account and exact amount within seven days of an unbooked imported transaction. Useful when the other side of a transfer was booked earlier.",
    z.object({ transactionId: id }),
    (tx, userId, input) => findMatches(tx, userId, input.transactionId),
    true,
  ),
  link_transaction: command(
    "Attach an imported transaction to an existing booking without adding any money movement. Use the booking's current revision. Its posting must match the imported amount.",
    z.object({
      transactionId: id,
      entryId: id,
      revision: z.number().int().positive(),
    }),
    linkTransaction,
  ),
  save_booking: command(
    "Create or edit a balanced booking. Amounts are decimal EUR strings; positive=debit, negative=credit. Include both sourceIds when matching imported sides of a transfer. Preserve imported amounts per account. To edit, supply id and current revision. Manual bookings may omit sourceIds.",
    booking,
    saveBooking,
  ),
  delete_booking: command(
    "Delete a whole booking using its current revision. Linked imported transactions return to the unbooked inbox.",
    z.object({ id, revision: z.number().int().positive() }),
    (tx, userId, input) => deleteBooking(tx, userId, input.id, input.revision),
  ),
  save_rule: command(
    "Create or edit a booking rule. Conditions are ANDed; text matches ignore case. Min/max use absolute integer EUR cents. Lower priorities run first; the first match wins. Rules never change existing bookings.",
    ruleInput,
    saveRule,
  ),
  delete_rule: command(
    "Delete a rule. Existing bookings remain unchanged.",
    z.object({ id }),
    async (tx, userId, input) => {
      const [rule] = await tx
        .delete(rules)
        .where(and(eq(rules.userId, userId), eq(rules.id, input.id)))
        .returning();
      if (!rule) throw new DomainError("Rule not found.", 404);
      return { id: rule.id };
    },
  ),
  apply_rules: command(
    "Preview or apply rules to unbooked transactions. Defaults to preview=true. Transfers between real-world accounts are flagged for explicit matching, to prevent double booking.",
    z.object({
      preview: z.boolean().default(true),
      transactionIds: z.array(id).min(1).max(10_000).optional(),
    }),
    applyRules,
  ),
  reports: command(
    "Get income, expenses, category breakdowns, bank cash flow and recorded net worth for a date range, plus the previous equal-length period. All amounts are integer EUR cents. Unbooked imports are excluded.",
    z.object({
      from: date,
      to: date,
      granularity: z.enum(["month", "quarter", "year"]).default("month"),
    }),
    reports,
    true,
  ),
};

function command<Schema extends z.ZodObject, Result>(
  description: string,
  schema: Schema,
  run: (
    tx: Transaction,
    userId: string,
    input: z.output<Schema>,
  ) => Promise<Result>,
  readOnly = false,
) {
  return {
    description,
    schema,
    readOnly,
    execute: (userId: string, input: unknown) =>
      inLedger(userId, (tx) => run(tx, userId, schema.parse(input))),
  };
}
