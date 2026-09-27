import styles from "./page.module.css";
import Link from "next/link";

export default function Landing() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.intro} aria-labelledby="page-title">
          <h1 id="page-title">Baseline</h1>
          <p className={styles.description}>
            Track your performance and your recovery all in one app.
          </p>
          <Link className={styles.dashboardLink} href="/home">View dashboard</Link>
        </section>
      </main>
    </div>
  );
}
