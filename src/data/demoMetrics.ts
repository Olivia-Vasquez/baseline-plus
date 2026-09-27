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
        stepActivities: [
            { id: "2026-08-25-run-steps", name: "Outdoor run", durationMinutes: 28, steps: 3240 },
            { id: "2026-08-25-walk-steps", name: "Walks", durationMinutes: 49, steps: 5000 },
        ],
        restPeriods: [
            { id: "2026-08-25-sleep", name: "Overnight sleep", durationMinutes: 452 },
            { id: "2026-08-25-nap", name: "Afternoon rest", durationMinutes: 40 },
        ],
        breathworkSessions: [
            { id: "2026-08-25-box-breathing", name: "Box breathing", durationMinutes: 6 },
            { id: "2026-08-25-guided", name: "Guided breathing", durationMinutes: 4 },
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
        stepActivities: [
            { id: "2026-08-05-walk-steps", name: "Brisk walk", durationMinutes: 24, steps: 3100 },
            { id: "2026-08-05-errands", name: "Daily walking", durationMinutes: 38, steps: 2501 },
        ],
        restPeriods: [
            { id: "2026-08-05-sleep", name: "Overnight sleep", durationMinutes: 614 },
            { id: "2026-08-05-rest", name: "Quiet rest", durationMinutes: 60 },
        ],
        breathworkSessions: [
            { id: "2026-08-05-guided", name: "Guided breathing", durationMinutes: 8 },
            { id: "2026-08-05-box", name: "Box breathing", durationMinutes: 4 },
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
        stepActivities: [
            { id: "2026-07-29-hike-steps", name: "Trail hike", durationMinutes: 70, steps: 7245 },
            { id: "2026-07-29-daily", name: "Daily walking", durationMinutes: 36, steps: 3000 },
        ],
        restPeriods: [
            { id: "2026-07-29-sleep", name: "Overnight sleep", durationMinutes: 492 },
        ],
        breathworkSessions: [
            { id: "2026-07-29-guided", name: "Guided breathing", durationMinutes: 6 },
        ],
    }
];