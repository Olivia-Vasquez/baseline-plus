export type DailyMetrics = {
  date: string;
  steps: number;
  moveCalories: number;
  restMinutes: number;
  breatheMinutes: number;
  readinessScore: number;
};

export type Averages = {
  steps: number;
  moveCalories: number;
  restMinutes: number;
  breatheMinutes: number;
}

export type Trends = {
  steps: number | null;
  moveCalories: number | null;
  restMinutes: number | null;
  breatheMinutes: number | null;
}

export type Changes = {
  steps: number;
  moveCalories: number;
  restMinutes: number;
  breatheMinutes: number;
}
