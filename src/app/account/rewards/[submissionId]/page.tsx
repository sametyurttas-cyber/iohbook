import { randomUUID } from "node:crypto";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getOwnSubmission,
  listOwnSubmissionAttachments,
  listOwnSubmissionReplies
} from "@/features/verification/queries";
import {
  SUBMISSION_KIND_LABELS,
  SUBMISSION_STATUS_LABELS,
  canUserReply,
  kindBadgeClass,
  statusBadgeClass
} from "@/features/verification/labels";
import { ReplyForm } from "@/features/verification/reply-form";
import { formatDateTime } from "@/features/account/account-utils";
import styles from "@/features/account/account-scene.module.css";

type SubmissionDetailPageProps = {
  params: Promise<{ submissionId: string }>;
  searchParams?: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  reply_empty: "Mesaj bos olamaz.",
  reply_closed: "Bu gonderiye mesaj yazilamaz (kapali/onayli/reddedilmis).",
  reply_failed: "Mesaj gonderilemedi. Lutfen tekrar dene."
};

function isImage(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

export default async function SubmissionDetailPage({
  params,
  searchParams
}: SubmissionDetailPageProps) {
  const { submissionId } = await params;
  const query = await searchParams;

  const [submission, replies, attachments] = await Promise.all([
    getOwnSubmission(submissionId),
    listOwnSubmissionReplies(submissionId),
    listOwnSubmissionAttachments(submissionId)
  ]);

  if (!submission) {
    notFound();
  }

  const replyAllowed = canUserReply(submission.status);

  return (
    <div className={styles.cards}>
      <div className={styles.detailHead}>
        <Link className={styles.backLink} href="/account/rewards">
          ← Oduellere Don
        </Link>
        <div className={styles.detailTitle}>
          {submission.title}
          <span className={`${styles.badge} ${kindBadgeClass(submission.kind)}`}>
            {SUBMISSION_KIND_LABELS[submission.kind]}
          </span>
          <span className={`${styles.badge} ${statusBadgeClass(submission.status)}`}>
            {SUBMISSION_STATUS_LABELS[submission.status]}
          </span>
        </div>
        <p className={styles.detailMeta}>
          {formatDateTime(submission.created_at)}
          {submission.book_slug ? ` · ${submission.book_slug}` : ""}
          {submission.reward_amount > 0 && submission.status === "approved"
            ? ` · +${submission.reward_amount} IOH odul`
            : ""}
        </p>
      </div>

      {query?.error ? (
        <div className={styles.noticeError}>
          {errorMessages[query.error] ?? query.error}
        </div>
      ) : null}

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h3 className={styles.panelTitle}>Gonderi Detayi</h3>
          <p className={styles.kicker}>BILGILER</p>
        </div>
        <dl className={styles.dl}>
          <div>
            <dt className={styles.dt}>Talep Turu</dt>
            <dd className={styles.dd}>{SUBMISSION_KIND_LABELS[submission.kind]}</dd>
          </div>
          {submission.book_slug ? (
            <div>
              <dt className={styles.dt}>Kitap</dt>
              <dd className={styles.dd}>{submission.book_slug}</dd>
            </div>
          ) : null}
          {submission.amazon_order_id ? (
            <div>
              <dt className={styles.dt}>Amazon Siparis No</dt>
              <dd className={styles.dd}>{submission.amazon_order_id}</dd>
            </div>
          ) : null}
          {submission.amazon_review_url ? (
            <div>
              <dt className={styles.dt}>Yorum Linki</dt>
              <dd className={styles.dd}>
                <a
                  href={submission.amazon_review_url}
                  rel="noopener noreferrer"
                  style={{ color: "var(--a-gold)", textDecoration: "none" }}
                  target="_blank"
                >
                  Amazon yorumu ↗
                </a>
              </dd>
            </div>
          ) : null}
          {submission.amazon_profile_name ? (
            <div>
              <dt className={styles.dt}>Amazon Profil</dt>
              <dd className={styles.dd}>{submission.amazon_profile_name}</dd>
            </div>
          ) : null}
          <div>
            <dt className={styles.dt}>Durum</dt>
            <dd className={styles.dd}>
              {SUBMISSION_STATUS_LABELS[submission.status]}
            </dd>
          </div>
          {submission.reward_amount > 0 ? (
            <div>
              <dt className={styles.dt}>Odul</dt>
              <dd className={styles.ddGold}>{submission.reward_amount} IOH</dd>
            </div>
          ) : null}
        </dl>
        {submission.body ? (
          <div style={{ marginTop: "1rem" }}>
            <p className={styles.kicker}>MESAJ</p>
            <p className={styles.sectionLead} style={{ marginTop: "0.5rem" }}>
              {submission.body}
            </p>
          </div>
        ) : null}
      </section>

      {attachments.length > 0 ? (
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Ekler</h3>
            <p className={styles.kicker}>{attachments.length} dosya</p>
          </div>
          <div className={styles.grid2}>
            {attachments.map((att) => (
              <div key={att.id} className={styles.panel} style={{ padding: "1rem" }}>
                <div className={styles.panelHead} style={{ padding: 0, border: 0 }}>
                  <span className={styles.badge}>{att.mime_type}</span>
                  <span className={styles.detailMeta}>{att.file_name}</span>
                </div>
                {att.signedUrl && isImage(att.mime_type) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={att.file_name}
                    className="w-full rounded-lg border"
                    src={att.signedUrl}
                    style={{ borderRadius: "8px", border: "1px solid var(--a-line)" }}
                  />
                ) : att.signedUrl ? (
                  <a
                    className={styles.btnLink}
                    href={att.signedUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Dosyayi Goruntule ↗
                  </a>
                ) : (
                  <p className={styles.sectionLead}>Onizleme su anda kullanilamiyor.</p>
                )}
                <p className={styles.detailMeta}>
                  {(att.size_bytes / 1024).toFixed(0)} KB
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h3 className={styles.panelTitle}>Mesajlasma</h3>
          <p className={styles.kicker}>{replies.length} mesaj</p>
        </div>
        {replies.length === 0 ? (
          <p className={styles.sectionLead}>Henuz mesaj yok.</p>
        ) : (
          <div className={styles.messageThread}>
            {replies.map((reply) => (
              <div
                key={reply.id}
                className={`${styles.messageBubble} ${
                  reply.is_staff ? styles.messageBubbleStaff : styles.messageBubbleOwn
                }`}
              >
                <div className={styles.messageHeader}>
                  <span className={`${styles.badge} ${reply.is_staff ? styles.badgeGold : ""}`}>
                    {reply.is_staff ? "IOH Ekibi" : "Sen"}
                  </span>
                  <span className={styles.detailMeta}>{formatDateTime(reply.created_at)}</span>
                </div>
                <p className={styles.messageBody}>{reply.body}</p>
              </div>
            ))}
          </div>
        )}

        {replyAllowed ? (
          <div>
            <ReplyForm requestId={randomUUID()} submissionId={submission.id} />
          </div>
        ) : (
          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--a-line)" }}>
            <p className={styles.sectionLead}>
              Bu gonderi {SUBMISSION_STATUS_LABELS[submission.status].toLowerCase()} durumunda.
              Yeni mesaj yazilamaz.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
