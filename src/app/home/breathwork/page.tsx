import { MetricDetailView } from "@/components/MetricDetailView";
import { demoMetrics } from "@/data/demoMetrics";
import { sortMetrics } from "@/lib/metricCalculations";

export default function BreathworkDetails() {
  const records = sortMetrics([...demoMetrics]).map((record) => ({
    date: record.date,
    total: record.breatheMinutes,
    entries: record.breathworkSessions.map((session) => ({
      id: session.id,
      name: session.name,
      detail: `${session.durationMinutes} min session`,
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
    />
  );
}