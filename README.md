# Bank Transaction Analyzer

A private tool for analyzing and categorizing bank transactions from CSV files. Built with Next.js, this application helps you gain insights into your spending patterns and automatically categorize transactions.

## Features

### 🏦 Transaction Management
- **CSV Import**: Import bank transaction data following a specific schema
- **Persistent File Access**: Uses IndexedDB to store file handles for quick re-access
- **Smart File Handling**: Automatically requests permissions and maintains access to your transaction files

### 📊 Transaction Analysis
- **Transaction List**: View all transactions in an organized, filterable list
- **Advanced Filtering**: Jira-style filtering system with multiple operators:
  - Equality (`=`)
  - Comparison (`<`, `>`, `<=`, `>=`)
  - Inclusion (`includes`) - supports multiple values with tag-style UI
  - Date range filtering with intuitive date pickers
- **Real-time Search**: Filter transactions as you type

### 📈 Statistics & Visualization
- **Interactive Graphs**: Visualize spending patterns and trends
- **Category Breakdown**: See how much you spend in different categories
- **Time-based Analysis**: Track spending over time periods

### 🏷️ Smart Categorization
- **Pattern Creation**: Create custom rules to automatically categorize transactions
- **Rule-based Matching**: Define patterns based on transaction fields
- **Category Management**: Organize transactions into categories like "Transportation", "Groceries", etc.
- **Exportable Rules**: Save and share your categorization patterns

## CSV Schema

Your CSV file must match the following structure:

```typescript
{
  accountName: string,
  accountIban: string,
  accountBic: string,
  bankName: string,
  bookingDate: string, // Format: DD.MM.YYYY
  valueDate: string,   // Format: DD.MM.YYYY
  paymentParticipant: string,
  paymentParticipantIban: string,
  paymentParticipantBic: string,
  transactionType: string,
  purpose: string,
  amount: string,      // Format: "1234,56" (comma as decimal separator)
  currency: string,
  balanceAfterTransaction: string, // Format: "1234,56"
  note: string,
  markedTransaction: string,
  creditorId: string,
  mandateReference: string
}
```

## Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Type Safety**: TypeScript with Zod validation
- **Storage**: IndexedDB for file handles, LocalStorage for patterns
- **File System**: File System Access API for persistent file access

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Modern browser with File System Access API support (Chrome, Edge)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd bank-history-parser

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### First Time Setup

1. **Select CSV File**: On first visit, you'll be prompted to select your bank transaction CSV file
2. **Grant Permissions**: Allow the app to access your file for future sessions
3. **Verify Import**: Check that your transactions are correctly parsed and displayed

## Usage

### Transaction Filtering

The application provides powerful filtering capabilities:

1. **Date Range**: Use the date picker to select from/to dates
2. **Field Filters**: Add filters for any transaction field
3. **Multiple Values**: For text fields, use the "includes" operator to match multiple values
4. **Combine Filters**: Stack multiple filters for precise results

### Creating Categorization Patterns

1. Navigate to the **Patterns** page
2. Browse uncategorized transactions on the left panel
3. Select a transaction to create a pattern for
4. Use the pattern creator to define matching rules
5. Save patterns to automatically categorize future transactions

### Exporting Data

- **Patterns**: Export your categorization rules as JSON
- **Filtered Data**: Export filtered transaction lists as CSV

## Architecture

### Data Flow

```
CSV File → File System API → Zod Validation → React Context → UI Components
```

### Key Components

- **DataProvider**: Manages transaction data and file access
- **FilterProvider**: Handles advanced filtering logic
- **PatternEngine**: Processes categorization rules
- **FileHandler**: Manages IndexedDB and file permissions

### Storage Strategy

- **IndexedDB**: File handles for persistent access
- **LocalStorage**: User preferences and categorization patterns
- **Memory**: Transaction data (loaded fresh each session)

## Browser Compatibility

This application requires modern browser features:

- ✅ Chrome 86+
- ✅ Edge 86+
- ❌ Firefox (File System Access API not supported)
- ❌ Safari (File System Access API not supported)

## Privacy & Security

- **Local-Only**: All data processing happens locally in your browser
- **No Server**: No data is sent to external servers
- **No Authentication**: No accounts or sign-up required
- **File Permissions**: Uses browser security for file access

## Development

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with DataProvider
│   ├── page.tsx           # Main transaction list
│   ├── statistics/        # Statistics and graphs
│   └── patterns/          # Pattern creation interface
├── components/            # Reusable UI components
├── contexts/             # React contexts (DataProvider, etc.)
├── lib/                  # Utilities and helpers
│   ├── file-handler.ts   # File system operations
│   ├── schemas.ts        # Zod schemas
│   └── utils.ts          # General utilities
└── types/                # TypeScript type definitions
```

### Code Style

- **No Classes**: Functional components and hooks only
- **Absolute Imports**: Uses `@/` alias, no relative imports
- **TypeScript**: Strict type checking enabled
- **Tailwind**: Utility-first CSS approach

## Contributing

This is a private tool not intended for public distribution. However, feel free to fork and modify for your own use.

## License

Private use only.
