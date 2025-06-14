import { type Transaction } from "@/lib/types";
import { z } from "zod";

export interface TransactionEnricher {
    id: string;
    description: string;
    matcher: (transaction: Transaction) => boolean;
    enrich: (transaction: Transaction) => Transaction;
}

export type Enrichment = z.infer<typeof EnrichmentSchema>;
export const EnrichmentSchema = z.object({
    enricherId: z.string(),
    data: z.record(z.unknown()),
});
