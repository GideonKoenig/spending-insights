# Bank Transaction Analyzer

A tool for analyzing and categorizing bank transactions from CSV files. Built with Next.js, this application runs entirely in your browser - no data is sent to any server.

## Features

- **CSV Import**: Load bank transaction files directly in your browser
- **Categorization Rules**: Create rules to automatically categorize transactions
- **Transaction Filtering**: Filter by date, amount, merchant, and more
- **Analytics**: View spending breakdowns with charts and statistics
- **Local Processing**: All data stays in your browser

## Getting Started

### Prerequisites

- Node.js 18+
- Modern browser with File System Access API support (Chrome/Edge)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd bank-history

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start using the application.

### Usage

1. **Import Transactions**: Select your bank CSV file on the Transactions page
2. **Create Rules**: Navigate to Categories to create rules for automatic categorization
3. **Analyze**: View your categorized transactions and spending analytics

## CSV Schema

Your CSV file must include these fields:

```typescript
{
  accountName: string,
  accountIban: string,
  accountBic: string,
  bankName: string,
  bookingDate: string,        // DD.MM.YYYY
  valueDate: string,          // DD.MM.YYYY
  paymentParticipant: string,
  paymentParticipantIban: string,
  paymentParticipantBic: string,
  transactionType: string,
  purpose: string,
  amount: string,             // "1234,56"
  currency: string,
  balanceAfterTransaction: string,
  note: string,
  markedTransaction: string,
  creditorId: string,
  mandateReference: string
}
```

## Creating Categorization Rules

Rules let you automatically categorize transactions based on criteria:

1. Go to the **Categories** page
2. Select an uncategorized transaction
3. Define matching criteria (merchant name, amount range, etc.)
4. Assign a category (Food, Transportation, Housing, etc.)
5. Save the rule to apply it to all matching transactions

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
- **Storage**: IndexedDB for file handles, LocalStorage for rules

## Privacy

- All processing happens in your browser
- No data is sent to external servers
- No accounts or authentication needed
- File access managed by browser security

## Browser Support

- ✅ Chrome 86+
- ✅ Edge 86+
- ❌ Firefox (File System Access API not supported)
- ❌ Safari (File System Access API not supported)

## License

Private use only.
