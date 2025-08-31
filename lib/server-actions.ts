"use server";

import sgMail from "@sendgrid/mail";
import { tryCatchAsync } from "@/lib/utils";
import {
    formatAnonymizedDataAsHtml,
    formatAnonymizedDataAsCsv,
} from "@/lib/notify-developer";

export async function notifyDeveloperAboutUnknownCsvFormat(
    headers: string[],
    anonymizedSampleData: string[][],
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

    const dataTableHtml = formatAnonymizedDataAsHtml(
        headers,
        anonymizedSampleData
    );
    const csvText = formatAnonymizedDataAsCsv(headers, anonymizedSampleData);

    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

    const msg = {
        to: "gideon.koenig@online.de",
        from: process.env.SENDGRID_FROM_EMAIL!,
        subject: "[SPENDING INSIGHTS] New format detected",
        html: `
            <h2>Unknown CSV Format Detected</h2>
            <p><strong>Date/Time:</strong> ${timestamp}</p>
            <p><strong>Bank:</strong> ${bankName || "<not specified>"}</p>
            <p><strong>CSV Structure with Sample Data (Anonymized):</strong></p>
            ${dataTableHtml}
            <h3>Native CSV format</h3>
            <pre style="white-space: pre; background: #0b1220; color: #e5e7eb; padding: 12px; border-radius: 8px; overflow-x: auto;">${csvText
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")}</pre>
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
        console.log(
            "Sample Data (anonymized):",
            anonymizedSampleData.length > 0
                ? anonymizedSampleData
                : "No sample data available"
        );
    }
}
