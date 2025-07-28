"use server";

import sgMail from "@sendgrid/mail";
import { tryCatchAsync } from "@/lib/utils";

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
        second: "2-digit",
    });

    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

    const msg = {
        to: "gideon.koenig@online.de",
        from: process.env.SENDGRID_FROM_EMAIL!,
        subject: "[SPENDING INSIGHTS] New format detected",
        html: `
            <h2>Unknown CSV Format Detected</h2>
            <p><strong>Date/Time:</strong> ${timestamp}</p>
            <p><strong>Bank:</strong> ${bankName || "<not specified>"}</p>
            <p><strong>Headers:</strong></p>
            <ul>
                ${headers.map((header) => `<li>${header}</li>`).join("")}
            </ul>
            <hr>
            <p><em>This is an automated notification from your spending insights application.</em></p>
        `,
    };

    const result = await tryCatchAsync(() => sgMail.send(msg));

    if (result.success) {
        console.log("Developer notification email sent successfully");
    } else {
        console.error(
            "Failed to send developer notification email:",
            result.error
        );
        // Fallback to console logging
        console.log("\nUnknown CSV format detected:");
        console.log("Date/Time:", timestamp);
        console.log("Bank:", bankName || "Not specified");
        console.log("Headers:", headers);
    }
}
