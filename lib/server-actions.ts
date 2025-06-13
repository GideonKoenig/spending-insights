"use server";

export async function notifyDeveloperAboutUnknownCsvFormat(
    headers: string[],
    bankName?: string
) {
    console.log("Unknown CSV format detected:");
    console.log("Bank:", bankName || "Not specified");
    console.log("Headers:", headers);
}
