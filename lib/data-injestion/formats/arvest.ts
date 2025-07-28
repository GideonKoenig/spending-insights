import { DataInjestFormat } from "@/lib/data-injestion/types";
import { parseAmount } from "@/lib/data-injestion/utils";
import { Transaction } from "@/lib/types";
import { z } from "zod";

const ArvestSchema = z.object({
    Account: z.string(),
    Date: z.string(),
    "Pending?": z.string(),
    Description: z.string(),
    Category: z.string(),
    Check: z.string(),
    Credit: z.string(),
    Debit: z.string(),
});

function extractParticipantName(description: string): string {
    if (!description) return "";

    // Remove common prefixes and extract the main merchant/participant name
    // This handles common US bank description formats
    let cleaned = description.trim();

    // Remove common transaction codes/prefixes
    cleaned = cleaned.replace(
        /^(POS|ATM|ACH|CHECK|WIRE|TRANSFER|DEPOSIT|WITHDRAWAL|PAYMENT)\s*/i,
        ""
    );

    // Extract merchant name (usually first part before additional details)
    // Look for patterns like "MERCHANT NAME 123456789" or "MERCHANT NAME CITY ST"
    const merchantMatch = cleaned.match(
        /^([A-Za-z0-9\s&.'-]+?)(?:\s+\d{6,}|\s+[A-Z]{2,3}\s*\d|\s+\*|\s+#|$)/
    );
    if (merchantMatch) {
        return merchantMatch[1].trim();
    }

    // Fallback: take first 40 characters as participant name
    return cleaned.substring(0, 40).trim();
}

function determineTransactionType(
    element: z.infer<typeof ArvestSchema>,
    amount: number
): string {
    // If there's a check number, it's a check transaction
    if (element.Check && element.Check.trim()) {
        return "Check";
    }

    const description = element.Description?.toUpperCase() || "";

    // Parse description for transaction type indicators
    if (description.includes("ATM")) {
        return "ATM Withdrawal";
    }

    if (description.includes("POS") || description.includes("DEBIT CARD")) {
        return "POS Transaction";
    }

    if (description.includes("ACH")) {
        if (amount > 0) {
            return "ACH Credit";
        } else {
            return "ACH Debit";
        }
    }

    if (description.includes("WIRE")) {
        if (amount > 0) {
            return "Wire Credit";
        } else {
            return "Wire Debit";
        }
    }

    if (description.includes("TRANSFER")) {
        if (amount > 0) {
            return "Transfer In";
        } else {
            return "Transfer Out";
        }
    }

    if (description.includes("DEPOSIT")) {
        return "Deposit";
    }

    if (description.includes("WITHDRAWAL")) {
        return "Withdrawal";
    }

    if (description.includes("FEE") || description.includes("CHARGE")) {
        return "Fee";
    }

    if (description.includes("INTEREST")) {
        return "Interest";
    }

    if (description.includes("DIVIDEND")) {
        return "Dividend";
    }

    if (
        description.includes("DIRECT DEPOSIT") ||
        description.includes("PAYROLL")
    ) {
        return "Direct Deposit";
    }

    if (description.includes("ONLINE") || description.includes("ELECTRONIC")) {
        if (amount > 0) {
            return "Electronic Credit";
        } else {
            return "Electronic Payment";
        }
    }

    // Fallback to generic types based on amount direction
    if (amount > 0) {
        return "Credit";
    } else {
        return "Debit";
    }
}

function buildTransactionPurpose(
    description: string,
    category: string,
    checkNumber: string,
    pending: string
): string {
    const parts = [];

    if (category && category.toLowerCase() !== "uncategorized") {
        parts.push(`[${category}]`);
    }

    if (description) {
        parts.push(description);
    }

    if (checkNumber && checkNumber.trim()) {
        parts.push(`Check #${checkNumber}`);
    }

    if (pending && pending.toLowerCase() === "yes") {
        parts.push("(Pending)");
    }

    return parts.join(" ");
}

function map(elements: z.infer<typeof ArvestSchema>[]) {
    const result: Omit<Transaction, "hash">[] = [];

    for (const element of elements) {
        // Skip rows with no meaningful transaction data
        if (!element.Date || (!element.Credit && !element.Debit)) {
            continue;
        }

        const creditAmount = element.Credit ? parseAmount(element.Credit) : 0;
        const debitAmount = element.Debit ? parseAmount(element.Debit) : 0;

        // Calculate net amount: Credits are positive, Debits are negative
        const amount = creditAmount - debitAmount;

        // Skip zero-amount transactions unless they have meaningful description
        if (amount === 0 && !element.Description?.trim()) {
            continue;
        }

        const bookingDate = new Date(element.Date);
        const participantName = extractParticipantName(element.Description);
        const purpose = buildTransactionPurpose(
            element.Description,
            element.Category,
            element.Check,
            element["Pending?"]
        );
        const transactionType = determineTransactionType(element, amount);

        const transaction: Omit<Transaction, "hash"> = {
            bookingDate,
            valueDate: bookingDate, // Use same date for both since Arvest doesn't provide separate value date
            participantName,
            participantIban: "",
            participantBic: "",
            transactionType,
            purpose,
            amount,
            currency: "USD",
            balanceAfterTransaction: 0,
        };

        result.push(transaction);
    }

    // Sort chronologically
    result.sort((a, b) => a.bookingDate.getTime() - b.bookingDate.getTime());

    // Calculate running balance
    let runningBalance = 0;
    for (const transaction of result) {
        runningBalance += transaction.amount;
        transaction.balanceAfterTransaction = runningBalance;
    }

    return result;
}

function getBankName() {
    return "Arvest";
}

export const Arvest: DataInjestFormat<typeof ArvestSchema> = {
    name: "arvest",
    displayName: "Arvest",
    schema: ArvestSchema,
    map,
    getBankName,
    note: "Arvest does not provide account balance information in their export format. We calculate a running balance starting from 0 before the first transaction. At a later point, there will be an option to set the starting balance manually.",
};
