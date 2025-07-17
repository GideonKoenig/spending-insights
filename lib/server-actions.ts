"use server";

export async function notifyDeveloperAboutUnknownCsvFormat(
    headers: string[],
    bankName?: string
) {
    const timestamp = new Date().toLocaleString("de-DE", {
        timeZone: "Europe/Berlin",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    console.log("\nUnknown CSV format detected:");
    console.log("Date/Time:", timestamp);
    console.log("Bank:", bankName || "Not specified");
    console.log("Headers:", headers);
}
