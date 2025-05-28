import { CsvReader } from "@/readers/csv-reader.ts";
import {
    categorize,
    createStatistics,
    patterns,
} from "@/categorization/index.ts";
import { tryCatch } from "@/utils.ts";

async function main() {
    console.log("🏦 Bank History Parser\n");

    const result = await tryCatch(() =>
        CsvReader.readFromFile("./data/bank-history.csv")
    );
    if (!result.success) {
        console.error("❌ Error:", result.error.message);
        throw result.error;
    }
    const transactions = result.data;
    console.log(`✅ Read ${transactions.length} transactions\n`);

    console.log(`🏷️ Loaded ${patterns.length} patterns\n`);

    const categorizedTransactions = transactions.map(categorize);
    const stats = createStatistics(categorizedTransactions);

    const categorizedCount = stats.totalTransactions - stats.unknownCount;
    const categorizedPercentage = (
        (categorizedCount / stats.totalTransactions) *
        100
    ).toFixed(1);

    console.log("📊 CATEGORY BREAKDOWN:");
    console.log("=".repeat(50));
    console.log(
        `Categorized: ${categorizedCount}/${stats.totalTransactions} (${categorizedPercentage}%)`
    );
    console.log(
        `Unknown: ${stats.unknownCount}/${stats.totalTransactions} (${(
            100 - Number(categorizedPercentage)
        ).toFixed(1)}%)`
    );
    console.log("-".repeat(50));

    const sortedCategories = Object.entries(stats.patternBreakdown)
        .filter(([name]) => name !== "unknown")
        .sort(([, a], [, b]) => b - a);

    for (const [category, count] of sortedCategories) {
        const percentage = ((count / stats.totalTransactions) * 100).toFixed(1);
        console.log(
            `${category}: ${count}/${stats.totalTransactions} (${percentage}%)`
        );
    }
    console.log();

    console.log("🔍 Sample uncategorized transactions:");
    console.log("=".repeat(50));
    const sampleTransactions = categorizedTransactions
        .filter((t) => t.pattern.name === "unknown")
        .slice(0, 5);

    for (const { transaction } of sampleTransactions) {
        console.log(
            `${transaction.bookingDate.toLocaleDateString()}: ${
                transaction.paymentParticipant
            }`
        );
        console.log(`  Amount: €${transaction.amount.toFixed(2)}`);
        console.log(`  Purpose: ${transaction.purpose}`);
        console.log();
    }

    console.log("✅ Analysis completed!");
    console.log(
        `📈 Categorized ${categorizedCount}/${stats.totalTransactions} transactions (${categorizedPercentage}%)`
    );

    return { transactions, categorizedTransactions, stats };
}

if (import.meta.main) {
    await main();
}
