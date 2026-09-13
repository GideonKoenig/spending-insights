"use client";

import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, KeyRound, Plus } from "lucide-react";
import { Actions } from "./ui/actions";
import {
  Button,
  ScrollArea,
  Empty,
  ErrorMessage,
  Field,
  Input,
  Modal,
  Loading,
  PageHeader,
} from "./ui/controls";

type Token = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  expiresAt: string;
};

export function Settings({ endpoint }: { endpoint: string }) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["tokens"],
    queryFn: async (): Promise<Token[]> => {
      const response = await fetch("/api/tokens");
      if (!response.ok) throw new Error("Could not load API keys.");
      return response.json();
    },
  });
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("Local agent");
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<Error | null>(null);
  const create = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const result: { token?: string; error?: string } = await response.json();
      if (!response.ok || !result.token)
        throw new Error(result.error ?? "Could not create token.");
      return result.token;
    },
    onSuccess: (value) => {
      setToken(value);
      setCreating(false);
      void client.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch("/api/tokens", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Could not revoke token.");
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["tokens"] }),
  });
  return (
    <>
      <PageHeader title="Agent access">
        <Button
          variant="primary"
          onClick={() => {
            setCreating(true);
            create.reset();
          }}
        >
          <Plus className="size-4" />
          Create API key
        </Button>
      </PageHeader>
      <div className="panel mb-6 p-6">
        <div className="mb-4 flex items-center gap-3">
          <KeyRound className="size-5 text-primary" />
          <h2 className="font-medium">MCP connection</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Connect your agent using Streamable HTTP and an Authorization header.
          API keys allow it to read and change your ledger, including deleting
          transactions.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Server URL">
            <Input readOnly value={endpoint} />
          </Field>
          <Field label="Header">
            <Input readOnly value="Authorization: Bearer YOUR_TOKEN" />
          </Field>
        </div>
      </div>
      <ErrorMessage error={query.error ?? remove.error} />
      {query.isPending ? (
        <Loading />
      ) : query.error ? null : query.data?.length === 0 ? (
        <Empty>No active API keys.</Empty>
      ) : (
        <ScrollArea className="table-panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>API key</th>
                <th>Created</th>
                <th>Expires</th>
                <th>
                  <span className="sr-only">Revoke</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {query.data?.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.name}
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {item.prefix}…
                    </p>
                  </td>
                  <td className="text-muted-foreground">
                    {item.createdAt.slice(0, 10)}
                  </td>
                  <td className="text-muted-foreground">
                    {item.expiresAt.slice(0, 10)}
                  </td>
                  <td className="text-right">
                    <Actions
                      name={item.name}
                      onDelete={() => remove.mutate(item.id)}
                      pending={remove.isPending}
                      deleteLabel="Revoke"
                      description="Clients using this API key will lose access to your ledger."
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      )}
      {creating && (
        <Modal title="Create API key" onClose={() => setCreating(false)}>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              create.mutate();
            }}
          >
            <Field label="Name">
              <Input
                required
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            <ErrorMessage error={create.error} />
            <Button type="submit" variant="primary" busy={create.isPending}>
              Create API key
            </Button>
          </form>
        </Modal>
      )}
      {token && (
        <Modal
          title="API key created"
          description="Copy this API key now. It is only shown once."
          onClose={() => {
            setToken(null);
            setCopied(false);
            setCopyError(null);
          }}
        >
          <Textarea
            aria-label="API key"
            readOnly
            className="input h-28 font-mono text-xs"
            value={token}
          />
          <ErrorMessage error={copyError} />
          <Button
            variant="primary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(token);
                setCopied(true);
              } catch {
                setCopyError(
                  new Error("Select and copy the API key manually."),
                );
              }
            }}
          >
            <Copy className="size-4" />
            {copied ? "Copied" : "Copy API key"}
          </Button>
        </Modal>
      )}
    </>
  );
}
