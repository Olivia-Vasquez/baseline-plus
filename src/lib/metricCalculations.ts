import { DailyMetrics, Averages, Changes } from "@/types/metrics";
// import { demoMetrics } from "@/data/demoMetrics";

// Sort daily metrics with insertion sort algorithm
export function sortMetrics(values: DailyMetrics[]) {
    // Loop from the second element up to the last element
    for ( let i = 0; i < values.length; i++){
        const key = values[i];
        let j = i - 1;
        
        // Move elements of values[0..i-1] that are greater than key to one position ahead of their current position
        while ( j >= 0 && values[j].date > key.date) {
            values[j + 1] = values[j]
            j -= 1
        }   
        // Place the key at its correct position
        values[j + 1] = key
    }
    return values
}

export function calculateAverage(values: DailyMetrics[]) {
    let stepsTotal = 0;
    let moveTotal = 0;
    let restTotal = 0;
    let breatheTotal = 0;

    for (const metric of values) {
        stepsTotal += metric.steps;
        moveTotal += metric.moveCalories;
        restTotal += metric.restMinutes;
        breatheTotal += metric.breatheMinutes;
    }

    const count = values.length;
    const result: Averages = {
        steps: count ? Math.floor(stepsTotal / count) : 0,
        moveCalories: count ? Math.floor(moveTotal / count) : 0,
        restMinutes: count ? Math.floor(restTotal / count) : 0,
        breatheMinutes: count ? Math.floor(breatheTotal / count) : 0,
    };

    return result;
};

export function calculateChange(trend: Averages, today: DailyMetrics) {

    // Calculate and format changes based on today and trends
    const result: Changes = {
        steps : Math.floor(today.steps - trend.steps), 
        moveCalories :  Math.floor(today.moveCalories - trend.moveCalories), 
        restMinutes : Math.floor(today.restMinutes - trend.restMinutes), 
        breatheMinutes : Math.floor(today.breatheMinutes - trend.breatheMinutes)
    };

    return result;
};