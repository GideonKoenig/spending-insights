import { RawBankTransaction } from "../readers/csv-reader.ts";

export interface CategoryMatch {
    category: string;
    confidence: number;
    matchedRule: string;
}

export interface CategoryPattern {
    name: string;
    category: string;
    priority: number;
    match(transaction: RawBankTransaction): boolean;
}

export class UnknownCategoryPattern implements CategoryPattern {
    name = "Unknown";
    category = "Unknown";
    priority = 0;

    match(_transaction: RawBankTransaction): boolean {
        return true;
    }
}
