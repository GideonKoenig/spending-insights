import {
    ParticipantContainsPattern,
    PurposeContainsPattern,
    PositiveAmountPattern,
} from "./base-patterns.ts";

export const salaryPatterns = [
    new PurposeContainsPattern("Salary Keywords", "Salary", 150, [
        "lohn",
        "gehalt",
        "salary",
        "vergütung",
        "entgelt",
    ]),

    new PositiveAmountPattern("Large Positive Amount", "Income", 50),
];

export const bankingPatterns = [
    new ParticipantContainsPattern("Bank Fees", "Banking Fees", 120, [
        "bank",
        "sparkasse",
        "volksbank",
        "commerzbank",
        "deutsche bank",
    ]),

    new PurposeContainsPattern("Fee Keywords", "Banking Fees", 110, [
        "gebühr",
        "entgelt",
        "provision",
        "zinsen",
    ]),
];

export const utilityPatterns = [
    new ParticipantContainsPattern("Energy Providers", "Utilities", 100, [
        "stadtwerke",
        "eon",
        "rwe",
        "vattenfall",
        "energie",
    ]),

    new PurposeContainsPattern("Utility Keywords", "Utilities", 95, [
        "strom",
        "gas",
        "wasser",
        "heizung",
        "energie",
        "stadtwerke",
    ]),
];

export const telecomPatterns = [
    new ParticipantContainsPattern(
        "Telecom Providers",
        "Telecommunications",
        100,
        ["telekom", "vodafone", "o2", "1&1", "mobilcom"]
    ),
];

export const rentPatterns = [
    new PurposeContainsPattern("Rent Keywords", "Rent", 130, [
        "miete",
        "rent",
        "wohnung",
        "nebenkosten",
    ]),
];
