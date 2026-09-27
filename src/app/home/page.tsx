import Image from "next/image";
import styles from "./page.module.css";
import { Averages, Changes } from "@/types/metrics";
import { demoMetrics} from "@/data/demoMetrics";
import { ReadinessGauge } from "@/components/readinessGauge";
import { calculateAverage, calculateChange } from "@/lib/metricCalculations";
import { MetricCard } from "@/components/MetricCard";

export default function Home() {
  const today = demoMetrics[demoMetrics.length - 1];
  const trends:Averages = calculateAverage(demoMetrics);
  const changes:Changes = calculateChange(trends, today);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className={styles.intro}>
          <p>
            Home
          </p>
        </div>

        <div className={styles.section}>
          <h1>
            Readiness Score
          </h1>
          <ReadinessGauge score={today.readinessScore}/>
        </div>
        <div className={styles.section}>
          <h1>
            Today
          </h1>
          <div className={styles.subsection1}>
              <MetricCard value={today.steps} label="Steps" />
              <MetricCard value={today.moveCalories} label="Move"/>
            <div className={styles.subsection2}>
              <h1>
                Move
              </h1>
              <p>
                {today.moveCalories}
              </p>
            </div>
            <div className={styles.subsection2}>
              <h1>
                Rest
              </h1>
              <p>
                {today.restMinutes}
              </p>
            </div>
            <div className={styles.subsection2}>
              <h1>
                Breath
              </h1>
              <p>
                {today.breatheMinutes}
              </p>
            </div>
          </div>

        </div>


        <div className={styles.section}>
          <h1>
            Trends
          </h1>
          <div className={styles.subsection1}>
            <div className={styles.subsection2}>
              <h1>
                Steps
              </h1>
              <p>
                {trends.steps}
              </p>
            </div>
            <div className={styles.subsection2}>
              <h1>
                Move
              </h1>
              <p>
                {trends.moveCalories}
              </p>
            </div>
            <div className={styles.subsection2}>
              <h1>
                Rest
              </h1>
              <p>
                {trends.restMinutes}
              </p>
            </div>
            <div className={styles.subsection2}>
              <h1>
                Breath
              </h1>
              <p>
                {trends.breatheMinutes}
              </p>
            </div>
          </div>
        </div>
        <div className={styles.section}>
          <h1>
            Changes
          </h1>
          <div className={styles.subsection1}>
            <div className={styles.subsection2}>
              <h1>
                Steps
              </h1>
              <p>
                {changes.steps}
              </p>
            </div>
            <div className={styles.subsection2}>
              <h1>
                Sleep
              </h1>
              <p>
                {changes.restMinutes}
              </p>
            </div>
            <div className={styles.subsection2}>
              <h1>
                Move
              </h1>
              <p>
                {changes.moveCalories}
              </p>
            </div>
            <div className={styles.subsection2}>
              <h1>
                Breath
              </h1>
              <p>
                {changes.breatheMinutes}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
