"use client";

import { MetricDetailView } from "@/components/MetricDetailView";
import { sortMetrics } from "@/lib/metricCalculations";
import { useDailyMetrics } from "@/lib/useDailyMetrics";

export default function RestDetails() {
  const dailyMetrics = useDailyMetrics();
  const records = sortMetrics([...dailyMetrics]).map((record) => ({
    date: record.date,
    total: record.restMinutes,
    entries: record.restPeriods.map((period) => ({
      id: period.id,
      name: period.name,
      detail: record.source === "import" ? "Breakdown not included in CSV" : "Rest period",
      value: period.durationMinutes,
    })),
  }));

  return (
    <MetricDetailView
      title="Rest"
      description="Daily rest and sleep time, broken down by period."
      unit="min"
      entryHeading="Rest periods"
      records={records}
    />
  );
}