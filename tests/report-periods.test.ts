import { describe, expect, it } from "vitest";
import {
  normalizeAmount,
  reportPeriodLabel,
} from "@/lib/ledger/report-periods";

describe("report periods", () => {
  it("keeps Monday based weeks together across ISO year boundaries", () => {
    expect(reportPeriodLabel("2020-12-31", "week")).toBe("2020 W53");
    expect(reportPeriodLabel("2021-01-01", "week")).toBe("2020 W53");
    expect(reportPeriodLabel("2021-01-04", "week")).toBe("2021 W01");
  });

  it("normalizes full calendar months to exact monthly amounts", () => {
    expect(normalizeAmount(450_000, "2026-01-01", "2026-10-31", "month")).toBe(
      45_000,
    );
  });

  it("weights partial months by their covered calendar days", () => {
    expect(normalizeAmount(15_000, "2026-02-15", "2026-03-31", "month")).toBe(
      10_000,
    );
  });

  it("counts calendar days in UTC across daylight saving changes", () => {
    expect(normalizeAmount(700, "2026-03-23", "2026-03-29", "week")).toBe(700);
  });

  it("normalizes a complete leap year as one year", () => {
    expect(normalizeAmount(12_000, "2024-01-01", "2024-12-31", "year")).toBe(
      12_000,
    );
  });
});
