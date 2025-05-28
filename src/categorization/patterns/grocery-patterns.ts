import { ParticipantContainsPattern } from "./base-patterns.ts";

export const groceryPatterns = [
    new ParticipantContainsPattern("REWE Stores", "Groceries", 100, ["rewe"]),

    new ParticipantContainsPattern("EDEKA Stores", "Groceries", 100, ["edeka"]),

    new ParticipantContainsPattern("ALDI Stores", "Groceries", 100, ["aldi"]),

    new ParticipantContainsPattern("LIDL Stores", "Groceries", 100, ["lidl"]),

    new ParticipantContainsPattern("PENNY Stores", "Groceries", 100, ["penny"]),

    new ParticipantContainsPattern("NETTO Stores", "Groceries", 100, ["netto"]),
];
