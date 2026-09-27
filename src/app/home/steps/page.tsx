import { MetricDetailView } from "@/components/MetricDetailView";
import { demoMetrics } from "@/data/demoMetrics";
import { sortMetrics } from "@/lib/metricCalculations";

export default function StepsDetails() {
  const records = sortMetrics([...demoMetrics]).map((record) => ({
    date: record.date,
    total: record.steps,
    entries: record.stepActivities.map((activity) => ({
      id: activity.id,
      name: activity.name,
      detail: `${activity.durationMinutes} min`,
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