import { parse } from "csv-parse/sync";
import { z } from "zod";
import { transaction, type ImportRow } from "./contracts";
import { DomainError } from "./errors";

export const csvColumns = [
  "id",
  "account",
  "date",
  "amount",
  "currency",
  "description",
  "counterparty",
  "reference",
];
export const csvTemplate = `${csvColumns.join(",")}\n`;

export function parseCsv(csv: string): ImportRow[] {
  if (Buffer.byteLength(csv, "utf8") > 5_000_000)
    throw new DomainError("CSV files must be smaller than 5 MB.");
  let parsed: unknown;
  try {
    parsed = parse(csv, {
      bom: true,
      skip_empty_lines: true,
      max_record_size: 10_000,
      columns: false,
    });
  } catch {
    throw new DomainError(
      "Invalid CSV. Use the template with commas and double-quoted fields.",
    );
  }
  const rows = z.array(z.array(z.string())).parse(parsed);
  const [header, ...data] = rows;
  if (!header || header.join(",") !== csvColumns.join(","))
    throw new DomainError(
      `Use these exact columns in order: ${csvColumns.join(", ")}.`,
    );
  if (data.length === 0 || data.length > 10_000)
    throw new DomainError(
      "Import between 1 and 10,000 transactions at a time.",
    );
  return data.map((row, index) => {
    const [
      externalId,
      account,
      date,
      amount,
      currency,
      description,
      counterparty,
      reference,
    ] = row;
    const result = transaction.safeParse({
      externalId,
      account,
      date,
      amount,
      currency,
      description,
      counterparty,
      reference,
    });
    if (!result.success)
      throw new DomainError(
        `Row ${index + 2}: ${result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`,
      );
    return result.data;
  });
}
