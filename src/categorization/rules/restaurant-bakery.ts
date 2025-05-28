import type { Pattern } from "../types.ts";
import type { Transaction } from "@/readers/csv-reader.ts";

const bakeries = [
    { name: "merzenich", keywords: ["merzenich", "baeckerei", "bäckerei"] },
    { name: "kamps", keywords: ["kamps"] },
    { name: "backwerk", keywords: ["backwerk"] },
    { name: "brotzeit", keywords: ["brotzeit"] },
    { name: "bread-and-co", keywords: ["bread and co"] },
];

function match(transaction: Transaction) {
    const participant = transaction.paymentParticipant.toLowerCase();
    const purpose = transaction.purpose.toLowerCase();
    return bakeries.some((bakery) =>
        bakery.keywords.some(
            (keyword) =>
                participant.includes(keyword) || purpose.includes(keyword)
        )
    );
}

function getDetails(transaction: Transaction) {
    const participant = transaction.paymentParticipant.toLowerCase();
    const purpose = transaction.purpose.toLowerCase();
    const found = bakeries.find((bakery) =>
        bakery.keywords.some(
            (keyword) =>
                participant.includes(keyword) || purpose.includes(keyword)
        )
    );
    return found?.name;
}

export const restaurantBakery: Pattern = {
    name: "restaurant-bakery",
    priority: 10,
    matcher: match,
    getDetails,
};
