import type { Pattern } from "../types.ts";
import type { Transaction } from "@/readers/csv-reader.ts";

const providers = [
    { name: "paris", keywords: ["ratp"] },
    { name: "db", keywords: ["deutsche bahn", "db ", "bahn"] },
    { name: "nahverkehr", keywords: ["hvv", "mvg", "bvg", "vrs", "vrr"] },
    { name: "taxi", keywords: ["taxi", "uber", "bolt", "freenow"] },
    { name: "gas-station", keywords: ["tankstelle", "aral", "esso", "total"] },
    { name: "parking", keywords: ["parkhaus", "parking", "parkgebühr"] },
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

export const transport: Pattern = {
    name: "transport",
    priority: 10,
    matcher: match,
    getDetails,
};
