import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createHash, randomBytes } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import { GET, POST } from "@/app/api/mcp/route";
import { auth, devLoginEnabled } from "@/lib/auth";
import { db, pool } from "@/lib/db";
import { tokens, user } from "@/lib/db/schema";
import { csvTemplate } from "@/lib/ledger/csv";

const versions = ["2025-06-18", "2025-11-25", "2026-07-28"] as const;
type Version = (typeof versions)[number];
const endpoint = "http://localhost:3000/api/mcp";
const owner = {
  id: crypto.randomUUID(),
  token: `si_${randomBytes(32).toString("hex")}`,
};
const outsider = {
  id: crypto.randomUUID(),
  token: `si_${randomBytes(32).toString("hex")}`,
};
const clients: Client[] = [];

beforeAll(async () => {
  for (const identity of [owner, outsider]) {
    await db.insert(user).values({
      id: identity.id,
      name: "MCP test",
      email: `${identity.id}@test.invalid`,
    });
    await db.insert(tokens).values({
      userId: identity.id,
      name: "Test",
      prefix: identity.token.slice(0, 11),
      hash: createHash("sha256").update(identity.token).digest("hex"),
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
    });
  }
});

afterAll(async () => {
  await Promise.all(clients.map((client) => client.close()));
  await db.delete(user).where(inArray(user.id, [owner.id, outsider.id]));
  await pool.end();
});

