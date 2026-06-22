import styles from "@/features/account/account-scene.module.css";

export default function AccountLoading() {
  return (
    <main className={styles.loading}>
      <div className={styles.loadingShell}>
        <div className={styles.loadingBar} style={{ width: "60%" }} />
        <div className={styles.loadingPills}>
          <div className={styles.loadingPill} />
          <div className={styles.loadingPill} />
          <div className={styles.loadingPill} />
          <div className={styles.loadingPill} />
        </div>
        <div className={styles.loadingCard} />
        <div className={styles.loadingCard} />
      </div>
    </main>
  );
}
