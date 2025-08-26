# Spending Insights

Understand your spending at a glance. Analyze your bank transactions locally and securely in your browser. Import CSV files, set up smart rules and instantly see where your money goes.

## Features

- **Free & Open Access**: Completely free to use forever, no account registration required
- **Transaction Management**: Import, view, and manage transactions from multiple bank accounts
- **Smart Categorization**: Create custom rules for precise transaction tagging with 15 predefined categories
- **Analytics & Insights**: Interactive charts and visualizations to understand your spending patterns
- **Advanced Search & Filtering**: Find transactions with powerful filters by date, amount, merchant, or description
- **Backup & Sharing**: Export your data and rules, or import from backup files
- **Complete Privacy**: All processing happens locally in your browser - no servers, no uploads

## Getting Started

```bash
# Clone repository
git clone <repository-url>
cd spending-insights

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

The application automatically detects and imports CSV files from various banks:

- **Standard Format 3** (Recommended)
- **Standard Format 1**
- **Standard Format 2**
- **DKB**
- **Sparkasse**
- **Consors Bank**
- **Commerzbank**
- **ING**
- **Comdirect**
- **Mint**
- **Wespac**
- **Arvest**
- **Capital One**

### Common Limitations
- Most formats don't provide actual account balance information, so running balances are calculated starting from 0
- BIC codes are frequently missing across formats
- Some formats have missing participant names or IBAN information

If your bank isn't supported, you can use the "Notify Developer" option when uploading files to request format support. This sends anonymized sample data to help implement your format faster.

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

**Missing a category?** Please open an issue to request additional categories. If there's enough demand, I might add the option to create custom categories.

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **UI**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript
- **Storage**: LocalStorage for rules and data

## Privacy

- All processing happens in your browser
- No data is sent to external servers
- No accounts or authentication needed

## License
MIT License 
