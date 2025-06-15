# Bank Transaction Analyzer

A tool for analyzing and categorizing bank transactions from CSV files. Built with Next.js, this application runs entirely in your browser - no data is sent to any server.

## Features

- **CSV Import**: Load bank transaction files directly in your browser
- **Categorization Rules**: Create rules to automatically categorize transactions
- **Analytics**: View spending breakdowns with charts and statistics
- **Local Processing**: All data stays in your browser

## Getting Started

```bash
# Clone repository
git clone <repository-url>
cd bank-history

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to start using the application.

### Usage

1. **Import Transactions**: Select your bank CSV file on the Transactions page
2. **Create Rules**: Navigate to Categories to create rules for automatic categorization
3. **Analyze**: View your categorized transactions and spending analytics

## Creating Categorization Rules

Rules let you automatically categorize transactions based on criteria:

1. Go to the **Categories** page
2. Select an uncategorized transaction
3. Define matching criteria (merchant name, amount range, etc.)
4. Assign a category (Food, Transportation, Housing, etc.)
5. Save the rule to apply it to all matching transactions

## Supported Bank Formats

The application automatically detects and imports CSV files from various German banks:

- **Standard Format 3** (Recommended)
- **Standard Format 1**
- **Standard Format 2**
- **DKB**
- **Sparkasse**
- **Consors Bank**
- **Commerzbank**
- **ING**
- **Comdirect**

### Common Limitations
- Most formats don't provide actual account balance information, so running balances are calculated starting from 0
- BIC codes are frequently missing across formats
- Some formats have missing participant names or IBAN information

If your bank isn't supported, you can use the "Notify Developer" option when uploading files to request format support.

## Available Categories

- Advance Money
- Entertainment
- Food
- Housing
- Household Items
- Household Supplies
- Income
- Insurance
- Investments
- Other
- Personal Care
- Professional
- Reimbursements
- Transportation
- Utilities

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **UI**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript
- **Storage**: LocalStorage for rules and data

## Privacy

- All processing happens in your browser
- No data is sent to external servers
- No accounts or authentication needed

## License
MIT License 
