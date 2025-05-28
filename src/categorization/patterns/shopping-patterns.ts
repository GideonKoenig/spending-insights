import { ParticipantContainsPattern } from "./base-patterns.ts";

export const onlineShoppingPatterns = [
    new ParticipantContainsPattern("Amazon", "Online Shopping", 95, ["amazon"]),

    new ParticipantContainsPattern("PayPal", "Online Shopping", 80, ["paypal"]),

    new ParticipantContainsPattern("eBay", "Online Shopping", 90, ["ebay"]),

    new ParticipantContainsPattern("Zalando", "Online Shopping", 90, [
        "zalando",
    ]),

    new ParticipantContainsPattern("Otto", "Online Shopping", 85, ["otto"]),
];

export const retailPatterns = [
    new ParticipantContainsPattern("H&M", "Clothing", 90, ["h&m", "h & m"]),

    new ParticipantContainsPattern("C&A", "Clothing", 90, ["c&a", "c & a"]),

    new ParticipantContainsPattern("Zara", "Clothing", 90, ["zara"]),

    new ParticipantContainsPattern("Media Markt", "Electronics", 90, [
        "media markt",
        "mediamarkt",
    ]),

    new ParticipantContainsPattern("Saturn", "Electronics", 90, ["saturn"]),

    new ParticipantContainsPattern("IKEA", "Furniture", 95, ["ikea"]),
];
