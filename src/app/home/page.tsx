import styles from "./page.module.css";
import type { Averages, Changes } from "@/types/metrics";
import { demoMetrics } from "@/data/demoMetrics";
import { ReadinessGauge } from "@/components/readinessGauge";
import { calculateAverage, calculateChange } from "@/lib/metricCalculations";
import { MetricCard } from "@/components/MetricCard";

export default function Home() {
  const latest = demoMetrics.reduce((latestMetric, metric) =>
    metric.date > latestMetric.date ? metric : latestMetric,
  );
  const trends: Averages = calculateAverage(demoMetrics);
  const changes: Changes = calculateChange(trends, latest);
  const todayMetrics = [
    { label: "Steps", value: latest.steps.toLocaleString("en-US") },
    { label: "Move calories", value: latest.moveCalories.toLocaleString("en-US") },
    { label: "Rest (min)", value: latest.restMinutes.toLocaleString("en-US") },
    { label: "Breathwork (min)", value: latest.breatheMinutes.toLocaleString("en-US") },
  ];
  const trendMetrics = [
    { label: "Steps", value: trends.steps.toLocaleString("en-US") },
    { label: "Move calories", value: trends.moveCalories.toLocaleString("en-US") },
    { label: "Rest (min)", value: trends.restMinutes.toLocaleString("en-US") },
    { label: "Breathwork (min)", value: trends.breatheMinutes.toLocaleString("en-US") },
  ];
  const changeMetrics = [
    { label: "Steps", value: changes.steps },
    { label: "Move calories", value: changes.moveCalories },
    { label: "Rest (min)", value: changes.restMinutes },
    { label: "Breathwork (min)", value: changes.breatheMinutes },
  ].map(({ label, value }) => ({
    label,
    value: value > 0 ? `+${value.toLocaleString("en-US")}` : value.toLocaleString("en-US"),
  }));

  return (
    <main className={styles.page}>
      <div className={styles.dashboard}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>BASELINE / PERFORMANCE</p>
            <h1>Dashboard</h1>
          </div>
          <time className={styles.recordDate} dateTime={latest.date}>
            Latest record · {new Date(`${latest.date}T12:00:00`).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </header>

        <section className={styles.readiness} aria-labelledby="readiness-title">
          <div className={styles.readinessCopy}>
            <p className={styles.eyebrow}>RECOVERY CHECK-IN</p>
            <h2 id="readiness-title">Readiness</h2>
            <p className={styles.readinessDescription}>Your daily recovery score</p>
          </div>
          <ReadinessGauge score={latest.readinessScore} />
        </section>

        <section className={styles.section} aria-labelledby="latest-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>LATEST RECORD</p>
              <h2 id="latest-title">Latest</h2>
            </div>
          </div>
          <div className={styles.metricGrid}>
            {todayMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
          </div>
        </section>

        <div className={styles.lowerSections}>
          <section className={styles.section} aria-labelledby="trends-title">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>ALL RECORDED DAYS</p>
                <h2 id="trends-title">Average</h2>
              </div>
            </div>
            <div className={styles.metricGrid}>
              {trendMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="changes-title">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>LATEST VS. AVERAGE</p>
                <h2 id="changes-title">Change</h2>
              </div>
            </div>
            <div className={styles.metricGrid}>
              {changeMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
