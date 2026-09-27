export type Activity = {
  id: string;
  name: string;
  durationMinutes: number;
  calories: number;
};

export type DailyMetrics = {
  date: string;
  steps: number;
  moveCalories: number;
  restMinutes: number;
  breatheMinutes: number;
  readinessScore: number;
  activities: Activity[];
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
