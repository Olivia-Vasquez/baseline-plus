import styles from "./page.module.css";
import { AuthForm } from "@/components/AuthForm";

export default function Landing() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.intro} aria-labelledby="page-title">
          <p className={styles.mark} aria-hidden="true">B</p>
          <p className={styles.kicker}>PERSONAL PERFORMANCE</p>
          <h1 id="page-title">Baseline</h1>
          <p className={styles.description}>
            Your performance, in context.
          </p>
          <div className={styles.rule} aria-hidden="true" />
          <p className={styles.caption}>A clearer view of the work and recovery behind every day.</p>
        </section>
        <AuthForm />
      </main>
      <footer className={styles.footer}>BASELINE <span aria-hidden="true">·</span> DAILY METRICS</footer>
    </div>
  );
}
