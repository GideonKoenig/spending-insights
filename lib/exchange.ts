export const CURRENCIES = ["EUR", "CAD", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const RATES_PER_EUR: Record<Currency, number> = {
    EUR: 1,
    CAD: 1.62,
    USD: 1.17,
};

export function convert(amount: number, from: Currency, to: Currency): number {
    if (from === to) return roundToCents(amount);
    const amountInEur = amount / RATES_PER_EUR[from];
    const amountInTarget = amountInEur * RATES_PER_EUR[to];
    return roundToCents(amountInTarget);
}

export function roundToCents(value: number): number {
    return Math.round(value * 100) / 100;
}

export function formatRateString(from: Currency, to: Currency): string {
    if (from === to) return `1 ${from} = 1 ${to}`;
    const rate = RATES_PER_EUR[to] / RATES_PER_EUR[from];
    const rounded = Math.round(rate * 100) / 100;
    return `1 ${from} = ${rounded} ${to}`;
}
