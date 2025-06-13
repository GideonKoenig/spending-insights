export function parseLine(line: string) {
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

export function createRecord(headers: string[], values: string[]) {
    return headers.reduce((record, header, index) => {
        record[header] = values[index]!;
        return record;
    }, {} as Record<string, string>);
}
