import "server-only";

import { randomUUID } from "node:crypto";
import { getDatabasePool } from "@/lib/database";
import type { Averages, DailyMetrics } from "@/types/metrics";

type MetricRow = {
  id: string;
  metric_date: string;
  steps: number;
  move_calories: number;
  rest_minutes: number;
  breathwork_minutes: number;
  readiness_score: number;
  source: "demo" | "import" | "manual";
};

type ContributionRow = {
  id: string;
  daily_metric_id: string;
  metric_type: "move_calories" | "steps" | "rest" | "breathwork";
  name: string;
  duration_minutes: number;
  quantity: number;
};

export class DuplicateMetricDateError extends Error {
  constructor() {
    super("One or more dates already have a record. No records were imported.");
    this.name = "DuplicateMetricDateError";
  }
}

const queryLimit = 365;

export async function readDailyMetrics(userId: string): Promise<DailyMetrics[]> {
  const pool = getDatabasePool();
  const metricResult = await pool.query<MetricRow>(
    `SELECT id, metric_date::text, steps, move_calories, rest_minutes,
            breathwork_minutes, readiness_score, source
       FROM daily_metrics
      WHERE user_id = $1
      ORDER BY metric_date DESC
      LIMIT $2`,
    [userId, queryLimit],
  );

  if (metricResult.rows.length === 0) {
    return [];
  }

  const metricRows = [...metricResult.rows].reverse();
  const ids = metricRows.map((row) => row.id);
  const contributionResult = await pool.query<ContributionRow>(
    `SELECT id, daily_metric_id, metric_type, name, duration_minutes, quantity
       FROM metric_contributions
      WHERE daily_metric_id = ANY($1::uuid[])
      ORDER BY created_at, id`,
    [ids],
  );

  const recordById = new Map<string, DailyMetrics>();
  for (const row of metricRows) {
    recordById.set(row.id, {
      date: row.metric_date,
      source: row.source,
      steps: row.steps,
      moveCalories: row.move_calories,
      restMinutes: row.rest_minutes,
      breatheMinutes: row.breathwork_minutes,
      readinessScore: row.readiness_score,
      activities: [],
      stepActivities: [],
      restPeriods: [],
      breathworkSessions: [],
    });
  }

  for (const contribution of contributionResult.rows) {
    const record = recordById.get(contribution.daily_metric_id);
    if (!record) {
      continue;
    }

    if (contribution.metric_type === "move_calories") {
      record.activities.push({
        id: contribution.id,
        name: contribution.name,
        durationMinutes: contribution.duration_minutes,
        calories: contribution.quantity,
      });
    } else if (contribution.metric_type === "steps") {
      record.stepActivities.push({
        id: contribution.id,
        name: contribution.name,
        durationMinutes: contribution.duration_minutes,
        steps: contribution.quantity,
      });
    } else if (contribution.metric_type === "rest") {
      record.restPeriods.push({
        id: contribution.id,
        name: contribution.name,
        durationMinutes: contribution.duration_minutes,
      });
    } else {
      record.breathworkSessions.push({
        id: contribution.id,
        name: contribution.name,
        durationMinutes: contribution.duration_minutes,
      });
    }
  }

  return metricRows.map((row) => recordById.get(row.id)!);
}

export async function readMetricAverages(userId: string): Promise<Averages> {
  const pool = getDatabasePool();
  const result = await pool.query<Averages>(
    `SELECT COALESCE(FLOOR(AVG(steps)), 0)::INTEGER AS steps,
            COALESCE(FLOOR(AVG(move_calories)), 0)::INTEGER AS "moveCalories",
            COALESCE(FLOOR(AVG(rest_minutes)), 0)::INTEGER AS "restMinutes",
            COALESCE(FLOOR(AVG(breathwork_minutes)), 0)::INTEGER AS "breatheMinutes"
       FROM daily_metrics
      WHERE user_id = $1`,
    [userId],
  );

  return result.rows[0];
}

type InsertContribution = {
  id: string;
  dailyMetricId: string;
  metricType: ContributionRow["metric_type"];
  name: string;
  durationMinutes: number;
  quantity: number;
};

const getContributions = (metric: DailyMetrics, dailyMetricId: string): InsertContribution[] => [
  ...metric.activities.map((activity) => ({
    id: randomUUID(),
    dailyMetricId,
    metricType: "move_calories" as const,
    name: activity.name,
    durationMinutes: activity.durationMinutes,
    quantity: activity.calories,
  })),
  ...metric.stepActivities.map((activity) => ({
    id: randomUUID(),
    dailyMetricId,
    metricType: "steps" as const,
    name: activity.name,
    durationMinutes: activity.durationMinutes,
    quantity: activity.steps,
  })),
  ...metric.restPeriods.map((period) => ({
    id: randomUUID(),
    dailyMetricId,
    metricType: "rest" as const,
    name: period.name,
    durationMinutes: period.durationMinutes,
    quantity: period.durationMinutes,
  })),
  ...metric.breathworkSessions.map((session) => ({
    id: randomUUID(),
    dailyMetricId,
    metricType: "breathwork" as const,
    name: session.name,
    durationMinutes: session.durationMinutes,
    quantity: session.durationMinutes,
  })),
];

export async function insertDailyMetrics(userId: string, metrics: DailyMetrics[]): Promise<number> {
  const pool = getDatabasePool();
  const client = await pool.connect();
  const metricIds = metrics.map(() => randomUUID());
  const sources = metrics.map((metric) => metric.source ?? "import");

  try {
    await client.query("BEGIN");
    const insertedMetrics = await client.query<{ metric_date: string }>(
      `INSERT INTO daily_metrics (
          id, user_id, metric_date, steps, move_calories, rest_minutes,
          breathwork_minutes, readiness_score, source
       )
       SELECT * FROM UNNEST(
          $1::uuid[], $2::uuid[], $3::date[], $4::integer[], $5::integer[],
          $6::integer[], $7::integer[], $8::smallint[], $9::text[]
       )
       ON CONFLICT (user_id, metric_date) DO NOTHING
       RETURNING metric_date::text`,
      [
        metricIds,
        metrics.map(() => userId),
        metrics.map((metric) => metric.date),
        metrics.map((metric) => metric.steps),
        metrics.map((metric) => metric.moveCalories),
        metrics.map((metric) => metric.restMinutes),
        metrics.map((metric) => metric.breatheMinutes),
        metrics.map((metric) => metric.readinessScore),
        sources,
      ],
    );

    if (insertedMetrics.rows.length !== metrics.length) {
      throw new DuplicateMetricDateError();
    }

    const contributions = metrics.flatMap((metric, index) => getContributions(metric, metricIds[index]));
    if (contributions.length > 0) {
      await client.query(
        `INSERT INTO metric_contributions (
            id, daily_metric_id, metric_type, name, duration_minutes, quantity
         )
         SELECT * FROM UNNEST(
            $1::uuid[], $2::uuid[], $3::text[], $4::text[], $5::integer[], $6::integer[]
         )`,
        [
          contributions.map((entry) => entry.id),
          contributions.map((entry) => entry.dailyMetricId),
          contributions.map((entry) => entry.metricType),
          contributions.map((entry) => entry.name),
          contributions.map((entry) => entry.durationMinutes),
          contributions.map((entry) => entry.quantity),
        ],
      );
    }

    await client.query("COMMIT");
    return insertedMetrics.rows.length;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}