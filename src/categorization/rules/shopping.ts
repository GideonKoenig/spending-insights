import type { Pattern } from "../types.ts";
import type { Transaction } from "@/readers/csv-reader.ts";

const stores = [
    { name: "amazon", keywords: ["amazon"] },
    { name: "paypal", keywords: ["paypal"] },
    { name: "ebay", keywords: ["ebay"] },
    { name: "zalando", keywords: ["zalando"] },
    { name: "otto", keywords: ["otto"] },
    { name: "h-m", keywords: ["h&m", "h & m"] },
    { name: "c-a", keywords: ["c&a", "c & a"] },
    { name: "zara", keywords: ["zara"] },
    { name: "media-markt", keywords: ["media markt", "mediamarkt"] },
    { name: "saturn", keywords: ["saturn"] },
    { name: "ikea", keywords: ["ikea"] },
];

function match(transaction: Transaction) {
    const participant = transaction.paymentParticipant.toLowerCase();
    return stores.some((store) =>
        store.keywords.some((keyword) => participant.includes(keyword))
    );
}

function getDetails(transaction: Transaction) {
    const participant = transaction.paymentParticipant.toLowerCase();
    const found = stores.find((store) =>
        store.keywords.some((keyword) => participant.includes(keyword))
    );
    return found?.name;
}

export const shopping: Pattern = {
    name: "shopping",
    priority: 7,
    matcher: match,
    getDetails,
};
