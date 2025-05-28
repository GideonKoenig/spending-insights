import type { Pattern } from "../types.ts";
import type { Transaction } from "@/readers/csv-reader.ts";

const costs = [
    { name: "gym", keywords: ["mcfit", "rsg group"] },
    { name: "banking", keywords: ["abschluss"] },
    {
        name: "utilities",
        keywords: [
            "stadtwerke",
            "eon",
            "rwe",
            "vattenfall",
            "energie",
            "strom",
            "gas",
            "wasser",
            "heizung",
        ],
    },
    { name: "telecommunications", keywords: ["telekom"] },
    { name: "rent", keywords: ["miete", "rent", "wohnung", "nebenkosten"] },
];

function match(transaction: Transaction) {
    const participant = transaction.paymentParticipant.toLowerCase();
    const purpose = transaction.purpose.toLowerCase();

    // For banking costs, check if participant is empty
    if (participant === "" && purpose.includes("abschluss")) {
        return true;
    }

    return costs.some((cost) =>
        cost.keywords.some(
            (keyword) =>
                participant.includes(keyword) || purpose.includes(keyword)
        )
    );
}

function getDetails(transaction: Transaction) {
    const participant = transaction.paymentParticipant.toLowerCase();
    const purpose = transaction.purpose.toLowerCase();

    // Special case for banking costs
    if (participant === "" && purpose.includes("abschluss")) {
        return "banking";
    }

    const found = costs.find((cost) =>
        cost.keywords.some(
            (keyword) =>
                participant.includes(keyword) || purpose.includes(keyword)
        )
    );
    return found?.name;
}

export const fixedCosts: Pattern = {
    name: "fixed-costs",
    priority: 10,
    matcher: match,
    getDetails,
};
