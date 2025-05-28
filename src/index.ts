export { CsvReader, type RawBankTransaction } from "./readers/csv-reader.ts";
export { TransactionCategorizer } from "./categorization/categorizer.ts";
export { PatternRegistry } from "./categorization/pattern-registry.ts";
export {
    type CategoryPattern,
    type CategoryMatch,
} from "./categorization/types.ts";
export {
    BasePattern,
    ParticipantContainsPattern,
    PurposeContainsPattern,
    AmountRangePattern,
    PositiveAmountPattern,
    CombinedPattern,
} from "./categorization/patterns/base-patterns.ts";
