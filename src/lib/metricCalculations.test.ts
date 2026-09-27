import { describe, expect, it } from "vitest";
import { sortMetrics, calculateTrend, calculateChange } from "./metricCalculations";
import type { Averages, DailyMetrics } from "@/types/metrics";

const makeMetric = (date: string, overrides: Partial<DailyMetrics> = {}): DailyMetrics => ({
  date,
  steps: 0,
  moveCalories: 0,
  restMinutes: 0,
  breatheMinutes: 0,
  readinessScore: 0,
  activities: [],
  stepActivities: [],
  restPeriods: [],
  breathworkSessions: [],
  ...overrides,
});

describe("sortMetrics", () => {
  it("returns an empty array unchanged", () => {
    expect(sortMetrics([])).toEqual([]);
  });

  it("returns a single-item array unchanged", () => {
    const values = [makeMetric("2026-01-01")];
    expect(sortMetrics(values)).toEqual([makeMetric("2026-01-01")]);
  });

  it("sorts out-of-order dates ascending", () => {
    const values = [makeMetric("2026-01-03"), makeMetric("2026-01-01"), makeMetric("2026-01-02")];
    expect(sortMetrics(values).map((v) => v.date)).toEqual(["2026-01-01", "2026-01-02", "2026-01-03"]);
  });

  it("keeps already-sorted dates in order", () => {
    const values = [makeMetric("2026-01-01"), makeMetric("2026-01-02")];
    expect(sortMetrics(values).map((v) => v.date)).toEqual(["2026-01-01", "2026-01-02"]);
  });
});

describe("calculateTrend", () => {
  it("returns all-null trends for an empty array", () => {
    expect(calculateTrend([])).toEqual({
      steps: null,
      moveCalories: null,
      restMinutes: null,
      breatheMinutes: null,
    });
  });

  it("returns all-null trends for a single record", () => {
    const values = [makeMetric("2026-01-01", { steps: 100 })];
    expect(calculateTrend(values)).toEqual({
      steps: null,
      moveCalories: null,
      restMinutes: null,
      breatheMinutes: null,
    });
  });

  it("computes the difference between the latest and previous record", () => {
    const values = [
      makeMetric("2026-01-01", { steps: 1000, moveCalories: 200, restMinutes: 30, breatheMinutes: 10 }),
      makeMetric("2026-01-02", { steps: 1200, moveCalories: 150, restMinutes: 30, breatheMinutes: 15 }),
    ];
    expect(calculateTrend(values)).toEqual({
      steps: 200,
      moveCalories: -50,
      restMinutes: 0,
      breatheMinutes: 5,
    });
  });

  it("uses the two most recent records when given more than two, regardless of input order", () => {
    const values = [
      makeMetric("2026-01-03", { steps: 500 }),
      makeMetric("2026-01-01", { steps: 100 }),
      makeMetric("2026-01-02", { steps: 300 }),
    ];
    expect(calculateTrend(values).steps).toBe(200);
  });
});

describe("calculateChange", () => {
  const trend: Averages = { steps: 1000, moveCalories: 300, restMinutes: 40, breatheMinutes: 10 };

  it("returns a positive change when today exceeds the average", () => {
    const today = makeMetric("2026-01-01", { steps: 1500, moveCalories: 350, restMinutes: 45, breatheMinutes: 12 });
    expect(calculateChange(trend, today)).toEqual({
      steps: 500,
      moveCalories: 50,
      restMinutes: 5,
      breatheMinutes: 2,
    });
  });

  it("returns a negative change when today is below the average", () => {
    const today = makeMetric("2026-01-01", { steps: 800, moveCalories: 250, restMinutes: 30, breatheMinutes: 8 });
    expect(calculateChange(trend, today)).toEqual({
      steps: -200,
      moveCalories: -50,
      restMinutes: -10,
      breatheMinutes: -2,
    });
  });

  it("returns zero when today matches the average", () => {
    const today = makeMetric("2026-01-01", { steps: 1000, moveCalories: 300, restMinutes: 40, breatheMinutes: 10 });
    expect(calculateChange(trend, today)).toEqual({
      steps: 0,
      moveCalories: 0,
      restMinutes: 0,
      breatheMinutes: 0,
    });
  });

  it("floors fractional differences", () => {
    const fractionalTrend: Averages = { steps: 100.5, moveCalories: 0, restMinutes: 0, breatheMinutes: 0 };
    const today = makeMetric("2026-01-01", { steps: 101 });
    expect(calculateChange(fractionalTrend, today).steps).toBe(Math.floor(101 - 100.5));
  });
});
