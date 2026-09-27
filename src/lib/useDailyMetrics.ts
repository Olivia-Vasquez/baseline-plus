"use client";

import { useEffect, useState } from "react";
import type { Averages, DailyMetrics } from "@/types/metrics";

type MetricsResponse = {
  metrics: DailyMetrics[];
  averages: Averages;
};

const emptyAverages: Averages = {
  steps: 0,
  moveCalories: 0,
  restMinutes: 0,
  breatheMinutes: 0,
};

export function useDailyMetrics() {
  const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
  const [averages, setAverages] = useState<Averages>(emptyAverages);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const migrateLegacyImports = async () => {
      const legacyStorageKey = "baseline.importedMetrics.v1";
      const stored = window.localStorage.getItem(legacyStorageKey);
      if (!stored) {
        return;
      }

      const legacyMetrics: unknown = JSON.parse(stored);
      if (!Array.isArray(legacyMetrics)) {
        throw new Error("Previous browser-imported data could not be read. Its local copy was kept.");
      }
      if (legacyMetrics.length === 0) {
        window.localStorage.removeItem(legacyStorageKey);
        return;
      }

      const submit = (metricsToImport: unknown[]) => fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metricsToImport),
        signal: controller.signal,
      });
      const response = await submit(legacyMetrics);

      if (response.status === 409) {
        for (const legacyMetric of legacyMetrics) {
          const rowResponse = await submit([legacyMetric]);
          if (!rowResponse.ok && rowResponse.status !== 409) {
            const result = await rowResponse.json() as { error?: string };
            throw new Error(result.error ?? "Previous browser-imported data could not be migrated.");
          }
        }
      } else if (!response.ok) {
        const result = await response.json() as { error?: string };
        throw new Error(result.error ?? "Previous browser-imported data could not be migrated.");
      }

      window.localStorage.removeItem(legacyStorageKey);
    };

    const loadMetrics = async () => {
      try {
        await migrateLegacyImports();
        const response = await fetch("/api/metrics", { cache: "no-store", signal: controller.signal });
        const payload = await response.json() as MetricsResponse | { error?: string };
        if (!response.ok) {
          throw new Error("error" in payload && payload.error ? payload.error : "Could not load metrics.");
        }

        const data = payload as MetricsResponse;
        setMetrics(data.metrics);
        setAverages(data.averages);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === "AbortError") {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "Could not load metrics.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadMetrics();

    return () => controller.abort();
  }, [refreshKey]);

  return {
    metrics,
    averages,
    loading,
    error,
    refresh: () => {
      setLoading(true);
      setError(null);
      setRefreshKey((key) => key + 1);
    },
  };
}