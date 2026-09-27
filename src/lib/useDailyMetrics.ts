"use client";

import { useEffect, useState } from "react";
import { demoMetrics } from "@/data/demoMetrics";
import { getAllDailyMetrics } from "@/lib/metricStorage";
import type { DailyMetrics } from "@/types/metrics";

export function useDailyMetrics(): DailyMetrics[] {
  const [metrics, setMetrics] = useState(demoMetrics);

  useEffect(() => {
    const refreshMetrics = () => setMetrics(getAllDailyMetrics());
    refreshMetrics();
    window.addEventListener("storage", refreshMetrics);
    window.addEventListener("baseline:metrics-updated", refreshMetrics);

    return () => {
      window.removeEventListener("storage", refreshMetrics);
      window.removeEventListener("baseline:metrics-updated", refreshMetrics);
    };
  }, []);

  return metrics;
}