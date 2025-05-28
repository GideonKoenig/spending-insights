import { RawBankTransaction } from "../../readers/csv-reader.ts";
import { CategoryPattern } from "../types.ts";

export abstract class BasePattern implements CategoryPattern {
    abstract name: string;
    abstract category: string;
    abstract priority: number;
    abstract match(transaction: RawBankTransaction): boolean;
}

export class ParticipantContainsPattern extends BasePattern {
    constructor(
        public name: string,
        public category: string,
        public priority: number,
        private keywords: string[]
    ) {
        super();
    }

    match(transaction: RawBankTransaction): boolean {
        const participant = transaction.paymentParticipant.toLowerCase();
        return this.keywords.some((keyword) =>
            participant.includes(keyword.toLowerCase())
        );
    }
}

export class PurposeContainsPattern extends BasePattern {
    constructor(
        public name: string,
        public category: string,
        public priority: number,
        private keywords: string[]
    ) {
        super();
    }

    match(transaction: RawBankTransaction): boolean {
        const purpose = transaction.purpose.toLowerCase();
        return this.keywords.some((keyword) =>
            purpose.includes(keyword.toLowerCase())
        );
    }
}

export class AmountRangePattern extends BasePattern {
    constructor(
        public name: string,
        public category: string,
        public priority: number,
        private minAmount?: number,
        private maxAmount?: number
    ) {
        super();
    }

    match(transaction: RawBankTransaction): boolean {
        const amount = Math.abs(transaction.amount);
        const minCheck =
            this.minAmount === undefined || amount >= this.minAmount;
        const maxCheck =
            this.maxAmount === undefined || amount <= this.maxAmount;
        return minCheck && maxCheck;
    }
}

export class PositiveAmountPattern extends BasePattern {
    constructor(
        public name: string,
        public category: string,
        public priority: number
    ) {
        super();
    }

    match(transaction: RawBankTransaction): boolean {
        return transaction.amount > 0;
    }
}

export class CombinedPattern extends BasePattern {
    constructor(
        public name: string,
        public category: string,
        public priority: number,
        private patterns: BasePattern[],
        private operator: "AND" | "OR" = "AND"
    ) {
        super();
    }

    match(transaction: RawBankTransaction): boolean {
        if (this.operator === "AND") {
            return this.patterns.every((pattern) => pattern.match(transaction));
        } else {
            return this.patterns.some((pattern) => pattern.match(transaction));
        }
    }
}
