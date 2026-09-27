import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MetricDetailView } from "./MetricDetailView";
import type { MetricDetailRecord } from "@/types/metrics";

vi.mock("./MetricHistoryChart", () => ({
  MetricHistoryChart: ({ metricName }: { metricName: string }) => <div data-testid="chart">{metricName} chart</div>,
}));

const records: MetricDetailRecord[] = [
  { date: "2026-01-01", total: 1000, entries: [{ id: "e1", name: "Walk", detail: "20 min", value: 1000 }] },
  { date: "2026-01-02", total: 1200, entries: [{ id: "e2", name: "Run", detail: "15 min", value: 1200 }] },
];

const baseProps = {
  title: "Steps",
  description: "Daily step count",
  unit: "steps",
  entryHeading: "Step activities",
};

describe("MetricDetailView", () => {
  it("shows a loading state", () => {
    render(<MetricDetailView {...baseProps} records={[]} loading error={null} />);
    expect(screen.getByText(/loading steps data\./i)).toBeInTheDocument();
  });

  it("shows an error state", () => {
    render(<MetricDetailView {...baseProps} records={[]} loading={false} error="Database unavailable" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Database unavailable");
  });

  it("shows an empty state when there are no records", () => {
    render(<MetricDetailView {...baseProps} records={[]} loading={false} error={null} />);
    expect(screen.getByText("No records are available for this metric.")).toBeInTheDocument();
  });

  it("renders the chart and entries newest-first when data is present", () => {
    const { container } = render(<MetricDetailView {...baseProps} records={records} loading={false} error={null} />);
    expect(screen.getByTestId("chart")).toHaveTextContent("Steps chart");
    expect(screen.getByText("2 entries")).toBeInTheDocument();

    const timeElements = container.querySelectorAll("time");
    expect(timeElements[0]).toHaveTextContent("January 2, 2026");
    expect(timeElements[1]).toHaveTextContent("January 1, 2026");
  });

  it("formats non-steps units with a unit suffix", () => {
    render(
      <MetricDetailView
        title="Move calories"
        description="Daily calories"
        unit="cal"
        entryHeading="Activities"
        records={records}
        loading={false}
        error={null}
      />,
    );
    expect(screen.getAllByText(/1,200 cal/).length).toBeGreaterThan(0);
  });
});
