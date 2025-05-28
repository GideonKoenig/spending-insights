import { ParticipantContainsPattern } from "./base-patterns.ts";

export const fastFoodPatterns = [
    new ParticipantContainsPattern("McDonald's", "Fast Food", 90, [
        "mcdonalds",
        "mcdonald",
    ]),

    new ParticipantContainsPattern("Subway", "Fast Food", 90, ["subway"]),

    new ParticipantContainsPattern("Burger King", "Fast Food", 90, [
        "burger king",
        "burgerking",
    ]),

    new ParticipantContainsPattern("KFC", "Fast Food", 90, ["kfc"]),

    new ParticipantContainsPattern("Pizza Places", "Fast Food", 85, [
        "pizza",
        "pizzeria",
        "dominos",
        "pizza hut",
    ]),

    new ParticipantContainsPattern("Döner/Kebab", "Fast Food", 85, [
        "döner",
        "doner",
        "kebab",
        "cappadocia",
    ]),
];

export const restaurantPatterns = [
    new ParticipantContainsPattern("General Restaurants", "Restaurants", 70, [
        "restaurant",
        "bistro",
        "cafe",
        "bar",
        "pub",
    ]),
];
