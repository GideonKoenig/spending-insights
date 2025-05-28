import {
    ParticipantContainsPattern,
    PurposeContainsPattern,
} from "./base-patterns.ts";

export const transportPatterns = [
    new ParticipantContainsPattern("Deutsche Bahn", "Transport", 100, [
        "deutsche bahn",
        "db ",
        "bahn",
    ]),

    new ParticipantContainsPattern("Public Transport", "Transport", 95, [
        "hvv",
        "mvg",
        "bvg",
        "vrs",
        "vrr",
    ]),

    new ParticipantContainsPattern("Taxi Services", "Transport", 90, [
        "taxi",
        "uber",
        "bolt",
        "freenow",
    ]),

    new ParticipantContainsPattern("Car Sharing", "Transport", 90, [
        "car2go",
        "drivenow",
        "share now",
        "miles",
    ]),

    new PurposeContainsPattern("Fuel/Gas", "Transport", 85, [
        "tankstelle",
        "shell",
        "aral",
        "esso",
        "total",
    ]),

    new PurposeContainsPattern("Parking", "Transport", 80, [
        "parkhaus",
        "parking",
        "parkgebühr",
    ]),
];
