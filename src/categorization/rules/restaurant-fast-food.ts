import type { Pattern } from "../types.ts";
import type { Transaction } from "@/readers/csv-reader.ts";

const places = [
    { name: "mcdonalds", keywords: ["mcdonalds", "mcdonald"] },
    { name: "subway", keywords: ["subway"] },
    { name: "burger-king", keywords: ["burger king", "burgerking"] },
    { name: "kfc", keywords: ["kfc"] },
    { name: "pizza", keywords: ["pizza", "pizzeria"] },
    { name: "doner", keywords: ["döner", "doner", "kebab", "cappadocia"] },
    { name: "five-guys", keywords: ["five guys"] },
];

function match(transaction: Transaction) {
    const participant = transaction.paymentParticipant.toLowerCase();
    const purpose = transaction.purpose.toLowerCase();
    return places.some((place) =>
        place.keywords.some(
            (keyword) =>
                participant.includes(keyword) || purpose.includes(keyword)
        )
    );
}

function getDetails(transaction: Transaction) {
    const participant = transaction.paymentParticipant.toLowerCase();
    const purpose = transaction.purpose.toLowerCase();
    const found = places.find((place) =>
        place.keywords.some(
            (keyword) =>
                participant.includes(keyword) || purpose.includes(keyword)
        )
    );
    return found?.name;
}

export const restaurantFastFood: Pattern = {
    name: "restaurant-fast-food",
    priority: 10,
    matcher: match,
    getDetails,
};
