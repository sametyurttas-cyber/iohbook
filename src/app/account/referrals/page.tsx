import type { Metadata } from "next";
import { formatDateTime } from "@/features/account/account-utils";
import { requireAccountUser } from "@/features/account/queries";
import { REFERRAL_REFERRED_REWARD, REFERRAL_REFERRER_REWARD } from "@/features/referrals/config";
import { isReferralSchemaUnavailableError } from "@/features/referrals/errors";
import { buildReferralLink } from "@/features/referrals/link";
import { ReferralShareCard } from "@/features/referrals/referral-share-card";
import { getReferralSummary, type ReferralSummary } from "@/features/referrals/service";
import styles from "@/features/account/account-scene.module.css";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false
  },
  title: "Davetlerim"
};

const statusLabels = {
  pending: "Beklemede",
  qualified: "Dogrulandi",
  rejected: "Reddedildi",
  rewarded: "Odullendirildi"
};

const rewardStatusLabels = {
  beklemede: "Odul bekliyor",
  hazir: "Odul hazir",
  odullendirildi: "Odul verildi",
  reddedildi: "Odul yok"
};

function statusBadgeClass(status: string) {
  if (status === "rewarded") {
    return styles.badgeGold;
  }

  if (status === "qualified") {
    return styles.badgeBlue;
  }

  if (status === "rejected") {
    return styles.badgeRed;
  }

  return "";
}

export default async function AccountReferralsPage() {
  const user = await requireAccountUser();
  let setupRequired = false;
  let summary: ReferralSummary = {
    code: null,
    invitedCount: 0,
    items: [],
    pendingCount: 0,
    rewardedCount: 0,
    rewardsEarned: 0
  };

  try {
    summary = await getReferralSummary(user.id);
  } catch (error) {
    if (!isReferralSchemaUnavailableError(error)) {
      throw error;
    }

    setupRequired = true;
  }

  const referralLink = summary.code ? buildReferralLink(summary.code) : null;

  return (
    <div className={styles.cards}>
      <div className={styles.contentHead}>
        <p className={styles.kicker}>08 / DAVETLERIM</p>
        <h2 className={styles.contentTitle}>Arkadasini Davet Et</h2>
        <p className={styles.contentLead}>
          Arkadasin IOHBOOK&apos;a senin linkinle katildiginda ikiniz de IOH puani
          kazanirsiniz. Odul, yeni kullanicinin e-posta dogrulamasi tamamlandiktan
          sonra islenir.
        </p>
      </div>

      {summary.code && referralLink ? (
        <ReferralShareCard code={summary.code} link={referralLink} />
      ) : setupRequired ? (
        <div className={styles.noticeError}>
          Davet modulu kodda hazir, ancak Supabase veritabani kurulumu henuz
          uygulanmadi. Kurulum tamamlandiginda davet kodun otomatik olusturulacak.
        </div>
      ) : (
        <div className={styles.noticeError}>
          Davet kodu su anda olusturulamadi. Biraz sonra tekrar deneyin.
        </div>
      )}

      <section className={styles.sectionPanel}>
        <div className={styles.cardRow}>
          <div>
            <h3 className={styles.sectionTitle}>Odul Kurallari</h3>
            <p className={styles.cardDesc}>
              Davet eden kullanici {REFERRAL_REFERRER_REWARD} IOH, yeni kullanici{" "}
              {REFERRAL_REFERRED_REWARD} IOH kazanir. Ayni davet iliskisi ikinci
              kez puan kazandirmaz.
            </p>
          </div>
          <span className={`${styles.badge} ${styles.badgeGold}`}>EMAIL SONRASI</span>
        </div>
      </section>

      <div className={styles.pointsStats}>
        <div className={styles.pointsStat}>
          <span className={styles.pointsStatLabel}>Toplam Davet</span>
          <span className={styles.pointsStatValue}>{summary.invitedCount}</span>
        </div>
        <div className={styles.pointsStat}>
          <span className={styles.pointsStatLabel}>Bekleyen</span>
          <span className={styles.pointsStatValue}>{summary.pendingCount}</span>
        </div>
        <div className={styles.pointsStat}>
          <span className={styles.pointsStatLabel}>Odullendirilen</span>
          <span className={styles.pointsStatValue}>{summary.rewardedCount}</span>
        </div>
        <div className={styles.pointsStat}>
          <span className={styles.pointsStatLabel}>Kazanilan IOH</span>
          <span className={styles.pointsStatValue}>{summary.rewardsEarned} IOH</span>
        </div>
      </div>

      <section className={styles.sectionPanel}>
        <div className={styles.cardRow}>
          <div>
            <h3 className={styles.sectionTitle}>Davet Listesi</h3>
            <p className={styles.cardDesc}>
              Gizlilik icin davet edilen kisilerin e-posta veya ad bilgisi burada
              gosterilmez.
            </p>
          </div>
          <span className={styles.badge}>Son {summary.items.length}</span>
        </div>

        {summary.items.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyVisual}>REF</div>
            <h3 className={styles.emptyTitle}>Henuz davet yok</h3>
            <p className={styles.emptyDesc}>
              Linkini paylastiginda yeni kayitlar burada durumlariyla gorunecek.
            </p>
          </div>
        ) : (
          <div className={styles.ledger}>
            {summary.items.map((item) => (
              <article className={styles.ledgerItem} key={item.id}>
                <div className={styles.ledgerInfo}>
                  <span className={styles.ledgerReason}>{item.label}</span>
                  <span className={styles.ledgerDate}>
                    {formatDateTime(item.createdAt)}
                    {item.rewardedAt ? ` / Odul: ${formatDateTime(item.rewardedAt)}` : ""}
                  </span>
                </div>
                <div className={styles.cardActions}>
                  <span className={`${styles.badge} ${statusBadgeClass(item.status)}`}>
                    {statusLabels[item.status]}
                  </span>
                  <span className={styles.badge}>{rewardStatusLabels[item.rewardStatus]}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
