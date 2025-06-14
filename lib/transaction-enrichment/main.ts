import { type Transaction } from "@/lib/types";
import { type TransactionEnricher } from "./types";
import { paypalEnricher } from "./enrichers/paypal";
import { type Account } from "@/lib/types";

const ENRICHERS: TransactionEnricher[] = [paypalEnricher];

export function enrichTransaction(transaction: Transaction): Transaction {
    let enrichedTransaction = transaction;

    for (const enricher of ENRICHERS) {
        if (enricher.matcher(enrichedTransaction)) {
            enrichedTransaction = enricher.enrich(enrichedTransaction);
            break;
        }
    }

    return enrichedTransaction;
}

export function enrichTransactions(transactions: Transaction[]): Transaction[] {
    return transactions.map(enrichTransaction);
}

function enrichAccount(account: Account): Account {
    return {
        ...account,
        transactions: enrichTransactions(account.transactions),
    };
}

export const enricher = {
    enrichAccount,
};
