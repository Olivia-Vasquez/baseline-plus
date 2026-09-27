import Link from "next/link";
import { MetricHistoryChart } from "@/components/MetricHistoryChart";
import type { MetricDetailRecord } from "@/types/metrics";
import styles from "./MetricDetailView.module.css";

type MetricDetailViewProps = {
  title: string;
  description: string;
  unit: string;
  entryHeading: string;
  records: MetricDetailRecord[];
};

const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const formatValue = (value: number, unit: string) => {
  const formatted = value.toLocaleString("en-US");
  return unit === "steps" ? formatted : `${formatted} ${unit}`;
};

export const MetricDetailView = ({
  title,
  description,
  unit,
  entryHeading,
  records,
}: MetricDetailViewProps) => {
  const newestFirst = [...records].reverse();
  const entryCount = records.reduce((count, record) => count + record.entries.length, 0);
  const firstDate = records[0]?.date;
  const latestDate = records[records.length - 1]?.date;

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <Link className={styles.backLink} href="/home">Back to dashboard</Link>

        <header className={styles.header}>
          <p className={styles.eyebrow}>METRIC DETAILS</p>
          <h1>{title}</h1>
          <p className={styles.description}>{description}</p>
        </header>

        <section className={styles.chartPanel} aria-labelledby="chart-title">
          <div className={styles.chartHeading}>
            <div>
              <p className={styles.eyebrow}>DAILY TOTAL</p>
              <h2 id="chart-title">{title} over time</h2>
            </div>
            {firstDate && latestDate && (
              <p className={styles.dateRange}>{formatDate(firstDate)} - {formatDate(latestDate)}</p>
            )}
          </div>
          <MetricHistoryChart data={records} metricName={title} unit={unit} />
        </section>

        <section className={styles.activities} aria-labelledby="entries-title">
          <div className={styles.activitiesHeading}>
            <div>
              <p className={styles.eyebrow}>DAILY CONTRIBUTIONS</p>
              <h2 id="entries-title">{entryHeading}</h2>
            </div>
            <p className={styles.entryCount}>{entryCount} entries</p>
          </div>

          <div className={styles.recordList}>
            {newestFirst.map((record) => (
              <article className={styles.record} key={record.date}>
                <header className={styles.recordHeading}>
                  <time dateTime={record.date}>{formatDate(record.date)}</time>
                  <p>{formatValue(record.total, unit)}</p>
                </header>
                <ul className={styles.entryList}>
                  {record.entries.map((entry) => (
                    <li className={styles.entry} key={entry.id}>
                      <div>
                        <p className={styles.entryName}>{entry.name}</p>
                        <p className={styles.entryDetail}>{entry.detail}</p>
                      </div>
                      <p className={styles.entryValue}>{formatValue(entry.value, unit)}</p>
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
};