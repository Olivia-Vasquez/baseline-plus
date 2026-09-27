"use client";

import { MetricDetailView } from "@/components/MetricDetailView";
import { sortMetrics } from "@/lib/metricCalculations";
import { useDailyMetrics } from "@/lib/useDailyMetrics";

export default function StepsDetails() {
  const dailyMetrics = useDailyMetrics();
  const records = sortMetrics([...dailyMetrics]).map((record) => ({
    date: record.date,
    total: record.steps,
    entries: record.stepActivities.map((activity) => ({
      id: activity.id,
      name: activity.name,
      detail: record.source === "import" ? "Breakdown not included in CSV" : `${activity.durationMinutes} min`,
      value: activity.steps,
    })),
  }));

  return (
    <MetricDetailView
      title="Steps"
      description="Daily steps attributed to recorded movement."
      unit="steps"
      entryHeading="Step activities"
      records={records}
    />
  );
}