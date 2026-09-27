"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MetricDetailRecord } from "@/types/metrics";
import styles from "./MetricHistoryChart.module.css";

type MetricHistoryChartProps = {
  data: MetricDetailRecord[];
  metricName: string;
  unit: string;
};

const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export const MetricHistoryChart = ({ data, metricName, unit }: MetricHistoryChartProps) => {
  const chartData = data.map(({ date, total }) => ({
    dateLabel: formatDate(date),
    total,
  }));

  return (
    <div className={styles.chart} role="img" aria-label={`${metricName} by recorded date`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 12, right: 12, left: 2, bottom: 0 }}>
          <defs>
            <linearGradient id="metric-history-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4c9a79" stopOpacity={0.34} />
              <stop offset="100%" stopColor="#4c9a79" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#d8e1dc" />
          <XAxis
            dataKey="dateLabel"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#687a73", fontSize: 12 }}
            tickMargin={10}
            minTickGap={24}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#687a73", fontSize: 12 }}
            tickFormatter={(value: number) => value.toLocaleString("en-US")}
            width={54}
          />
          <Tooltip
            cursor={{ stroke: "#9db4a8", strokeDasharray: "4 4" }}
            formatter={(value) => [`${Number(value).toLocaleString("en-US")} ${unit}`, metricName]}
            contentStyle={{ borderColor: "#d8e1dc", borderRadius: 5, fontSize: 13 }}
          />
          <Area
            type="monotone"
            dataKey="total"
            name={metricName}
            stroke="#2d725d"
            strokeWidth={3}
            fill="url(#metric-history-fill)"
            dot={{ fill: "#d57b58", stroke: "#ffffff", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};