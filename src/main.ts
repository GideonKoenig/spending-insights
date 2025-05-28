import {
    CsvReader,
    TransactionCategorizer,
    PatternRegistry,
    ParticipantContainsPattern,
    type RawBankTransaction,
} from "./index.ts";

async function simpleReaderExample() {
    console.log("📖 Simple CSV Reader Example\n");

    try {
        const transactions = await CsvReader.readFromFile(
            "./data/bank-history.csv"
        );

        console.log(`✅ Successfully read ${transactions.length} transactions`);
        console.log();

        console.log("📊 Basic Statistics:");
        console.log("=".repeat(30));

        const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
        const income = transactions.filter((t) => t.amount > 0);
        const expenses = transactions.filter((t) => t.amount < 0);

        console.log(`Total transactions: ${transactions.length}`);
        console.log(`Income transactions: ${income.length}`);
        console.log(`Expense transactions: ${expenses.length}`);
        console.log(`Net amount: €${totalAmount.toFixed(2)}`);
        console.log();

        console.log("📅 Date Range:");
        console.log("=".repeat(30));
        const dates = transactions
            .map((t) => t.bookingDate)
            .sort((a, b) => a.getTime() - b.getTime());
        console.log(`From: ${dates[0].toLocaleDateString()}`);
        console.log(`To: ${dates[dates.length - 1].toLocaleDateString()}`);
        console.log();

        console.log("💰 Sample Transactions:");
        console.log("=".repeat(30));
        const sampleTransactions = transactions.slice(0, 3);

        for (const transaction of sampleTransactions) {
            console.log(
                `${transaction.bookingDate.toLocaleDateString()}: ${
                    transaction.paymentParticipant
                }`
            );
            console.log(`  Amount: €${transaction.amount.toFixed(2)}`);
            console.log(
                `  Purpose: ${transaction.purpose.substring(0, 40)}${
                    transaction.purpose.length > 40 ? "..." : ""
                }`
            );
            console.log();
        }

        return transactions;
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        console.error("❌ Error reading CSV:", errorMessage);
        throw error;
    }
}

async function main() {
    console.log("🏦 Bank History Parser\n");

    try {
        const transactions = await CsvReader.readFromFile(
            "./data/bank-history.csv"
        );
        console.log(`✅ Read ${transactions.length} transactions\n`);

        const patterns = PatternRegistry.getAllPatterns();
        const categorizer = new TransactionCategorizer(patterns);

        const patternStats = PatternRegistry.getPatternStats();
        console.log(
            `🏷️ Loaded ${patternStats.totalPatterns} patterns across ${patternStats.categoriesCount} categories`
        );
        console.log();

        const categorizedTransactions = categorizer.categorizeAll(transactions);
        const stats = categorizer.getStats(transactions);

        console.log("📊 CATEGORY BREAKDOWN:");
        console.log("=".repeat(50));
        const sortedCategories = Object.entries(stats.categoryBreakdown).sort(
            ([, a], [, b]) => b - a
        );

        for (const [category, count] of sortedCategories) {
            const percentage = (
                (count / stats.totalTransactions) *
                100
            ).toFixed(1);
            console.log(`${category}: ${count} transactions (${percentage}%)`);
        }
        console.log();

        console.log("🔍 Sample categorized transactions:");
        console.log("=".repeat(50));
        const sampleTransactions = categorizedTransactions
            .filter((t) => t.category !== "Unknown")
            .slice(0, 3);

        for (const transaction of sampleTransactions) {
            console.log(
                `${transaction.bookingDate.toLocaleDateString()}: ${
                    transaction.paymentParticipant
                }`
            );
            console.log(`  Amount: €${transaction.amount.toFixed(2)}`);
            console.log(
                `  Category: ${transaction.category} (${transaction.matchedRule})`
            );
            console.log();
        }

        console.log("✅ Analysis completed!");
        console.log(
            `📈 Categorized ${stats.categorizedTransactions}/${stats.totalTransactions} transactions`
        );

        return { transactions, categorizedTransactions, stats };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        console.error("❌ Error:", errorMessage);
        throw error;
    }
}

export function add(a: number, b: number): number {
    return a + b;
}

if (import.meta.main) {
    await main();
}
