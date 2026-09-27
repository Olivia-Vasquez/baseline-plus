import styles from "./MetricCard.module.css";

type MetricCardProps = {
  value: string | number;
  label: string;
};

export const MetricCard = ({ value, label }: MetricCardProps) => {
  return (
    <div className={styles.moduleBox}>
      <p className={styles.metric}>{value}</p>
      <p className={styles.label}>{label}</p>
    </div>
  );
};