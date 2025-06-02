import { type Result, newError } from "@/lib/utils";
import { z } from "zod";
import { type Transaction } from "@/lib/types";

export const ColumnMappingSchema = z.record(z.string(), z.string());
export type HeaderMapping = Record<string, keyof Transaction>;

export function mapHeaders(
    originalHeaders: string[],
    headerMapping: HeaderMapping
): Result<string[]> {
    const missingHeader = originalHeaders.find(
        (header) => !headerMapping[header]
    );
    if (missingHeader) {
        return newError(`No mapping found for column: "${missingHeader}"`);
    }

    const mappedHeaders = originalHeaders.map(
        (header) => headerMapping[header]
    );
    return { success: true, value: mappedHeaders };
}

export function findMapping(headers: string[]): HeaderMapping | null {
    return (
        MAPPING_REGISTRY.find((mapping) => {
            const mappingKeys = Object.keys(mapping);
            const hasAllKeys = headers.every((header) =>
                mappingKeys.includes(header)
            );
            const hasSameLength = mappingKeys.length === headers.length;
            return hasAllKeys && hasSameLength;
        }) || null
    );
}

export const GERMAN_BANK_MAPPING: HeaderMapping = {
    "Bezeichnung Auftragskonto": "accountName",
    "IBAN Auftragskonto": "accountIban",
    "BIC Auftragskonto": "accountBic",
    "Bankname Auftragskonto": "bankName",
    Buchungstag: "bookingDate",
    Valutadatum: "valueDate",
    "Name Zahlungsbeteiligter": "paymentParticipant",
    "IBAN Zahlungsbeteiligter": "paymentParticipantIban",
    "BIC (SWIFT-Code) Zahlungsbeteiligter": "paymentParticipantBic",
    Buchungstext: "transactionType",
    Verwendungszweck: "purpose",
    Betrag: "amount",
    Waehrung: "currency",
    "Saldo nach Buchung": "balanceAfterTransaction",
    Bemerkung: "note",
    "Gekennzeichneter Umsatz": "markedTransaction",
    "Glaeubiger ID": "creditorId",
    Mandatsreferenz: "mandateReference",
};

const MAPPING_REGISTRY: HeaderMapping[] = [GERMAN_BANK_MAPPING];
