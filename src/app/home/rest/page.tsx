import { MetricDetailView } from "@/components/MetricDetailView";
import { demoMetrics } from "@/data/demoMetrics";
import { sortMetrics } from "@/lib/metricCalculations";

export default function RestDetails() {
  const records = sortMetrics([...demoMetrics]).map((record) => ({
    date: record.date,
    total: record.restMinutes,
    entries: record.restPeriods.map((period) => ({
      id: period.id,
      name: period.name,
      detail: "Rest period",
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