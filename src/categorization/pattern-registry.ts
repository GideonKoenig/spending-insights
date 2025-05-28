import { CategoryPattern } from "./types.ts";
import { groceryPatterns } from "./patterns/grocery-patterns.ts";
import {
    fastFoodPatterns,
    restaurantPatterns,
} from "./patterns/food-patterns.ts";
import {
    onlineShoppingPatterns,
    retailPatterns,
} from "./patterns/shopping-patterns.ts";
import {
    salaryPatterns,
    bankingPatterns,
    utilityPatterns,
    telecomPatterns,
    rentPatterns,
} from "./patterns/financial-patterns.ts";
import {
    pharmacyPatterns,
    medicalPatterns,
} from "./patterns/health-patterns.ts";
import { transportPatterns } from "./patterns/transport-patterns.ts";

export class PatternRegistry {
    private static allPatterns: CategoryPattern[] = [
        ...salaryPatterns,
        ...rentPatterns,
        ...groceryPatterns,
        ...fastFoodPatterns,
        ...restaurantPatterns,
        ...onlineShoppingPatterns,
        ...retailPatterns,
        ...bankingPatterns,
        ...utilityPatterns,
        ...telecomPatterns,
        ...pharmacyPatterns,
        ...medicalPatterns,
        ...transportPatterns,
    ];

    static getAllPatterns(): CategoryPattern[] {
        return [...this.allPatterns];
    }

    static getPatternsByCategory(category: string): CategoryPattern[] {
        return this.allPatterns.filter(
            (pattern) => pattern.category === category
        );
    }

    static getCategories(): string[] {
        const categories = new Set(
            this.allPatterns.map((pattern) => pattern.category)
        );
        return Array.from(categories).sort();
    }

    static addPattern(pattern: CategoryPattern): void {
        this.allPatterns.push(pattern);
        this.allPatterns.sort((a, b) => b.priority - a.priority);
    }

    static addPatterns(patterns: CategoryPattern[]): void {
        this.allPatterns.push(...patterns);
        this.allPatterns.sort((a, b) => b.priority - a.priority);
    }

    static getPatternStats(): {
        totalPatterns: number;
        categoriesCount: number;
        patternsByCategory: { [category: string]: number };
    } {
        const patternsByCategory: { [category: string]: number } = {};

        for (const pattern of this.allPatterns) {
            patternsByCategory[pattern.category] =
                (patternsByCategory[pattern.category] || 0) + 1;
        }

        return {
            totalPatterns: this.allPatterns.length,
            categoriesCount: Object.keys(patternsByCategory).length,
            patternsByCategory,
        };
    }
}
