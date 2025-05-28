import type { Pattern } from "../types.ts";
import type { Transaction } from "@/readers/csv-reader.ts";

const charities = [
    { name: "asb", keywords: ["arbeiter-samariter-bund", "asb-beitrag"] },
];

function match(transaction: Transaction) {
    const participant = transaction.paymentParticipant.toLowerCase();
    const purpose = transaction.purpose.toLowerCase();
    return charities.some((charity) =>
        charity.keywords.some(
            (keyword) =>
                participant.includes(keyword) || purpose.includes(keyword)
        )
    );
}

function getDetails(transaction: Transaction) {
    const participant = transaction.paymentParticipant.toLowerCase();
    const purpose = transaction.purpose.toLowerCase();
    const found = charities.find((charity) =>
        charity.keywords.some(
            (keyword) =>
                participant.includes(keyword) || purpose.includes(keyword)
        )
    );
    return found?.name;
}

export const charity: Pattern = {
    name: "charity",
    priority: 10,
    matcher: match,
    getDetails,
};
