import { parseLine } from "@/lib/csv-parser/utils";

export function anonymizeText(text: string) {
    return text.replace(/./g, (char) => {
        if (char >= "A" && char <= "Z") return "A";
        if (char >= "a" && char <= "z") return "a";
        if (char >= "0" && char <= "9") return "0";
        return char;
    });
}

export function anonymizeRow(row: string[]) {
    return row.map(anonymizeText);
}

export function extractSampleRows(csvContent: string, maxRows: number = 5) {
    const lines = csvContent.trim().split("\n");
    const dataLines = lines.slice(1, maxRows + 1);
    return dataLines.map((line) => parseLine(line));
}

export function anonymizeCsvSample(csvContent: string, maxRows: number = 5) {
    const sampleRows = extractSampleRows(csvContent, maxRows);
    const anonymizedRows = sampleRows.map(anonymizeRow);
    return anonymizedRows;
}

export function formatAnonymizedDataAsHtml(
    headers: string[],
    anonymizedRows: string[][]
) {
    const hasData = anonymizedRows.length > 0;
    const tableRows = hasData
        ? anonymizedRows
              .map(
                  (row) =>
                      `<tr>${row
                          .map(
                              (cell) =>
                                  `<td style="padding: 8px;">${
                                      cell || "<empty>"
                                  }</td>`
                          )
                          .join("")}</tr>`
              )
              .join("")
        : `<tr>${headers
              .map(
                  () =>
                      `<td style="padding: 8px; color: #888; font-style: italic;">no data</td>`
              )
              .join("")}</tr>`;

    return `
        <table border="1" style="border-collapse: collapse; margin: 10px 0;">
            <thead>
                <tr>
                    ${headers
                        .map(
                            (header) =>
                                `<th style="padding: 8px; background-color: #f5f5f5;">${header}</th>`
                        )
                        .join("")}
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
        <p><em>Note: ${
            hasData
                ? "Data has been anonymized using pattern preservation (A=uppercase, a=lowercase, 0=numbers, symbols preserved)"
                : "No sample data available - only headers shown"
        }</em></p>
    `;
}

export function formatAnonymizedDataAsCsv(
    headers: string[],
    anonymizedRows: string[][]
) {
    const escape = (value: string) => {
        const needsQuotes = /[",;\n]/.test(value);
        const escaped = value.replace(/"/g, '""');
        return needsQuotes ? `"${escaped}"` : escaped;
    };

    const headerLine = headers.map(escape).join(",");
    const dataLines = anonymizedRows.map((row) =>
        row.map((c) => escape(c || "")).join(",")
    );
    return [headerLine, ...dataLines].join("\n");
}
