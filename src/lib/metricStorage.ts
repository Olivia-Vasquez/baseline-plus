import type { DailyMetrics } from "@/types/metrics";
import { demoMetrics } from "@/data/demoMetrics";
import { sortMetrics } from "@/lib/metricCalculations";

const importedMetricsKey = "baseline.importedMetrics.v1";

const isDailyMetrics = (value: unknown): value is DailyMetrics => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const metric = value as Partial<DailyMetrics>;
  return typeof metric.date === "string"
    && typeof metric.steps === "number"
    && typeof metric.moveCalories === "number"
    && typeof metric.restMinutes === "number"
    && typeof metric.breatheMinutes === "number"
    && typeof metric.readinessScore === "number"
    && Array.isArray(metric.activities)
    && Array.isArray(metric.stepActivities)
    && Array.isArray(metric.restPeriods)
    && Array.isArray(metric.breathworkSessions);
};

export function readImportedMetrics(): DailyMetrics[] {
  try {
    const stored = window.localStorage.getItem(importedMetricsKey);
    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isDailyMetrics) : [];
  } catch {
    return [];
  }
}

export function getAllDailyMetrics(): DailyMetrics[] {
  return sortMetrics([...demoMetrics, ...readImportedMetrics()]);
}

export function appendImportedMetrics(metrics: DailyMetrics[]) {
  const importedMetrics = [...readImportedMetrics(), ...metrics];
  window.localStorage.setItem(importedMetricsKey, JSON.stringify(importedMetrics));
  window.dispatchEvent(new Event("baseline:metrics-updated"));
}