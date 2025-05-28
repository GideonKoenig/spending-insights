export interface RawBankTransaction {
    accountName: string;
    accountIban: string;
    accountBic: string;
    bankName: string;
    bookingDate: Date;
    valueDate: Date;
    paymentParticipant: string;
    paymentParticipantIban: string;
    paymentParticipantBic: string;
    transactionType: string;
    purpose: string;
    amount: number;
    currency: string;
    balanceAfterTransaction: number;
    note: string;
    markedTransaction: string;
    creditorId: string;
    mandateReference: string;
}

export class CsvReader {
    private static parseGermanDate(dateStr: string): Date {
        const [day, month, year] = dateStr.split(".");
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    private static parseGermanAmount(amountStr: string): number {
        return parseFloat(amountStr.replace(",", "."));
    }

    static async readFromFile(filePath: string): Promise<RawBankTransaction[]> {
        const content = await Deno.readTextFile(filePath);
        return this.readFromString(content);
    }

    static readFromString(csvContent: string): RawBankTransaction[] {
        const lines = csvContent.trim().split("\n");
        const headers = lines[0].split(";");

        const transactions: RawBankTransaction[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(";");

            if (values.length !== headers.length) {
                console.warn(
                    `Line ${i + 1} has ${values.length} columns, expected ${
                        headers.length
                    }. Skipping.`
                );
                continue;
            }

            try {
                const transaction: RawBankTransaction = {
                    accountName: values[0] || "",
                    accountIban: values[1] || "",
                    accountBic: values[2] || "",
                    bankName: values[3] || "",
                    bookingDate: this.parseGermanDate(values[4]),
                    valueDate: this.parseGermanDate(values[5]),
                    paymentParticipant: values[6] || "",
                    paymentParticipantIban: values[7] || "",
                    paymentParticipantBic: values[8] || "",
                    transactionType: values[9] || "",
                    purpose: values[10] || "",
                    amount: this.parseGermanAmount(values[11]),
                    currency: values[12] || "",
                    balanceAfterTransaction: this.parseGermanAmount(values[13]),
                    note: values[14] || "",
                    markedTransaction: values[15] || "",
                    creditorId: values[16] || "",
                    mandateReference: values[17] || "",
                };

                transactions.push(transaction);
            } catch (error) {
                console.warn(`Failed to parse line ${i + 1}:`, error);
            }
        }

        return transactions;
    }
}
