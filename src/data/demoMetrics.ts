import type { DailyMetrics } from "@/types/metrics";

export const demoMetrics: DailyMetrics[] = [
    {
        date: "2026-08-25",
        steps: 8240,
        moveCalories: 465,
        restMinutes: 492,
        breatheMinutes: 10,
        readinessScore: 78,
        activities: [
            { id: "2026-08-25-run", name: "Outdoor run", durationMinutes: 28, calories: 315 },
            { id: "2026-08-25-strength", name: "Strength training", durationMinutes: 35, calories: 100 },
            { id: "2026-08-25-walk", name: "Evening walk", durationMinutes: 15, calories: 50 },
        ],
    },
    {
        date: "2026-08-05",
        steps: 5601,
        moveCalories: 398,
        restMinutes: 674,
        breatheMinutes: 12,
        readinessScore: 86,
        activities: [
            { id: "2026-08-05-ride", name: "Indoor cycling", durationMinutes: 42, calories: 246 },
            { id: "2026-08-05-walk", name: "Brisk walk", durationMinutes: 24, calories: 92 },
            { id: "2026-08-05-strength", name: "Core training", durationMinutes: 20, calories: 60 },
        ],
    },
    {
        date: "2026-07-29",
        steps: 10245,
        moveCalories: 560,
        restMinutes: 492,
        breatheMinutes: 6,
        readinessScore: 65,
        activities: [
            { id: "2026-07-29-hike", name: "Trail hike", durationMinutes: 70, calories: 420 },
            { id: "2026-07-29-run", name: "Interval run", durationMinutes: 24, calories: 100 },
            { id: "2026-07-29-walk", name: "Recovery walk", durationMinutes: 16, calories: 40 },
        ],
    }
];