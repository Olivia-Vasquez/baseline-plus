import Link from "next/link";
import styles from "./MetricCard.module.css";

type MetricCardProps = {
  value: string | number;
  label: string;
  href?: string;
};

export const MetricCard = ({ value, label, href }: MetricCardProps) => {
  const content = (
    <>
      <p className={styles.metric}>{value}</p>
      <p className={styles.label}>{label}</p>
    </>
  );

  if (href) {
    return (
      <Link
        className={`${styles.moduleBox} ${styles.interactive}`}
        href={href}
        aria-label={`${label}: ${value}. View details`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={styles.moduleBox}>
      {content}
    </div>
  );
};