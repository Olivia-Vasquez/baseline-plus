import Image from "next/image";
import styles from "./page.module.css";
import Link from 'next/link'; //



export default function Landing() {
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
            Looking for a new way to push the boundaries your performance?
          </p>
          <h1>
            Baseline
          </h1>
          <p>
            Track your performance and your recovery all in One. Single. App.
          </p>
        </div>
        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="/home"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Dashboard
          </a>
          <a
            className={styles.secondary}
            href="/home"
            target="_blank"
            rel="noopener noreferrer"
          >
            Log In
          </a>
        </div>
      </main>
    </div>
  );
}
