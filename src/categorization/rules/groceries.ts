import type { Pattern } from "../types.ts";
import type { Transaction } from "@/readers/csv-reader.ts";

const stores = [
    { name: "carrefour", keywords: ["carrefour"] },
    { name: "franprix", keywords: ["franprix"] },
    { name: "cox-in-hell", keywords: ["cox in hell"] },
    { name: "nya-ju", keywords: ["nya.ju", "nya ju"] },
    { name: "spar", keywords: ["spar"] },
    { name: "auchan", keywords: ["auchan"] },
    { name: "rewe", keyword: "rewe" },
    { name: "edeka", keyword: "edeka" },
    { name: "aldi", keyword: "aldi" },
    { name: "lidl", keyword: "lidl" },
    { name: "penny", keyword: "penny" },
    { name: "netto", keyword: "netto" },
];

function match(transaction: Transaction) {
    const participant = transaction.paymentParticipant.toLowerCase();
    const purpose = transaction.purpose.toLowerCase();
    return stores.some((store) =>
        store.keywords
            ? store.keywords.some(
                  (keyword) =>
                      participant.includes(keyword) || purpose.includes(keyword)
              )
            : participant.includes(store.keyword) ||
              purpose.includes(store.keyword)
    );
}

function getDetails(transaction: Transaction) {
    const participant = transaction.paymentParticipant.toLowerCase();
    const purpose = transaction.purpose.toLowerCase();
    const found = stores.find((store) =>
        store.keywords
            ? store.keywords.some(
                  (keyword) =>
                      participant.includes(keyword) || purpose.includes(keyword)
              )
            : participant.includes(store.keyword) ||
              purpose.includes(store.keyword)
    );
    return found?.name;
}

export const groceries: Pattern = {
    name: "groceries",
    priority: 10,
    matcher: match,
    getDetails,
};
