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

export type Changes = {
  steps: number;
  moveCalories: number;
  restMinutes: number;
  breatheMinutes: number;
}
