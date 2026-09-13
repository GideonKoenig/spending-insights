import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { commands } from "./ledger/commands";
import { DomainError } from "./ledger/errors";
import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function createMcpServer(userId: string) {
  const server = new McpServer({ name: "spending-insights", version: "2.0.0" });
  for (const [name, operation] of Object.entries(commands)) {
    const schema: z.ZodObject = operation.schema;
    server.registerTool(
      name,
      {
        description: operation.description,
        inputSchema: schema,
        annotations: {
          readOnlyHint: operation.readOnly,
          destructiveHint: name.startsWith("delete_"),
          openWorldHint: false,
        },
      },
      async (input: unknown): Promise<CallToolResult> => {
        try {
          const result = await operation.execute(userId, input);
          return {
            content: [{ type: "text", text: JSON.stringify(result) }],
            structuredContent: { result },
          };
        } catch (error) {
          const message =
            error instanceof DomainError || error instanceof z.ZodError
              ? error.message
              : "The operation failed. No partial booking was saved.";
          return { content: [{ type: "text", text: message }], isError: true };
        }
      },
    );
  }
  return server;
}
