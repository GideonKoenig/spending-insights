import { z } from "npm:zod";

export type Transaction = z.infer<typeof TransactionSchema>;
export const TransactionSchema = z.object({
    accountName: z.string(),
    accountIban: z.string(),
    accountBic: z.string(),
    bankName: z.string(),
    bookingDate: z.string().transform((v: string) => {
        const [day, month, year] = v.split(".");
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }),
    valueDate: z.string().transform((v: string) => {
        const [day, month, year] = v.split(".");
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }),
    paymentParticipant: z.string(),
    paymentParticipantIban: z.string(),
    paymentParticipantBic: z.string(),
    transactionType: z.string(),
    purpose: z.string(),
    amount: z
        .string()
        .transform((v: string) => parseFloat(v.replace(",", "."))),
    currency: z.string(),
    balanceAfterTransaction: z
        .string()
        .transform((v: string) => parseFloat(v.replace(",", "."))),
    note: z.string(),
    markedTransaction: z.string(),
    creditorId: z.string(),
    mandateReference: z.string(),
});

const keys = Object.keys(TransactionSchema.shape);

function readFromString(csvContent: string): Transaction[] {
    const lines = csvContent.trim().split("\n");
    const headers = lines[0].split(";");

    return lines
        .slice(1)
        .map((line, index) => {
            const values = line.split(";");
            if (values.length !== headers.length) {
                console.warn(
                    `Line ${index + 2} has ${values.length} columns, expected ${
                        headers.length
                    }. Skipping.`
                );
                return null;
            }
            const transaction = keys.reduce((acc, key, index) => {
                acc[key] = values[index]!;
                return acc;
            }, {} as Record<string, string>);
            const result = TransactionSchema.safeParse(transaction);
            if (!result.success) {
                console.warn(
                    `Failed to parse line ${index + 2}:`,
                    result.error.issues.map((issue) => issue.message).join(", ")
                );
                return null;
            }
            return result.data;
        })
        .filter(
            (transaction): transaction is Transaction => transaction !== null
        );
}

async function readFromFile(filePath: string): Promise<Transaction[]> {
    const content = await Deno.readTextFile(filePath);
    return readFromString(content);
}

export const CsvReader = {
    readFromFile,
    readFromString,
};
