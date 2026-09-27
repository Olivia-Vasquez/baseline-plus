import { DailyMetrics, Averages, Changes, Trends } from "@/types/metrics";

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

export function calculateTrend(values: DailyMetrics[]): Trends {
    const sortedValues = sortMetrics([...values]);
    const previousIndex = sortedValues.length - 2;

    if (previousIndex < 0) {
        return {
            steps: null,
            moveCalories: null,
            restMinutes: null,
            breatheMinutes: null,
        };
    }

    const previous = sortedValues[previousIndex];
    const latest = sortedValues[sortedValues.length - 1];

    return {
        steps: latest.steps - previous.steps,
        moveCalories: latest.moveCalories - previous.moveCalories,
        restMinutes: latest.restMinutes - previous.restMinutes,
        breatheMinutes: latest.breatheMinutes - previous.breatheMinutes,
    };
}

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