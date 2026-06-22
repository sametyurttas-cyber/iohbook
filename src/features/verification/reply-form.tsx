import { createSubmissionReply } from "@/features/verification/actions";
import styles from "@/features/account/account-scene.module.css";

export function ReplyForm({ submissionId }: { submissionId: string }) {
  return (
    <form action={createSubmissionReply} className={styles.formGrid}>
      <input name="submission_id" type="hidden" value={submissionId} />
      <label className={styles.formLabel}>
        <span className={styles.formLabelText}>Yeni Mesaj</span>
        <textarea
          name="body"
          placeholder="Mesajinizi yazin..."
          required
          rows={4}
        />
      </label>
      <button className={styles.btnPrimary} type="submit">
        Mesaj Gonder
      </button>
    </form>
  );
}
