"use client";

import { MetricDetailView } from "@/components/MetricDetailView";
import { sortMetrics } from "@/lib/metricCalculations";
import { useDailyMetrics } from "@/lib/useDailyMetrics";

export default function MoveCaloriesDetails() {
  const { metrics: dailyMetrics, loading, error } = useDailyMetrics();
  const records = sortMetrics([...dailyMetrics]).map((record) => ({
    date: record.date,
    total: record.moveCalories,
    entries: record.activities.map((activity) => ({
      id: activity.id,
      name: activity.name,
      detail: record.source === "import" ? "Breakdown not included in CSV" : `${activity.durationMinutes} min`,
      value: activity.calories,
    })),
  }));

  return (
    <MetricDetailView
      title="Move calories"
      description="Daily calories attributed to recorded activity."
      unit="kcal"
      entryHeading="Activities"
      records={records}
      loading={loading}
      error={error}
    />
  );
}