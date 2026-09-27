"use client";

import { MetricDetailView } from "@/components/MetricDetailView";
import { sortMetrics } from "@/lib/metricCalculations";
import { useDailyMetrics } from "@/lib/useDailyMetrics";

export default function BreathworkDetails() {
  const { metrics: dailyMetrics, loading, error } = useDailyMetrics();
  const records = sortMetrics([...dailyMetrics]).map((record) => ({
    date: record.date,
    total: record.breatheMinutes,
    entries: record.breathworkSessions.map((session) => ({
      id: session.id,
      name: session.name,
      detail: record.source === "import" ? "Breakdown not included in CSV" : `${session.durationMinutes} min session`,
      value: session.durationMinutes,
    })),
  }));

  return (
    <MetricDetailView
      title="Breathwork"
      description="Daily breathwork practice, broken down by session."
      unit="min"
      entryHeading="Breathwork sessions"
      records={records}
      loading={loading}
      error={error}
    />
  );
}