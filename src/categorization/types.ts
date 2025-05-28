import { Transaction } from "@/readers/csv-reader.ts";

export type Pattern = {
    name: string;
    priority: number;
    matcher: (transaction: Transaction) => boolean;
    getDetails?: (transaction: Transaction) => string | undefined;
};
