import { type Transaction } from "@/lib/types";
import { type TransactionEnricher } from "../types";

// Todo: This is AI generated and not quite what i want

// Common PayPal vendor patterns
const VENDOR_PATTERNS = [
    {
        pattern: /SPOTIFY.*?(\d+)/i,
        vendor: "Spotify",
        category: "Entertainment",
    },
    {
        pattern: /NETFLIX.*?(\d+)/i,
        vendor: "Netflix",
        category: "Entertainment",
    },
    { pattern: /AMAZON.*?(\d+)/i, vendor: "Amazon", category: "Shopping" },
    { pattern: /STEAM.*?(\d+)/i, vendor: "Steam", category: "Gaming" },
    { pattern: /APPLE\.COM.*?(\d+)/i, vendor: "Apple", category: "Technology" },
    { pattern: /GOOGLE.*?(\d+)/i, vendor: "Google", category: "Technology" },
    { pattern: /ADOBE.*?(\d+)/i, vendor: "Adobe", category: "Software" },
    {
        pattern: /MICROSOFT.*?(\d+)/i,
        vendor: "Microsoft",
        category: "Software",
    },
    { pattern: /GITHUB.*?(\d+)/i, vendor: "GitHub", category: "Software" },
    { pattern: /UBER.*?(\d+)/i, vendor: "Uber", category: "Transportation" },
    { pattern: /AIRBNB.*?(\d+)/i, vendor: "Airbnb", category: "Travel" },
    { pattern: /BOOKING.*?(\d+)/i, vendor: "Booking.com", category: "Travel" },
];

export const paypalEnricher: TransactionEnricher = {
    id: "paypal-vendor-extractor",
    description:
        "Extracts vendor information from PayPal transaction descriptions",

    matcher: (transaction: Transaction): boolean => {
        const participant = transaction.participantName.toLowerCase();
        return (
            participant.includes("paypal") ||
            transaction.participantIban.startsWith("LU")
        );
    },

    enrich: (transaction: Transaction): Transaction => {
        const purpose = transaction.purpose;

        // Try to match known vendor patterns
        for (const { pattern, vendor, category } of VENDOR_PATTERNS) {
            const match = purpose.match(pattern);
            if (match) {
                return {
                    ...transaction,
                    enrichment: {
                        enricherId: "paypal-vendor-extractor",
                        data: {
                            vendor,
                            category,
                            vendorId: match[1] || undefined,
                        },
                    },
                };
            }
        }

        // Try to extract vendor ID from generic PayPal format
        const genericMatch = purpose.match(/PP\*(\d+)\s+(.+?)(?:\s|$)/);
        if (genericMatch) {
            return {
                ...transaction,
                enrichment: {
                    enricherId: "paypal-vendor-extractor",
                    data: {
                        vendor: genericMatch[2].trim(),
                        paypalId: genericMatch[1],
                    },
                },
            };
        }

        // Fallback: try to extract any meaningful vendor name
        const vendorMatch = purpose.match(
            /(?:from|to|at)\s+([A-Za-z0-9\s&.-]+?)(?:\s+\d|$)/i
        );
        if (vendorMatch) {
            return {
                ...transaction,
                enrichment: {
                    enricherId: "paypal-vendor-extractor",
                    data: {
                        vendor: vendorMatch[1].trim(),
                    },
                },
            };
        }

        // No enrichment found, return original transaction
        return transaction;
    },
};
