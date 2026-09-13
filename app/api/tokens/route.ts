import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { tokens } from "@/lib/db/schema";
import { authenticate, errorResponse, readJson } from "@/lib/http";
import { id, name } from "@/lib/ledger/contracts";

export async function GET(request: Request) {
  try {
    const userId = await authenticate(request, false);
    return Response.json(
      await db
        .select({
          id: tokens.id,
          name: tokens.name,
          prefix: tokens.prefix,
          createdAt: tokens.createdAt,
          expiresAt: tokens.expiresAt,
        })
        .from(tokens)
        .where(eq(tokens.userId, userId))
        .orderBy(desc(tokens.createdAt)),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await authenticate(request, false);
    const input = z.object({ name }).parse(await readJson(request));
    const value = `si_${randomBytes(32).toString("hex")}`;
    const [token] = await db
      .insert(tokens)
      .values({
        userId,
        name: input.name,
        hash: createHash("sha256").update(value).digest("hex"),
        prefix: value.slice(0, 11),
        expiresAt: new Date(Date.now() + 365 * 86_400_000).toISOString(),
      })
      .returning({ id: tokens.id });
    return Response.json(
      { id: token.id, token: value },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await authenticate(request, false);
    const input = z.object({ id }).parse(await readJson(request));
    await db
      .delete(tokens)
      .where(and(eq(tokens.userId, userId), eq(tokens.id, input.id)));
    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
