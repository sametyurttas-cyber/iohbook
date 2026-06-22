import styles from "@/features/admin/admin-scene.module.css";

export default function AdminLoading() {
  return (
    <main className={styles.loading}>
      <div className={styles.loadingInner}>
        <div className={styles.loadingBar} style={{ width: "40%" }} />
        <div className={styles.loadingCard} />
        <div className={styles.loadingCard} />
      </div>
    </main>
  );
}
