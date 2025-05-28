import type { Pattern } from "../types.ts";
import type { Transaction } from "@/readers/csv-reader.ts";

const reimbursements = [
    {
        name: "work",
        keywords: ["julius kaeck", "auslage"],
    },
    {
        name: "clara",
        keywords: ["clara blume", "haushaltskasse"],
    },
];

function match(transaction: Transaction) {
    if (transaction.amount <= 0) return false;

    const participant = transaction.paymentParticipant.toLowerCase();
    const purpose = transaction.purpose.toLowerCase();
    return reimbursements.some((reimbursement) =>
        reimbursement.keywords.some(
            (keyword) =>
                participant.includes(keyword) || purpose.includes(keyword)
        )
    );
}

function getDetails(transaction: Transaction) {
    const participant = transaction.paymentParticipant.toLowerCase();
    const purpose = transaction.purpose.toLowerCase();
    const found = reimbursements.find((reimbursement) =>
        reimbursement.keywords.some(
            (keyword) =>
                participant.includes(keyword) || purpose.includes(keyword)
        )
    );
    return found?.name;
}

export const reimbursement: Pattern = {
    name: "reimbursement",
    priority: 7,
    matcher: match,
    getDetails,
};
