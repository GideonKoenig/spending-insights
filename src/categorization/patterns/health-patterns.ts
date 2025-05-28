import { ParticipantContainsPattern } from "./base-patterns.ts";

export const pharmacyPatterns = [
    new ParticipantContainsPattern("DM Drugstore", "Pharmacy/Drugstore", 100, [
        "dm ",
        "dm-",
    ]),

    new ParticipantContainsPattern("Rossmann", "Pharmacy/Drugstore", 100, [
        "rossmann",
    ]),

    new ParticipantContainsPattern("Apotheke", "Pharmacy/Drugstore", 110, [
        "apotheke",
        "pharmacy",
    ]),

    new ParticipantContainsPattern(
        "Müller Drugstore",
        "Pharmacy/Drugstore",
        100,
        ["müller", "mueller"]
    ),
];

export const medicalPatterns = [
    new ParticipantContainsPattern("Medical Services", "Medical", 100, [
        "arzt",
        "doctor",
        "praxis",
        "klinik",
        "krankenhaus",
        "hospital",
    ]),
];
