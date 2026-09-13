import { createHash } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { auth } from "./auth";
import { db } from "./db";
import { tokens } from "./db/schema";
import { DomainError } from "./ledger/errors";

export async function authenticate(request: Request, tokensAllowed = true) {
  const authorization = request.headers.get("authorization");
  if (authorization && tokensAllowed) {
    if (!authorization.startsWith("Bearer "))
      throw new DomainError("Invalid authorization header.", 401);
    const hash = createHash("sha256")
      .update(authorization.slice(7))
      .digest("hex");
    const [token] = await db
      .select({ userId: tokens.userId })
      .from(tokens)
      .where(
        and(
          eq(tokens.hash, hash),
          gt(tokens.expiresAt, new Date().toISOString()),
        ),
      );
    if (!token) throw new DomainError("Invalid or expired access token.", 401);
    return token.userId;
  }
  if (request.method !== "GET") {
    const expected = new URL(process.env.BETTER_AUTH_URL ?? request.url).origin;
    if (request.headers.get("origin") !== expected)
      throw new DomainError("Invalid request origin.", 403);
  }
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw new DomainError("Sign in to continue.", 401);
  return session.user.id;
}

export async function readJson(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new DomainError("Request body is required.");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    bytes += chunk.value.byteLength;
    if (bytes > 6_000_000) {
      await reader.cancel();
      throw new DomainError("Request exceeds 6 MB.", 413);
    }
    chunks.push(chunk.value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new DomainError("Invalid JSON request.");
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof DomainError)
    return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof z.ZodError)
    return Response.json(
      {
        error: error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; "),
      },
      { status: 400 },
    );
  console.error(
    "Request failed",
    error instanceof Error ? error.message : "Unknown error",
  );
  return Response.json(
    {
      error:
        "The operation could not be completed. No partial booking was saved.",
    },
    { status: 500 },
  );
}
