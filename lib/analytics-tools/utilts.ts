import { MONTHS } from "@/lib/analytics-tools/types";

export function getDateKey(date: Date) {
    return date.getTime();
}

export function getMonthById(id: number) {
    return MONTHS.find((month) => month.id === id);
}

export function formatDate(date: Date) {
    return (
        getMonthById(date.getMonth())!.short +
        " " +
        date.getFullYear().toString().slice(-2)
    );
}
