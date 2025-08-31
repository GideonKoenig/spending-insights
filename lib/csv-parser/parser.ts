import { newError, newSuccess } from "@/lib/utils";
import { z } from "zod";
import { createRecord, parseLine } from "@/lib/csv-parser/utils";

function getHeaders(text: string) {
    const firstLine = text.split("\n")[0];
    let headers = parseLine(firstLine);

    // drop trailing empty header cells - some formats seem to have extra delimiters as the end
    while (headers.length > 0 && headers[headers.length - 1] === "") {
        headers = headers.slice(0, -1);
    }

    if (headers.length === 0) {
        return newError("The CSV file is missing headers.");
    }

    const uniqueHeaders = new Set(headers);
    if (uniqueHeaders.size !== headers.length) {
        console.log(headers);
        console.log(uniqueHeaders);
        return newError("The CSV file contains duplicate headers.");
    }

    return newSuccess(headers);
}

function parse<T extends z.ZodObject<z.ZodRawShape>>(
    content: string,
    schema: T
) {
    const lines = content
        .trim()
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    if (lines.length < 2) return newError("The CSV file contains no data.");

    const headers = Object.keys(schema.shape);
    const dataLines = lines.slice(1);
    const results = dataLines.map((line, index) => {
        const values = parseLine(line).slice(0, headers.length);

        if (values.length !== headers.length) {
            return newError(
                `Row ${index + 2}: Expected ${headers.length} values but got ${
                    values.length
                }.`
            );
        }
        return createRecord(headers, values);
    });
    const arraySchema = z.array(schema);
    const parseResult = arraySchema.safeParse(results);
    if (!parseResult.success) return newError(parseResult.error.message);
    return newSuccess(parseResult.data);
}

export const CsvParser = {
    parse,
    getHeaders,
} as const;
