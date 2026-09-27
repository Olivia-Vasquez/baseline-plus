import Link from "next/link";
import styles from "./page.module.css";
import { MoveCaloriesChart } from "@/components/MoveCaloriesChart";
import { demoMetrics } from "@/data/demoMetrics";
import { sortMetrics } from "@/lib/metricCalculations";

const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export default function MoveCaloriesDetails() {
  const records = sortMetrics([...demoMetrics]);
  const newestFirst = [...records].reverse();
  const activityCount = records.reduce((count, record) => count + record.activities.length, 0);
  const firstDate = records[0]?.date;
  const latestDate = records[records.length - 1]?.date;

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <Link className={styles.backLink} href="/home">Back to dashboard</Link>

        <header className={styles.header}>
          <p className={styles.eyebrow}>METRIC DETAILS</p>
          <h1>Move calories</h1>
          <p className={styles.description}>Daily calories attributed to recorded activity.</p>
        </header>

        <section className={styles.chartPanel} aria-labelledby="chart-title">
          <div className={styles.chartHeading}>
            <div>
              <p className={styles.eyebrow}>DAILY TOTAL</p>
              <h2 id="chart-title">Calories over time</h2>
            </div>
            {firstDate && latestDate && (
              <p className={styles.dateRange}>{formatDate(firstDate)} - {formatDate(latestDate)}</p>
            )}
          </div>
          <MoveCaloriesChart data={records.map(({ date, moveCalories }) => ({ date, moveCalories }))} />
        </section>

        <section className={styles.activities} aria-labelledby="activities-title">
          <div className={styles.activitiesHeading}>
            <div>
              <p className={styles.eyebrow}>CALORIE CONTRIBUTIONS</p>
              <h2 id="activities-title">Activities</h2>
            </div>
            <p className={styles.activityCount}>{activityCount} activities</p>
          </div>

          <div className={styles.recordList}>
            {newestFirst.map((record) => (
              <article className={styles.record} key={record.date}>
                <header className={styles.recordHeading}>
                  <time dateTime={record.date}>{formatDate(record.date)}</time>
                  <p>{record.moveCalories.toLocaleString("en-US")} kcal</p>
                </header>
                <ul className={styles.activityList}>
                  {record.activities.map((activity) => (
                    <li className={styles.activity} key={activity.id}>
                      <div>
                        <p className={styles.activityName}>{activity.name}</p>
                        <p className={styles.activityDuration}>{activity.durationMinutes} min</p>
                      </div>
                      <p className={styles.activityCalories}>
                        {activity.calories.toLocaleString("en-US")} kcal
                      </p>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}