import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { POST } from "@/app/api/mcp/route";
import { auth, devLoginEnabled } from "@/lib/auth";
import { db, pool } from "@/lib/db";
import { tokens, user } from "@/lib/db/schema";

const owner = crypto.randomUUID();
const token = `si_${randomBytes(32).toString("hex")}`;

beforeAll(async () => {
  await db
    .insert(user)
    .values({ id: owner, name: "MCP test", email: `${owner}@test.invalid` });
  await db.insert(tokens).values({
    userId: owner,
    name: "Test",
    prefix: token.slice(0, 11),
    hash: createHash("sha256").update(token).digest("hex"),
    expiresAt: new Date(Date.now() + 60000).toISOString(),
  });
});
afterAll(async () => {
  await db.delete(user).where(eq(user.id, owner));
  await pool.end();
});

function request(method: string, params: unknown, bearer = token) {
  return POST(
    new Request("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    }),
  );
}

describe("MCP over HTTP", () => {
  it("initializes and exposes the shared operations", async () => {
    const initialize = await request("initialize", {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "test", version: "1.0.0" },
    });
    expect(initialize.status).toBe(200);
    expect(await initialize.json()).toMatchObject({
      result: { serverInfo: { name: "spending-insights" } },
    });
    const list = await request("tools/list", {});
    const body = z
      .object({
        result: z.object({ tools: z.array(z.object({ name: z.string() })) }),
      })
      .parse(await list.json());
    expect(body.result.tools.map((tool) => tool.name)).toEqual(
      expect.arrayContaining([
        "create_account",
        "create_person",
        "import_csv",
        "save_booking",
        "delete_transaction",
        "save_rule",
        "reports",
      ]),
    );
  });

  it("uses the authenticated ledger and returns structured validation errors", async () => {
    const created = await request("tools/call", {
      name: "create_account",
      arguments: { name: "MCP bank", key: "mcp-bank", role: "bank" },
    });
    expect(await created.json()).toMatchObject({
      result: {
        structuredContent: { result: { name: "MCP bank", userId: owner } },
      },
    });
    const invalid = await request("tools/call", {
      name: "import_transactions",
      arguments: {
        preview: false,
        rows: [
          {
            externalId: "1",
            account: "mcp-bank",
            date: "2026-01-01",
            amount: "-10",
            currency: "USD",
            description: "Unsupported",
          },
        ],
      },
    });
    expect(await invalid.json()).toMatchObject({ result: { isError: true } });
    const listing = await request("tools/call", {
      name: "list_transactions",
      arguments: {},
    });
    expect(await listing.json()).toMatchObject({
      result: { structuredContent: { result: { total: 0 } } },
    });
  });

  it("rejects invalid and revoked tokens", async () => {
    expect((await request("tools/list", {}, "invalid")).status).toBe(401);
    await db.delete(tokens).where(eq(tokens.userId, owner));
    expect((await request("tools/list", {})).status).toBe(401);
  });

  it("does not enable the development endpoint outside development mode", async () => {
    expect(devLoginEnabled).toBe(false);
    const response = await auth.handler(
      new Request("http://localhost:3000/api/auth/dev-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: "{}",
      }),
    );
    expect(response.status).toBe(404);
  });
});
