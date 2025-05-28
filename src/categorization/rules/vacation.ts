import type { Pattern } from "../types.ts";
import type { Transaction } from "@/readers/csv-reader.ts";

function match(transaction: Transaction) {
    const purpose = transaction.purpose.toLowerCase();
    return purpose.includes("/fr/1");
}

function getDetails(_transaction: Transaction) {
    return "france";
}

export const vacation: Pattern = {
    name: "vacation",
    priority: 15,
    matcher: match,
    getDetails,
};
