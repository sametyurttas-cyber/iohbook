import Link from "next/link";
import { listOwnSubmissions } from "@/features/verification/queries";
import { isVerificationSchemaUnavailableError } from "@/features/verification/errors";
import type { SubmissionWithMeta } from "@/features/verification/queries";
import {
  SUBMISSION_KIND_LABELS,
  SUBMISSION_STATUS_LABELS,
  kindBadgeClass,
  statusBadgeClass
} from "@/features/verification/labels";
import { formatDateTime } from "@/features/account/account-utils";
import styles from "@/features/account/account-scene.module.css";

type RewardsPageProps = {
  searchParams?: Promise<{
    kind?: string;
    status?: string;
  }>;
};

export default async function AccountRewardsPage({ searchParams }: RewardsPageProps) {
  const params = await searchParams;
  let submissions: SubmissionWithMeta[] = [];
  let setupRequired = false;

  try {
    submissions = await listOwnSubmissions();
  } catch (error) {
    if (!isVerificationSchemaUnavailableError(error)) {
      throw error;
    }

    setupRequired = true;
  }

  const filterKind = params?.kind ?? "all";
  const filterStatus = params?.status ?? "all";

  const filtered = submissions.filter((s) => {
    if (filterKind !== "all" && s.kind !== filterKind) return false;
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    return true;
  });

  const kindFilters = [
    { label: "Tumu", value: "all" },
    { label: "Satin Alma", value: "amazon_purchase" },
    { label: "Yorum", value: "amazon_review" },
    { label: "Mesaj", value: "general_message" }
  ];

  const statusFilters = [
    { label: "Bekleyen", value: "pending" },
    { label: "Onaylanan", value: "approved" },
    { label: "Reddedilen", value: "rejected" },
    { label: "Yanitlanan", value: "responded" }
  ];

  return (
    <div className={styles.cards}>
      <div className={styles.contentHead}>
        <p className={styles.kicker}>ODELLERIM / DOGRULAMA</p>
        <h2 className={styles.contentTitle}>Amazon Dogrulama ve Mesajlar</h2>
        <p className={styles.contentLead}>
          Amazon satin alimlarini ve yorumlarini gonder, onay sonrasi IOH puani kazan.
          Genel mesajlarinla destek ekibine ulas.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <Link
          className={`${styles.tab} ${filterKind === "all" ? styles.tabActive : ""}`}
          href="/account/rewards"
        >
          Tumu
        </Link>
        {kindFilters.slice(1).map((f) => (
          <Link
            className={`${styles.tab} ${filterKind === f.value ? styles.tabActive : ""}`}
            href={`/account/rewards?kind=${f.value}`}
            key={f.value}
          >
            {f.label}
          </Link>
        ))}
        {statusFilters.map((f) => (
          <Link
            className={`${styles.tab} ${filterStatus === f.value ? styles.tabActive : ""}`}
            href={`/account/rewards?status=${f.value}`}
            key={f.value}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {setupRequired ? (
        <div className={styles.noticeError}>
          Dogrulama modulu kodda hazir, ancak Supabase veritabani kurulumu henuz
          uygulanmadi. Kurulum tamamlandiginda bu alan otomatik olarak aktif olacak.
        </div>
      ) : null}

      {!setupRequired && filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyVisual}>IOH</div>
          <h3 className={styles.emptyTitle}>Henuz dogrulama veya mesaj gondermedin</h3>
          <p className={styles.emptyDesc}>
            Amazon satin alim veya yorum dogrulamasi gondererek IOH puani kazan.
            Genel mesajla destek ekibine ulasabilirsin.
          </p>
          <Link className={styles.emptyCta} href="/account/rewards/new">
            Yeni Gonderi Olustur
          </Link>
        </div>
      ) : !setupRequired ? (
        <div className={styles.cards}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Link className={styles.btnPrimary} href="/account/rewards/new">
              Yeni Gonderi Olustur
            </Link>
          </div>

          {filtered.map((submission) => (
            <article className={styles.card} key={submission.id}>
              <div className={styles.cardRow}>
                <div className={styles.cardMain}>
                  <div className={styles.cardTop}>
                    <span className={`${styles.badge} ${kindBadgeClass(submission.kind)}`}>
                      {SUBMISSION_KIND_LABELS[submission.kind]}
                    </span>
                    <span className={`${styles.badge} ${statusBadgeClass(submission.status)}`}>
                      {SUBMISSION_STATUS_LABELS[submission.status]}
                    </span>
                    {submission.book_slug ? (
                      <span className={styles.badge}>{submission.book_slug}</span>
                    ) : null}
                  </div>
                  <h3 className={styles.cardTitle}>{submission.title}</h3>
                  <p className={styles.cardMono}>
                    {formatDateTime(submission.created_at)}
                    {submission.reply_count && submission.reply_count > 0
                      ? ` · ${submission.reply_count} yanit`
                      : ""}
                  </p>
                </div>
                <div className={styles.cardActions}>
                  {submission.reward_amount > 0 && submission.status === "approved" ? (
                    <span className={styles.cardPrice}>+{submission.reward_amount} IOH</span>
                  ) : null}
                  <Link
                    className={`${styles.btnLink} ${styles.btnLinkGold}`}
                    href={`/account/rewards/${submission.id}`}
                  >
                    Detay
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
