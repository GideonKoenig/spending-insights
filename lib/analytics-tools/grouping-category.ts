import { Account } from "@/lib/types";

export type CategoryInsights = {
    overall: {
        income: number;
        expense: number;
        balance: number;
        transactionCount: number;
        incomeTransactionCount: number;
        expenseTransactionCount: number;
    };
    income: Map<string, CategoryStats>;
    expense: Map<string, CategoryStats>;
};

export type CategoryStats = {
    category: string;
    amount: number;
    transactionCount: number;
    ratioOfTotal: number;
    subcategories: Map<string, SubcategoryStats>;
};

export type SubcategoryStats = {
    category: string;
    subcategory: string;
    amount: number;
    transactionCount: number;
    ratioOfCategory: number;
    ratioOfTotal: number;
};

export function getCategoryInsights(accounts: Account[]): CategoryInsights {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalTransactionCount = 0;
    let totalIncomeTransactionCount = 0;
    let totalExpenseTransactionCount = 0;

    const incomeCategoryMap = new Map<string, CategoryStats>();
    const expenseCategoryMap = new Map<string, CategoryStats>();

    for (const account of accounts) {
        for (const transaction of account.transactions) {
            if (transaction.tag?.ignore) continue;

            const amount = Math.abs(transaction.amount);
            const isIncome = transaction.amount > 0;
            const category = transaction.tag?.category?.toLowerCase();
            const subcategory = transaction.tag?.subCategory?.toLowerCase();

            totalIncome += isIncome ? amount : 0;
            totalExpense += isIncome ? 0 : amount;
            totalTransactionCount += 1;
            totalIncomeTransactionCount += isIncome ? 1 : 0;
            totalExpenseTransactionCount += isIncome ? 0 : 1;

            const categoryMap = isIncome
                ? incomeCategoryMap
                : expenseCategoryMap;

            const categoryKey = category || "uncategorized";

            if (!categoryMap.has(categoryKey)) {
                categoryMap.set(categoryKey, {
                    category: categoryKey,
                    amount: 0,
                    transactionCount: 0,
                    ratioOfTotal: 0,
                    subcategories: new Map(),
                });
            }

            const categoryStats = categoryMap.get(categoryKey)!;
            categoryStats.amount += amount;
            categoryStats.transactionCount += 1;

            const subcategoryKey = subcategory || "undefined";
            if (!categoryStats.subcategories.has(subcategoryKey)) {
                categoryStats.subcategories.set(subcategoryKey, {
                    category: categoryKey,
                    subcategory: subcategoryKey,
                    amount: 0,
                    transactionCount: 0,
                    ratioOfCategory: 0,
                    ratioOfTotal: 0,
                });
            }

            const subcategoryStats =
                categoryStats.subcategories.get(subcategoryKey)!;
            subcategoryStats.amount += amount;
            subcategoryStats.transactionCount += 1;
        }
    }

    for (const categoryStats of incomeCategoryMap.values()) {
        categoryStats.ratioOfTotal =
            totalIncome > 0 ? categoryStats.amount / totalIncome : 0;

        for (const subcategoryStats of categoryStats.subcategories.values()) {
            subcategoryStats.ratioOfCategory =
                categoryStats.amount > 0
                    ? subcategoryStats.amount / categoryStats.amount
                    : 0;
            subcategoryStats.ratioOfTotal =
                totalIncome > 0 ? subcategoryStats.amount / totalIncome : 0;
        }
    }

    for (const categoryStats of expenseCategoryMap.values()) {
        categoryStats.ratioOfTotal =
            totalExpense > 0 ? categoryStats.amount / totalExpense : 0;

        for (const subcategoryStats of categoryStats.subcategories.values()) {
            subcategoryStats.ratioOfCategory =
                categoryStats.amount > 0
                    ? subcategoryStats.amount / categoryStats.amount
                    : 0;
            subcategoryStats.ratioOfTotal =
                totalExpense > 0 ? subcategoryStats.amount / totalExpense : 0;
        }
    }

    const collapsedIncomeCategories = collapseCategories(
        incomeCategoryMap,
        totalIncome
    );
    const collapsedExpenseCategories = collapseCategories(
        expenseCategoryMap,
        totalExpense
    );

    const totalBalance = totalIncome - totalExpense;

    return {
        overall: {
            income: totalIncome,
            expense: totalExpense,
            balance: totalBalance,
            transactionCount: totalTransactionCount,
            incomeTransactionCount: totalIncomeTransactionCount,
            expenseTransactionCount: totalExpenseTransactionCount,
        },
        income: collapsedIncomeCategories,
        expense: collapsedExpenseCategories,
    };
}

function collapseCategories(
    categoryMap: Map<string, CategoryStats>,
    total: number
) {
    const COLLAPSE_THRESHOLD = 0.02; // 2%

    const categories = Array.from(categoryMap.entries());
    const mainCategories: Array<[string, CategoryStats]> = [];
    const smallCategories: Array<[string, CategoryStats]> = [];
    let existingOtherCategory: [string, CategoryStats] | null = null;

    for (const [name, stats] of categories) {
        if (name.toLowerCase() === "other") {
            existingOtherCategory = [name, stats];
            continue;
        }

        if (stats.ratioOfTotal >= COLLAPSE_THRESHOLD) {
            mainCategories.push([name, stats]);
        } else {
            smallCategories.push([name, stats]);
        }
    }

    if (smallCategories.length > 0 || existingOtherCategory) {
        let othersAmount = existingOtherCategory
            ? existingOtherCategory[1].amount
            : 0;
        let othersTransactionCount = existingOtherCategory
            ? existingOtherCategory[1].transactionCount
            : 0;
        const othersSubcategories = new Map<string, SubcategoryStats>();

        if (existingOtherCategory) {
            for (const [subName, subStats] of existingOtherCategory[1]
                .subcategories) {
                othersSubcategories.set(subName, {
                    ...subStats,
                    category: "other",
                });
            }
        }

        for (const [categoryName, categoryStats] of smallCategories) {
            othersAmount += categoryStats.amount;
            othersTransactionCount += categoryStats.transactionCount;

            for (const [subName, subStats] of categoryStats.subcategories) {
                const combinedName = `${categoryName}-${subName}`;
                othersSubcategories.set(combinedName, {
                    category: "other",
                    subcategory: combinedName,
                    amount: subStats.amount,
                    transactionCount: subStats.transactionCount,
                    ratioOfCategory: 0, // Will be updated below
                    ratioOfTotal: subStats.ratioOfTotal,
                });
            }
        }

        for (const subStats of othersSubcategories.values()) {
            subStats.ratioOfCategory =
                othersAmount > 0 ? subStats.amount / othersAmount : 0;
        }

        const otherCategory: CategoryStats = {
            category: "other",
            amount: othersAmount,
            transactionCount: othersTransactionCount,
            ratioOfTotal: total > 0 ? othersAmount / total : 0,
            subcategories: othersSubcategories,
        };

        mainCategories.push(["other", otherCategory]);
    }

    return new Map(mainCategories);
}
