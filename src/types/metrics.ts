export type Activity = {
  id: string;
  name: string;
  durationMinutes: number;
  calories: number;
};

export type StepActivity = {
  id: string;
  name: string;
  durationMinutes: number;
  steps: number;
};

export type RestPeriod = {
  id: string;
  name: string;
  durationMinutes: number;
};

export type BreathworkSession = {
  id: string;
  name: string;
  durationMinutes: number;
};

export type MetricDetailEntry = {
  id: string;
  name: string;
  detail: string;
  value: number;
};

export type MetricDetailRecord = {
  date: string;
  total: number;
  entries: MetricDetailEntry[];
};

export type DailyMetrics = {
  date: string;
  steps: number;
  moveCalories: number;
  restMinutes: number;
  breatheMinutes: number;
  readinessScore: number;
  activities: Activity[];
  stepActivities: StepActivity[];
  restPeriods: RestPeriod[];
  breathworkSessions: BreathworkSession[];
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
