# Bank History Parser

A modular TypeScript/Deno system for parsing and categorizing German bank CSV files using a pattern-based approach.

## Quick Start

```bash
# Run the main application
deno task run

# For development with watch mode
deno task dev
```

## Features

- 📊 Parse German bank CSV files with automatic data type conversion
- 🏷️ Automatic transaction categorization using extensible patterns
- 📅 Date range analysis and statistics
- 💰 Income/expense tracking and summaries
- 🔍 Modular pattern system for easy customization

## Directory Structure

```
src/
├── main.ts                     # Main application
├── index.ts                    # Main exports
├── readers/
│   └── csv-reader.ts           # Raw CSV parsing
├── categorization/
│   ├── types.ts                # Base interfaces
│   ├── categorizer.ts          # Main categorization engine
│   ├── pattern-registry.ts     # Central pattern collection
│   └── patterns/               # Individual pattern files
│       ├── base-patterns.ts    # Base pattern classes
│       ├── grocery-patterns.ts # Supermarket patterns
│       ├── food-patterns.ts    # Restaurant/fast food patterns
│       ├── shopping-patterns.ts # Retail/online shopping patterns
│       ├── financial-patterns.ts # Banking/salary/utilities patterns
│       ├── health-patterns.ts  # Pharmacy/medical patterns
│       └── transport-patterns.ts # Transport patterns
data/
└── bank-history.csv            # Your CSV file goes here
```

## Usage

### Basic CSV Reading

```typescript
import { CsvReader } from "./src/index.ts";

const transactions = await CsvReader.readFromFile("./data/bank-history.csv");
console.log(`Read ${transactions.length} transactions`);
```

### Transaction Categorization

```typescript
import { TransactionCategorizer, PatternRegistry } from "./src/index.ts";

const patterns = PatternRegistry.getAllPatterns();
const categorizer = new TransactionCategorizer(patterns);
const categorizedTransactions = categorizer.categorizeAll(transactions);
```

### Creating Custom Patterns

```typescript
import { ParticipantContainsPattern } from "./src/index.ts";

const myPattern = new ParticipantContainsPattern(
  "My Custom Store",
  "Shopping", 
  100,
  ["my-store", "custom-shop"]
);

categorizer.addPattern(myPattern);
```

## Pattern Types

- **ParticipantContainsPattern**: Match by payment participant name
- **PurposeContainsPattern**: Match by transaction purpose
- **AmountRangePattern**: Match by transaction amount range
- **PositiveAmountPattern**: Match positive amounts (income)
- **CombinedPattern**: Combine patterns with AND/OR logic

## Built-in Categories

- **Groceries**: REWE, EDEKA, ALDI, LIDL, etc.
- **Fast Food**: McDonald's, Subway, Pizza places
- **Online Shopping**: Amazon, PayPal, eBay
- **Clothing**: H&M, Zara, C&A
- **Electronics**: Media Markt, Saturn
- **Utilities**: Energy, Gas, Water providers
- **Banking Fees**: Bank charges and fees
- **Salary**: Salary payments
- **Rent**: Rent and housing costs
- **Transport**: Deutsche Bahn, Public transport, Taxi, etc.
- **Unknown**: Unmatched transactions

## Adding New Patterns

1. Create a new file in `src/categorization/patterns/`
2. Export an array of patterns
3. Import and add to `PatternRegistry` in `pattern-registry.ts`

Example:
```typescript
import { ParticipantContainsPattern } from "./base-patterns.ts";

export const myPatterns = [
  new ParticipantContainsPattern("My Store", "My Category", 100, ["keyword"])
];
```

## Example Output

```
🏦 Bank History Parser

✅ Read 1889 transactions

🏷️ Loaded 51 patterns across 16 categories

📊 CATEGORY BREAKDOWN:
==================================================
Groceries: 889 transactions (47.1%)
Unknown: 384 transactions (20.3%)
Online Shopping: 245 transactions (13.0%)
Banking Fees: 131 transactions (6.9%)
Fast Food: 50 transactions (2.6%)
...

✅ Analysis completed!
📈 Categorized 1505/1889 transactions
```

## Requirements

- Deno 2.0+
- CSV file in German bank format

## License

MIT License 