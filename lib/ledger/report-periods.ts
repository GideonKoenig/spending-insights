const dayMs = 86_400_000;

export type ReportGranularity = "week" | "month" | "quarter" | "year";
export type CategoryUnit = "total" | "day" | "week" | "month" | "year";

export function reportPeriodLabel(
  date: string,
  granularity: ReportGranularity,
) {
  const day = new Date(`${date}T00:00:00Z`);
  const year = day.getUTCFullYear();
  const month = day.getUTCMonth();

  if (granularity === "week") {
    const monday = new Date(day);
    monday.setUTCDate(monday.getUTCDate() - ((day.getUTCDay() + 6) % 7));
    const thursday = new Date(monday);
    thursday.setUTCDate(thursday.getUTCDate() + 3);
    const isoYear = thursday.getUTCFullYear();
    const januaryFourth = new Date(Date.UTC(isoYear, 0, 4));
    januaryFourth.setUTCDate(
      januaryFourth.getUTCDate() - ((januaryFourth.getUTCDay() + 6) % 7),
    );
    const week =
      Math.floor((monday.getTime() - januaryFourth.getTime()) / (7 * dayMs)) +
      1;
    return `${isoYear} W${String(week).padStart(2, "0")}`;
  }

  if (granularity === "year") return String(year);

  if (granularity === "quarter") return `${year} Q${Math.floor(month / 3) + 1}`;

  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function normalizeAmount(
  amount: number,
  from: string,
  to: string,
  unit: CategoryUnit,
) {
  return amount / normalizationFactor(from, to, unit);
}

export function normalizationFactor(
  from: string,
  to: string,
  unit: CategoryUnit,
) {
  if (unit === "total") return 1;

  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  const days = (end.getTime() - start.getTime()) / dayMs + 1;
  const units =
    unit === "day"
      ? days
      : unit === "week"
        ? days / 7
        : calendarUnits(start, end, unit);
  return units;
}

function calendarUnits(start: Date, end: Date, unit: "month" | "year") {
  let units = 0;
  const cursor =
    unit === "month"
      ? new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1))
      : new Date(Date.UTC(start.getUTCFullYear(), 0, 1));

  while (cursor <= end) {
    const next = new Date(cursor);
    if (unit === "month") next.setUTCMonth(next.getUTCMonth() + 1);
    else next.setUTCFullYear(next.getUTCFullYear() + 1);
    const periodEnd = next.getTime() - dayMs;
    const coveredStart = Math.max(start.getTime(), cursor.getTime());
    const coveredEnd = Math.min(end.getTime(), periodEnd);
    const periodDays = (periodEnd - cursor.getTime()) / dayMs + 1;
    units += ((coveredEnd - coveredStart) / dayMs + 1) / periodDays;
    cursor.setTime(next.getTime());
  }

  return units;
}
