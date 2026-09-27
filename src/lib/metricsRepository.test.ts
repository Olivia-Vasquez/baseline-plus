import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DailyMetrics } from "@/types/metrics";

const queryMock = vi.fn();
const connectMock = vi.fn();

vi.mock("./database", () => ({
  getDatabasePool: () => ({
    query: queryMock,
    connect: connectMock,
  }),
}));

const { readDailyMetrics, readMetricAverages, insertDailyMetrics, DuplicateMetricDateError } = await import(
  "./metricsRepository"
);

const makeMetric = (date: string, overrides: Partial<DailyMetrics> = {}): DailyMetrics => ({
  date,
  steps: 1000,
  moveCalories: 200,
  restMinutes: 30,
  breatheMinutes: 10,
  readinessScore: 80,
  activities: [{ id: "a1", name: "Walk", durationMinutes: 20, calories: 200 }],
  stepActivities: [{ id: "s1", name: "Walk", durationMinutes: 20, steps: 1000 }],
  restPeriods: [{ id: "r1", name: "Nap", durationMinutes: 30 }],
  breathworkSessions: [{ id: "b1", name: "Breathe", durationMinutes: 10 }],
  ...overrides,
});

beforeEach(() => {
  queryMock.mockReset();
  connectMock.mockReset();
});

describe("readDailyMetrics", () => {
  it("returns an empty array when there are no metric rows", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });
    const result = await readDailyMetrics("user-1");
    expect(result).toEqual([]);
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it("assembles metrics with their contributions grouped by type", async () => {
    queryMock
      .mockResolvedValueOnce({
        rows: [
          {
            id: "metric-1",
            metric_date: "2026-01-01",
            steps: 1000,
            move_calories: 200,
            rest_minutes: 30,
            breathwork_minutes: 10,
            readiness_score: 80,
            source: "import",
          },
        ],
      })
      .mockResolvedValueOnce({
        rows: [
          { id: "c1", daily_metric_id: "metric-1", metric_type: "move_calories", name: "Walk", duration_minutes: 20, quantity: 200 },
          { id: "c2", daily_metric_id: "metric-1", metric_type: "steps", name: "Walk", duration_minutes: 20, quantity: 1000 },
          { id: "c3", daily_metric_id: "metric-1", metric_type: "rest", name: "Nap", duration_minutes: 30, quantity: 30 },
          { id: "c4", daily_metric_id: "metric-1", metric_type: "breathwork", name: "Breathe", duration_minutes: 10, quantity: 10 },
        ],
      });

    const result = await readDailyMetrics("user-1");
    expect(result).toHaveLength(1);
    expect(result[0].activities).toEqual([{ id: "c1", name: "Walk", durationMinutes: 20, calories: 200 }]);
    expect(result[0].stepActivities).toEqual([{ id: "c2", name: "Walk", durationMinutes: 20, steps: 1000 }]);
    expect(result[0].restPeriods).toEqual([{ id: "c3", name: "Nap", durationMinutes: 30 }]);
    expect(result[0].breathworkSessions).toEqual([{ id: "c4", name: "Breathe", durationMinutes: 10 }]);
  });
});

describe("readMetricAverages", () => {
  it("returns the averages row from the query result", async () => {
    const averages = { steps: 900, moveCalories: 250, restMinutes: 35, breatheMinutes: 12 };
    queryMock.mockResolvedValueOnce({ rows: [averages] });
    await expect(readMetricAverages("user-1")).resolves.toEqual(averages);
  });
});

describe("insertDailyMetrics", () => {
  const makeClient = () => ({
    query: vi.fn(),
    release: vi.fn(),
  });

  it("commits and returns the inserted count on success", async () => {
    const client = makeClient();
    connectMock.mockResolvedValueOnce(client);
    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [{ metric_date: "2026-01-01" }] }) // INSERT daily_metrics
      .mockResolvedValueOnce(undefined) // INSERT metric_contributions
      .mockResolvedValueOnce(undefined); // COMMIT

    const inserted = await insertDailyMetrics("user-1", [makeMetric("2026-01-01")]);
    expect(inserted).toBe(1);
    expect(client.query).toHaveBeenCalledWith("COMMIT");
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it("throws DuplicateMetricDateError and rolls back when a date already exists", async () => {
    const client = makeClient();
    connectMock.mockResolvedValueOnce(client);
    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [] }) // INSERT returns nothing -> conflict
      .mockResolvedValueOnce(undefined); // ROLLBACK

    await expect(insertDailyMetrics("user-1", [makeMetric("2026-01-01")])).rejects.toThrow(
      DuplicateMetricDateError,
    );
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it("rolls back and rethrows on unexpected query errors", async () => {
    const client = makeClient();
    connectMock.mockResolvedValueOnce(client);
    const dbError = new Error("connection lost");
    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockRejectedValueOnce(dbError) // INSERT fails
      .mockResolvedValueOnce(undefined); // ROLLBACK

    await expect(insertDailyMetrics("user-1", [makeMetric("2026-01-01")])).rejects.toThrow(dbError);
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it("inserts one contribution row per activity/step/rest/breathwork entry", async () => {
    const client = makeClient();
    connectMock.mockResolvedValueOnce(client);
    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [{ metric_date: "2026-01-01" }] }) // INSERT daily_metrics
      .mockResolvedValueOnce(undefined) // INSERT metric_contributions
      .mockResolvedValueOnce(undefined); // COMMIT

    await insertDailyMetrics("user-1", [makeMetric("2026-01-01")]);

    const contributionsCall = client.query.mock.calls.find(([sql]) =>
      typeof sql === "string" && sql.includes("INSERT INTO metric_contributions"),
    );
    expect(contributionsCall).toBeDefined();
    const [, params] = contributionsCall as [string, unknown[]];
    const metricTypes = params[2] as string[];
    expect(metricTypes.sort()).toEqual(["breathwork", "move_calories", "rest", "steps"]);
  });
});
