import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { authenticate, errorResponse, readJson } from "@/lib/http";
import { createMcpServer } from "@/lib/mcp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const userId = await authenticate(request);
    const body = await readJson(request);
    const server = createMcpServer(userId);
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    await server.connect(transport);
    try {
      return await transport.handleRequest(request, { parsedBody: body });
    } finally {
      await server.close();
    }
  } catch (error) {
    return errorResponse(error);
  }
}

export function GET() {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}

export const DELETE = GET;
