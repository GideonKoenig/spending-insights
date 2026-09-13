"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Command, Input, Output } from "./ledger/commands";

export type LedgerAccount = Output<"overview">["accounts"][number];
export type Source = Output<"list_transactions">["rows"][number];

export async function call<Key extends Command>(
  command: Key,
  input: Input<Key>,
): Promise<Output<Key>> {
  const response = await fetch(`/api/commands/${command}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const result: { error?: string } = await response.json();
    throw new Error(result.error ?? "Request failed.");
  }
  return response.json();
}

export function useCommand<Key extends Command>(
  command: Key,
  input: Input<Key>,
  enabled = true,
) {
  return useQuery({
    queryKey: ["ledger", command, input],
    queryFn: () => call(command, input),
    enabled,
    placeholderData: (previous, query) =>
      query?.queryKey[1] === command &&
      ["list_transactions", "list_bookings", "reports"].includes(command)
        ? previous
        : undefined,
  });
}

export function useAction<Key extends Command>(command: Key) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: Input<Key>) => call(command, input),
    onSuccess: () => client.invalidateQueries({ queryKey: ["ledger"] }),
  });
}