describe.each(versions)("MCP %s over HTTP", (version) => {
  it("selects the protocol and exposes the shared operations", async () => {
    const { client, methods } = await connect(version);
    expect(client.getProtocolEra()).toBe(
      version === "2026-07-28" ? "modern" : "legacy",
    );
    expect(client.getServerVersion()?.name).toBe("spending-insights");
    expect(client.getServerCapabilities()?.tools?.listChanged).toBe(false);
    expect(methods[0]).toBe(
      version === "2026-07-28" ? "server/discover" : "initialize",
    );
    if (version === "2026-07-28") expect(methods).not.toContain("initialize");
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name)).toEqual(
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

  it("runs tools in the authenticated ledger and preserves validation and defaults", async () => {
    const { client } = await connect(version);
    const key = `bank-${version}`;
    expect(
      await client.callTool({
        name: "create_account",
        arguments: { name: "MCP bank", key, role: "bank" },
      }),
    ).toMatchObject({
      structuredContent: { result: { name: "MCP bank", userId: owner.id } },
    });
    expect(
      await client.callTool({
        name: "import_csv",
        arguments: {
          csv: `${csvTemplate}1,${key},2026-01-01,-10.00,EUR,Lunch,,\n`,
        },
      }),
    ).toMatchObject({
      structuredContent: { result: { preview: true, imported: 1 } },
    });
    expect(
      await client.callTool({
        name: "import_transactions",
        arguments: {
          preview: false,
          rows: [
            {
              externalId: "1",
              account: key,
              date: "2026-01-01",
              amount: "-10",
              currency: "USD",
              description: "Unsupported",
            },
          ],
        },
      }),
    ).toMatchObject({ isError: true });
    expect(
      await client.callTool({ name: "list_transactions", arguments: {} }),
    ).toMatchObject({
      structuredContent: { result: { total: 0 } },
    });
  });

  it("rejects missing, invalid, revoked and expired tokens", async () => {
    expect((await request(version, "tools/list", {}, "")).status).toBe(401);
    expect((await request(version, "tools/list", {}, "invalid")).status).toBe(
      401,
    );
    const token = `si_${randomBytes(32).toString("hex")}`;
    const hash = createHash("sha256").update(token).digest("hex");
    const record = {
      userId: owner.id,
      name: "Revocable",
      prefix: token.slice(0, 11),
      hash,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    };
    await db.insert(tokens).values(record);
    const accepted = await request(version, "tools/list", {}, token);
    expect(accepted.status).toBe(200);
    await accepted.text();
    await db.delete(tokens).where(eq(tokens.hash, hash));
    expect((await request(version, "tools/list", {}, token)).status).toBe(401);
    record.expiresAt = new Date(Date.now() - 1000).toISOString();
    await db.insert(tokens).values(record);
    expect((await request(version, "tools/list", {}, token)).status).toBe(401);
  });
});

it("keeps concurrent legacy and modern callers isolated", async () => {
  const [{ client: legacy }, { client: modern }] = await Promise.all([
    connect("2025-11-25"),
    connect("2026-07-28", outsider.token),
  ]);
  const [created] = await Promise.all([
    legacy.callTool({
      name: "create_account",
      arguments: { name: "Owner bank", key: "isolated-bank", role: "bank" },
    }),
    modern.callTool({
      name: "create_account",
      arguments: { name: "Other bank", key: "isolated-bank", role: "bank" },
    }),
  ]);
  const account = z
    .object({
      structuredContent: z.object({ result: z.object({ id: z.string() }) }),
    })
    .parse(created).structuredContent.result;
  expect(
    await modern.callTool({
      name: "delete_account",
      arguments: { id: account.id },
    }),
  ).toMatchObject({ isError: true });
  for (const [client, identity, other] of [
    [legacy, owner, outsider],
    [modern, outsider, owner],
  ] as const) {
    const result = await client.callTool({ name: "overview", arguments: {} });
    expect(result).toMatchObject({
      structuredContent: {
        result: {
          accounts: expect.arrayContaining([
            expect.objectContaining({
              key: "isolated-bank",
              userId: identity.id,
            }),
          ]),
        },
      },
    });
    expect(result).not.toMatchObject({
      structuredContent: {
        result: {
          accounts: expect.arrayContaining([
            expect.objectContaining({ userId: other.id }),
          ]),
        },
      },
    });
  }
});

it("rejects invalid origins, oversized bodies and malformed JSON before dispatch", async () => {
  const headers = {
    Authorization: `Bearer ${owner.token}`,
    "Content-Type": "application/json",
  };
  expect(
    (
      await POST(
        new Request(endpoint, {
          method: "POST",
          headers: {
            Authorization: headers.Authorization,
            "Content-Type": headers["Content-Type"],
            Origin: "https://untrusted.example",
          },
          body: "{}",
        }),
      )
    ).status,
  ).toBe(403);
  expect(
    (
      await POST(
        new Request(endpoint, {
          method: "POST",
          headers,
          body: "x".repeat(6_000_001),
        }),
      )
    ).status,
  ).toBe(413);
  expect(
    (
      await POST(
        new Request(endpoint, {
          method: "POST",
          headers,
          body: "{",
        }),
      )
    ).status,
  ).toBe(400);
});

it("rejects unsupported modern versions without silently using the legacy protocol", async () => {
  const response = await request("2099-01-01", "tools/list", {});
  expect(response.status).toBe(400);
  expect(await response.json()).toMatchObject({ error: { code: -32022 } });
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

async function connect(version: Version, token = owner.token) {
  const methods: string[] = [];
  const client = new Client(
    { name: "test", version: "1.0.0" },
    {
      versionNegotiation: {
        mode: version === "2026-07-28" ? "auto" : "legacy",
      },
      supportedProtocolVersions: [version],
    },
  );
  clients.push(client);
  await client.connect(
    new StreamableHTTPClientTransport(new URL(endpoint), {
      requestInit: { headers: { Authorization: `Bearer ${token}` } },
      fetch: async (url, init) => {
        const request = new Request(url, init);
        if (request.method !== "POST") return GET();
        const body = z
          .object({ method: z.string() })
          .parse(await request.clone().json());
        methods.push(body.method);
        const response = await POST(request);
        expect(response.headers.get("mcp-session-id")).toBeNull();
        return response;
      },
    }),
  );
  return { client, methods };
}

function request(
  version: string,
  method: string,
  params: Record<string, unknown>,
  token = owner.token,
) {
  const modern = version >= "2026-07-28";
  const headers = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    Origin: new URL(process.env.BETTER_AUTH_URL ?? endpoint).origin,
    "MCP-Protocol-Version": version,
  });
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (modern) headers.set("Mcp-Method", method);
  return POST(
    new Request(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method,
        params: modern
          ? {
              ...params,
              _meta: {
                "io.modelcontextprotocol/protocolVersion": version,
                "io.modelcontextprotocol/clientInfo": {
                  name: "test",
                  version: "1.0.0",
                },
                "io.modelcontextprotocol/clientCapabilities": {},
              },
            }
          : params,
      }),
    }),
  );
}
