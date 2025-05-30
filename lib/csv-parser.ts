import { type Result, newError } from "./utils";
import { z } from "zod";

function parseLine(line: string): string[] {
    return line
        .split(";")
        .map((field) => field.trim())
        .map((field) => {
            if (!field.startsWith('"') || !field.endsWith('"')) {
                return field;
            }
            return field.slice(1, -1).replace(/""/g, '"');
        });
}

function parseHeader(line: string): Result<string[]> {
    const headers = parseLine(line);

    if (headers.length === 0) {
        return newError("CSV header cannot be empty");
    }

    const uniqueHeaders = new Set(headers);
    if (uniqueHeaders.size !== headers.length) {
        return newError("CSV headers must be unique");
    }

    return { success: true, value: headers };
}

function createRecord(
    headers: string[],
    values: string[]
): Record<string, string> {
    return headers.reduce((record, header, index) => {
        record[header] = values[index] ?? "";
        return record;
    }, {} as Record<string, string>);
}

function validateRow<T extends z.ZodType>(
    schema: T,
    record: Record<string, string>,
    lineNumber: number
): Result<z.infer<T>> {
    const parseResult = schema.safeParse(record);

    if (!parseResult.success) {
        return newError(`Line ${lineNumber}: ${parseResult.error.message}`);
    }

    return { success: true, value: parseResult.data };
}

function parseContent<T extends z.ZodType>(
    content: string,
    schema: T
): Result<Array<z.infer<T>>> {
    const lines = content
        .trim()
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    if (lines.length < 2) {
        return newError(
            "CSV file must have at least a header and one data row"
        );
    }

    const headerResult = parseHeader(lines[0]);
    if (!headerResult.success) {
        return headerResult;
    }

    const headers = headerResult.value;
    const dataLines = lines.slice(1);
    const results = dataLines.map((line, index) => {
        const values = parseLine(line);
        if (values.length !== headers.length) {
            return newError<z.infer<T>>(
                `Line ${index + 2}: Expected ${headers.length} values but got ${
                    values.length
                }`
            );
        }

        const record = createRecord(headers, values);
        return validateRow(schema, record, index + 2);
    });

    const errors = results
        .filter(
            (result): result is { success: false; error: string } =>
                !result.success
        )
        .map((result) => result.error);

    if (errors.length > 0) {
        return newError<Array<z.infer<T>>>(errors.join("\n"));
    }

    return {
        success: true,
        value: results
            .filter(
                (result): result is { success: true; value: z.infer<T> } =>
                    result.success
            )
            .map((result) => result.value),
    };
}

export const csvParser = {
    parse: parseContent,
} as const;
