import type { Pattern } from "../types.ts";
import type { Transaction } from "@/readers/csv-reader.ts";

const subtypes = [
    { name: "bonus", keywords: ["bonus"] },
    {
        name: "salary",
        keywords: ["lohn", "gehalt", "salary", "vergütung", "entgelt"],
    },
];

function match(transaction: Transaction) {
    const purpose = transaction.purpose.toLowerCase();
    return subtypes.some((subtype) =>
        subtype.keywords.some((keyword) => purpose.includes(keyword))
    );
}

function getDetails(transaction: Transaction) {
    const purpose = transaction.purpose.toLowerCase();
    const found = subtypes.find((subtype) =>
        subtype.keywords.some((keyword) => purpose.includes(keyword))
    );
    return found?.name;
}

export const income: Pattern = {
    name: "income",
    priority: 10,
    matcher: match,
    getDetails,
};
