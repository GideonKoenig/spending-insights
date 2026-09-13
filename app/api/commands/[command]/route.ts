import { commands } from "@/lib/ledger/commands";
import { authenticate, errorResponse, readJson } from "@/lib/http";

export async function POST(
  request: Request,
  context: { params: Promise<{ command: string }> },
) {
  try {
    const userId = await authenticate(request);
    const { command } = await context.params;
    if (!Object.hasOwn(commands, command))
      return Response.json({ error: "Unknown operation." }, { status: 404 });
    const operation = commands[command as keyof typeof commands];
    return Response.json(
      await operation.execute(userId, await readJson(request)),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
