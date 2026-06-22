import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getSubmissionForAdmin,
  listSubmissionAttachmentsForAdmin,
  listSubmissionRepliesForAdmin
} from "@/features/verification/admin-queries";
import {
  SUBMISSION_KIND_LABELS,
  SUBMISSION_STATUS_LABELS
} from "@/features/verification/labels";
import {
  closeSubmission,
  createAdminReply,
  markSubmissionUnderReview,
  rejectSubmission,
  updateAdminNotes,
  approveSubmission
} from "@/features/verification/admin-actions";
import { VERIFICATION_REWARDS } from "@/features/verification/config";
import { requireStaff } from "@/features/auth/queries";
import { formatDateTime } from "@/features/account/account-utils";
import styles from "@/features/admin/admin-scene.module.css";

type SubmissionDetailPageProps = {
  params: Promise<{ submissionId: string }>;
  searchParams?: Promise<{ error?: string; saved?: string }>;
};

const errorMessages: Record<string, string> = {
  invalid_status: "Bu durum degisimi gecerli degil.",
  update_failed: "Guncelleme basarisiz.",
  reply_empty: "Yanit bos olamaz.",
  reply_failed: "Yanit gonderilemedi.",
  rejection_reason_required: "Red sebebi zorunlu.",
  notes_failed: "Notlar kaydedilemedi.",
  negative_reward: "Puan negatif olamaz.",
  note_required_for_custom_reward: "Ozel puan degeri icin admin notu zorunlu.",
  approve_failed: "Onay islemi basarisiz.",
  approve_submission_not_found: "Talep bulunamadi.",
  approve_submission_not_open: "Bu talep onaylanamaz (reddedilmis veya kapali).",
  approve_duplicate_book_reward: "Bu kullanici bu kitap icin zaten odul almis.",
  approve_duplicate_review_url: "Bu yorum linki zaten onaylanmis.",
  approve_already_approved: "Bu talep zaten onaylanmis.",
  approve_ledger_conflict: "Puan kaydi cakismasi. Tekrar deneyin.",
  approve_forbidden: "Bu islemi yapmaya yetkiniz yok.",
  approve_negative_reward: "Puan negatif olamaz.",
  approve_custom_reward_note_required: "Ozel puan degeri icin admin notu zorunlu.",
  approve_approved_reward_incomplete: "Onay kaydi tutarsiz. Puan kaydini kontrol edin."
};

