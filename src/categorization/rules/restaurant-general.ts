import type { Pattern } from "../types.ts";
import type { Transaction } from "@/readers/csv-reader.ts";

const restaurants = [
    { name: "green-club", keywords: ["green.club", "green club"] },
    { name: "general", keywords: ["restaurant", "bistro", "cafe", "bar"] },
];

function match(transaction: Transaction) {
    const participant = transaction.paymentParticipant.toLowerCase();
    const purpose = transaction.purpose.toLowerCase();
    return restaurants.some((restaurant) =>
        restaurant.keywords.some(
            (keyword) =>
                participant.includes(keyword) || purpose.includes(keyword)
        )
    );
}

function getDetails(transaction: Transaction) {
    const participant = transaction.paymentParticipant.toLowerCase();
    const purpose = transaction.purpose.toLowerCase();
    const found = restaurants.find((restaurant) =>
        restaurant.keywords.some(
            (keyword) =>
                participant.includes(keyword) || purpose.includes(keyword)
        )
    );
    return found?.name;
}

export const restaurantGeneral: Pattern = {
    name: "restaurant",
    priority: 5,
    matcher: match,
    getDetails,
};
