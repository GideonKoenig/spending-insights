import type { Pattern } from "../types.ts";
import type { Transaction } from "@/readers/csv-reader.ts";

const activities = [
    { name: "movies", keywords: ["movie", "cinema", "kino"] },
    { name: "bar", keywords: ["james joyce"] },
    { name: "postcard", keywords: ["la poste", "post office"] },
];

function match(transaction: Transaction) {
    const participant = transaction.paymentParticipant.toLowerCase();
    const purpose = transaction.purpose.toLowerCase();
    return activities.some((activity) =>
        activity.keywords.some(
            (keyword) =>
                participant.includes(keyword) || purpose.includes(keyword)
        )
    );
}

function getDetails(transaction: Transaction) {
    const participant = transaction.paymentParticipant.toLowerCase();
    const purpose = transaction.purpose.toLowerCase();
    const found = activities.find((activity) =>
        activity.keywords.some(
            (keyword) =>
                participant.includes(keyword) || purpose.includes(keyword)
        )
    );
    return found?.name;
}

export const fun: Pattern = {
    name: "fun",
    priority: 10,
    matcher: match,
    getDetails,
};
