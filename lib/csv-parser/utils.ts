export function parseLine(line: string) {
    // Auto-detect delimiter (supports ';' and ',') while respecting quotes
    const detectDelimiter = (text: string) => {
        let commaCount = 0;
        let semicolonCount = 0;
        let insideQuotes = false;
        for (let i = 0; i < text.length; i++) {
            const ch = text[i]!;
            if (ch === '"') {
                if (insideQuotes && text[i + 1] === '"') {
                    i++; // skip escaped quote
                } else {
                    insideQuotes = !insideQuotes;
                }
                continue;
            }
            if (!insideQuotes) {
                if (ch === ",") commaCount++;
                else if (ch === ";") semicolonCount++;
            }
        }
        if (semicolonCount > commaCount) return ";";
        if (commaCount > semicolonCount) return ",";
        // Fallbacks
        if (text.includes(";") && !text.includes(",")) return ";";
        if (text.includes(",") && !text.includes(";")) return ",";
        return ";";
    };

    const delimiter = detectDelimiter(line);

    const result: string[] = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i]!;
        if (ch === '"') {
            if (insideQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // consume escaped quote
            } else {
                insideQuotes = !insideQuotes;
            }
            continue;
        }

        if (ch === delimiter && !insideQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += ch;
        }
    }
    result.push(current.trim());

    return result;
}

export function createRecord(headers: string[], values: string[]) {
    return headers.reduce((record, header, index) => {
        record[header] = values[index]!;
        return record;
    }, {} as Record<string, string>);
}
