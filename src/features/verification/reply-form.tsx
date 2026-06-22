"use client";

import { useFormStatus } from "react-dom";
import { createSubmissionReply } from "@/features/verification/actions";
import styles from "@/features/account/account-scene.module.css";

function ReplyButton({ ready }: { ready: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-busy={pending}
      className={styles.btnPrimary}
      disabled={!ready || pending}
      type="submit"
    >
      {pending ? "Gonderiliyor..." : "Mesaj Gonder"}
    </button>
  );
}

export function ReplyForm({
  requestId,
  submissionId
}: {
  requestId: string;
  submissionId: string;
}) {
  return (
    <form action={createSubmissionReply} className={styles.replyComposer}>
      <input name="submission_id" type="hidden" value={submissionId} />
      <input name="request_id" type="hidden" value={requestId} />
      <label className={styles.formLabel}>
        <span className={styles.formLabelText}>Yeni mesaj</span>
        <textarea
          name="body"
          placeholder="Mesajinizi yazin..."
          required
          rows={4}
        />
      </label>
      <div className={styles.replyActions}>
        <span className={styles.formHint}>Bu yanit yalnizca bu talebin konusmasina eklenir.</span>
        <ReplyButton ready={Boolean(requestId)} />
      </div>
    </form>
  );
}
