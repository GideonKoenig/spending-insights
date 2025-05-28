import type { Pattern } from "../types.ts";
import type { Transaction } from "@/readers/csv-reader.ts";

const providers = [{ name: "hetzner", keywords: ["hetzner"] }];

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

export const fixedCostsProfessional: Pattern = {
    name: "fixed-costs-professional",
    priority: 15,
    matcher: match,
    getDetails,
};
