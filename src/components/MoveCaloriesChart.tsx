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
import styles from "./MoveCaloriesChart.module.css";

type MoveCaloriesPoint = {
  date: string;
  moveCalories: number;
};

type MoveCaloriesChartProps = {
  data: MoveCaloriesPoint[];
};

const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export const MoveCaloriesChart = ({ data }: MoveCaloriesChartProps) => {
  const chartData = data.map(({ date, moveCalories }) => ({
    dateLabel: formatDate(date),
    moveCalories,
  }));

  return (
    <div className={styles.chart} role="img" aria-label="Move calories by recorded date">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 12, right: 12, left: 2, bottom: 0 }}>
          <defs>
            <linearGradient id="move-calories-fill" x1="0" y1="0" x2="0" y2="1">
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
            width={48}
          />
          <Tooltip
            cursor={{ stroke: "#9db4a8", strokeDasharray: "4 4" }}
            formatter={(value) => [`${Number(value).toLocaleString("en-US")} kcal`, "Move calories"]}
            contentStyle={{ borderColor: "#d8e1dc", borderRadius: 5, fontSize: 13 }}
          />
          <Area
            type="monotone"
            dataKey="moveCalories"
            name="Move calories"
            stroke="#2d725d"
            strokeWidth={3}
            fill="url(#move-calories-fill)"
            dot={{ fill: "#d57b58", stroke: "#ffffff", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};