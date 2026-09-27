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

    let stepsAvg = 1;
    let moveAvg = 1;
    let restAvg = 1;
    let breatheAvg = 1;

    const sortedValues = sortMetrics(values)

    // Calculate averages for each metric
    for (let i = 0; i < sortedValues.length; i++)
    {
        stepsAvg = (stepsAvg + sortedValues[i].steps)/(i+1);
        moveAvg = (moveAvg + sortedValues[i].moveCalories)/(i+1);
        restAvg = (restAvg + sortedValues[i].restMinutes)/(i+1);
        breatheAvg = (breatheAvg + sortedValues[i].breatheMinutes)/(i+1);

    }

    // Reformat averages and round for nice display
    const result: Averages = {
        steps : Math.floor(stepsAvg), 
        moveCalories :  Math.floor(moveAvg), 
        restMinutes : Math.floor(restAvg), 
        breatheMinutes : Math.floor(breatheAvg)
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