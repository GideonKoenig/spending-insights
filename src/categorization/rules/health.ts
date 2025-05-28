import type { Pattern } from "../types.ts";
import type { Transaction } from "@/readers/csv-reader.ts";

const providers = [
    { name: "dm", keywords: ["dm "] },
    { name: "rossmann", keywords: ["rossmann"] },
    { name: "apotheke", keywords: ["apotheke", "pharmacy"] },
    { name: "muller", keywords: ["müller", "mueller"] },
    {
        name: "arzt",
        keywords: [
            "arzt",
            "doctor",
            "praxis",
            "klinik",
            "krankenhaus",
            "hospital",
        ],
    },
];

function match(transaction: Transaction) {
    const participant = transaction.paymentParticipant.toLowerCase();
    const purpose = transaction.purpose.toLowerCase();
    return providers.some((provider) =>
        provider.keywords.some(
            (keyword) =>
                participant.includes(keyword) || purpose.includes(keyword)
        )
    );
}

function getDetails(transaction: Transaction) {
    const participant = transaction.paymentParticipant.toLowerCase();
    const purpose = transaction.purpose.toLowerCase();
    const found = providers.find((provider) =>
        provider.keywords.some(
            (keyword) =>
                participant.includes(keyword) || purpose.includes(keyword)
        )
    );
    return found?.name;
}

export const health: Pattern = {
    name: "health",
    priority: 10,
    matcher: match,
    getDetails,
};
