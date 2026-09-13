import { createMcpHandler } from "@modelcontextprotocol/server";
import { authenticate, errorResponse, readJson } from "@/lib/http";
import { DomainError } from "@/lib/ledger/errors";
import { createMcpServer } from "@/lib/mcp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    const expected = new URL(process.env.BETTER_AUTH_URL ?? request.url).origin;
    if (origin !== null && origin !== expected)
      throw new DomainError("Invalid request origin.", 403);
    const userId = await authenticate(request);
    const body = await readJson(request);
    const handler = createMcpHandler(() => createMcpServer(userId), {
      legacy: "stateless",
      maxSubscriptions: 0,
    });
    // The SDK closes each request's server when its response completes.
    return await handler.fetch(request, { parsedBody: body });
  } catch (error) {
    return errorResponse(error);
  }
}

export function GET() {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}

export const DELETE = GET;
