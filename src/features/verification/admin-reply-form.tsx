"use client";

import { createAdminReply } from "@/features/verification/admin-actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import styles from "@/features/admin/admin-scene.module.css";

export function AdminReplyForm({
  requestId,
  submissionId
}: {
  requestId: string;
  submissionId: string;
}) {
  return (
    <form action={createAdminReply} className={styles.adminReplyComposer}>
      <input name="submission_id" type="hidden" value={submissionId} />
      <input name="request_id" type="hidden" value={requestId} />
      <Textarea
        name="body"
        placeholder="Kullaniciya bu talep hakkinda yanit yazin..."
        required
        rows={5}
      />
      <div className={styles.adminReplyFooter}>
        <span>Yanit yalnizca bu talebin mesaj gecmisine eklenir.</span>
        <SubmitButton disabled={!requestId}>Yaniti Gonder</SubmitButton>
      </div>
    </form>
  );
}
