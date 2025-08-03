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
    return dataLines.map((line) =>
        line.split(";").map((field) => field.trim().replace(/^"(.*)"$/, "$1"))
    );
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
                ${anonymizedRows
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
                    .join("")}
            </tbody>
        </table>
        <p><em>Note: Data has been anonymized using pattern preservation (A=uppercase, a=lowercase, 0=numbers, symbols preserved)</em></p>
    `;
}