function isImage(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

function badgeClassForStatus(status: string) {
  if (status === "approved") return styles.badgeGold;
  if (status === "rejected") return styles.badgeRed;
  if (status === "responded" || status === "under_review") return styles.badgeBlue;
  return "";
}

function badgeClassForKind(kind: string) {
  if (kind === "amazon_purchase") return styles.badgeGold;
  if (kind === "amazon_review") return styles.badgeBlue;
  return "";
}

export default async function AdminSubmissionDetailPage({
  params,
  searchParams
}: SubmissionDetailPageProps) {
  const { submissionId } = await params;
  const query = await searchParams;

  const [submission, replies, attachments] = await Promise.all([
    getSubmissionForAdmin(submissionId),
    listSubmissionRepliesForAdmin(submissionId),
    listSubmissionAttachmentsForAdmin(submissionId)
  ]);

  if (!submission) {
    notFound();
  }

  const staff = await requireStaff(["owner", "admin_ops", "support"]);
  const canApprove = staff?.roles.includes("owner") || staff?.roles.includes("admin_ops") || false;
  const canReply = Boolean(staff);

  return (
    <main className={styles.main} id="main-content">
      <div className={styles.detailHead}>
        <Link className={styles.backLink} href="/admin/verifications">
          ← Dogrulamalara Don
        </Link>
        <div className={styles.detailTitle}>
          {submission.title}
          <span className={`${styles.badge} ${badgeClassForKind(submission.kind)}`}>
            {SUBMISSION_KIND_LABELS[submission.kind]}
          </span>
          <span className={`${styles.badge} ${badgeClassForStatus(submission.status)}`}>
            {SUBMISSION_STATUS_LABELS[submission.status]}
          </span>
        </div>
        <p className={styles.detailMeta}>
          {formatDateTime(submission.created_at)}
          {submission.book_slug ? ` · ${submission.book_slug}` : ""}
          {submission.profile ? ` · ${submission.profile.email}` : ""}
        </p>
      </div>

      <div className={styles.notices} style={{ marginBottom: "1.25rem" }}>
        {query?.error ? (
          <div className={styles.noticeError}>
            {errorMessages[query.error] ?? query.error}
          </div>
        ) : null}
        {query?.saved === "notes" ? (
          <div className={styles.noticeSuccess}>Admin notlari kaydedildi.</div>
        ) : null}
        {query?.saved === "approved" ? (
          <div className={styles.noticeSuccess}>Talep onaylandi ve IOH puani islendi.</div>
        ) : null}
      </div>

      <div className={styles.grid}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Kullanici Bilgisi</h3>
            <p className={styles.kicker}>PROFIL</p>
          </div>
          <dl className={styles.dl}>
            <div>
              <dt className={styles.dt}>Ad Soyad</dt>
              <dd className={styles.dd}>{submission.profile?.full_name ?? "Isimsiz"}</dd>
            </div>
            <div>
              <dt className={styles.dt}>E-posta</dt>
              <dd className={styles.dd}>{submission.profile?.email ?? "-"}</dd>
            </div>
            <div>
              <dt className={styles.dt}>Profil</dt>
              <dd className={styles.dd}>
                {submission.profile ? (
                  <Link
                    className={styles.backLink}
                    href={`/admin/users/${submission.profile.id}`}
                  >
                    Kullanici detayina git →
                  </Link>
                ) : "-"}
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Talep Detayi</h3>
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
                    style={{ color: "var(--ad-gold)", textDecoration: "none" }}
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
              <dd className={styles.dd}>{SUBMISSION_STATUS_LABELS[submission.status]}</dd>
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
              <p className={styles.kicker}>KULLANICI MESAJI</p>
              <p className={styles.sectionLead} style={{ marginTop: "0.5rem" }}>
                {submission.body}
              </p>
            </div>
          ) : null}
          {submission.rejection_reason ? (
            <div style={{ marginTop: "1rem" }}>
              <p className={styles.kicker}>RED SEBEBI</p>
              <p className={styles.noticeError} style={{ marginTop: "0.5rem" }}>
                {submission.rejection_reason}
              </p>
            </div>
          ) : null}
        </section>
      </div>

      {attachments.length > 0 ? (
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Ekler / Ekran Goruntuleri</h3>
            <p className={styles.kicker}>{attachments.length} dosya</p>
          </div>
          <div className={styles.grid2}>
            {attachments.map((att) => (
              <div key={att.id} className={styles.panel} style={{ padding: "1rem" }}>
                <div className={styles.panelHead} style={{ padding: 0, border: 0 }}>
                  <span className={`${styles.badge} ${styles.badgeBlue}`}>{att.mime_type}</span>
                  <span className={styles.detailMeta}>{att.file_name}</span>
                </div>
                {att.signedUrl && isImage(att.mime_type) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={att.file_name}
                    src={att.signedUrl}
                    style={{ borderRadius: "8px", border: "1px solid var(--ad-line)", width: "100%" }}
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
                  <p className={styles.sectionLead}>Onizleme kullanilamiyor.</p>
                )}
                <p className={styles.detailMeta}>{(att.size_bytes / 1024).toFixed(0)} KB</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h3 className={styles.panelTitle}>Yanıt Gecmisi</h3>
          <p className={styles.kicker}>{replies.length} mesaj</p>
        </div>
        {replies.length === 0 ? (
          <p className={styles.sectionLead}>Henuz mesaj yok.</p>
        ) : (
          <div className={styles.grid}>
            {replies.map((reply) => (
              <div
                key={reply.id}
                className={styles.panel}
                style={{
                  padding: "1rem 1.25rem",
                  borderColor: reply.is_staff ? "rgba(231,197,116,0.22)" : undefined,
                  background: reply.is_staff ? "rgba(231,197,116,0.04)" : undefined
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span className={`${styles.badge} ${reply.is_staff ? styles.badgeGold : ""}`}>
                    {reply.is_staff ? "Admin" : "Kullanici"}
                    {reply.is_staff && reply.profile_name ? ` · ${reply.profile_name}` : ""}
                  </span>
                  <span className={styles.detailMeta}>{formatDateTime(reply.created_at)}</span>
                </div>
                <p className={styles.sectionLead}>{reply.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className={styles.grid2}>
        {canReply ? (
          <form action={createAdminReply} className={styles.panel}>
            <div className={styles.panelHead}>
              <h3 className={styles.panelTitle}>Yanıt Yaz</h3>
              <p className={styles.kicker}>REPLY</p>
            </div>
            <input name="submission_id" type="hidden" value={submission.id} />
            <Textarea
              name="body"
              placeholder="Kullaniciya yanit yazin..."
              rows={4}
            />
            <Button type="submit">Yanıtı Gonder</Button>
          </form>
        ) : null}

        {canApprove ? (
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h3 className={styles.panelTitle}>Admin Notları</h3>
              <p className={styles.kicker}>INTERNAL</p>
            </div>
            <form action={updateAdminNotes} className={styles.formGrid}>
              <input name="submission_id" type="hidden" value={submission.id} />
              <Textarea
                defaultValue={submission.admin_notes ?? ""}
                name="admin_notes"
                placeholder="Sadece admin ekibi gorur."
                rows={4}
              />
              <Button type="submit" variant="secondary">Notları Kaydet</Button>
            </form>
          </div>
        ) : null}
      </div>

      {canApprove ? (
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Admin Aksiyonları</h3>
            <p className={styles.kicker}>STATUS</p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "flex-start" }}>
            {submission.status === "pending" ? (
              <form action={markSubmissionUnderReview}>
                <input name="submission_id" type="hidden" value={submission.id} />
                <Button type="submit" variant="outline">Incelemeye Al</Button>
              </form>
            ) : null}

            {submission.status !== "rejected" && submission.status !== "closed" && submission.status !== "approved" ? (
              <form action={closeSubmission}>
                <input name="submission_id" type="hidden" value={submission.id} />
                <Button type="submit" variant="outline">Kapat</Button>
              </form>
            ) : null}

            {submission.status !== "rejected" && submission.status !== "closed" && submission.status !== "approved" ? (
              <form action={rejectSubmission} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                <input name="submission_id" type="hidden" value={submission.id} />
                <label style={{ display: "grid", gap: "0.3rem" }}>
                  <span style={{ color: "var(--ad-muted)", fontFamily: "var(--font-mono)", fontSize: "0.54rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    Red Sebebi
                  </span>
                  <Input name="rejection_reason" placeholder="Red sebebi (zorunlu)" required style={{ minWidth: "16rem" }} />
                </label>
                <Button type="submit" variant="outline">Reddet</Button>
              </form>
            ) : null}

            {submission.status !== "approved" && submission.status !== "rejected" && submission.status !== "closed" ? (
              <form
                action={approveSubmission}
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                  alignItems: "flex-end",
                  padding: "1rem",
                  border: "1px solid rgba(231,197,116,0.3)",
                  borderRadius: "10px",
                  background: "rgba(231,197,116,0.05)"
                }}
              >
                <input name="submission_id" type="hidden" value={submission.id} />
                <label style={{ display: "grid", gap: "0.3rem" }}>
                  <span style={{
                    color: "var(--ad-muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.54rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase"
                  }}>
                    Odul Puani
                  </span>
                  <Input
                    defaultValue={VERIFICATION_REWARDS[submission.kind].amount}
                    name="reward_amount"
                    min={0}
                    placeholder="0"
                    style={{ width: "6rem" }}
                    type="number"
                  />
                </label>
                <label style={{ display: "grid", gap: "0.3rem", flex: "1", minWidth: "12rem" }}>
                  <span style={{
                    color: "var(--ad-muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.54rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase"
                  }}>
                    Admin Notu (ozel puan icin zorunlu)
                  </span>
                  <Input
                    name="admin_note"
                    placeholder="Onay notu..."
                  />
                </label>
                <Button type="submit">
                  {VERIFICATION_REWARDS[submission.kind].amount > 0
                    ? "Onayla ve Puan Ver"
                    : "Onayla"}
                </Button>
              </form>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
