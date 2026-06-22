import { updateCommunicationPreferences } from "@/features/account/actions";
import {
  getAccountPointBalance,
  getAccountProfile,
  getAccountOrderCount,
  listAccountPointLedger,
  requireAccountUser
} from "@/features/account/queries";
import { formatDateTime } from "@/features/account/account-utils";
import { formatIohPointReason } from "@/features/points/queries";
import styles from "@/features/account/account-scene.module.css";

type AccountProfilePageProps = {
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function AccountProfilePage({ searchParams }: AccountProfilePageProps) {
  const [user, profile, points, pointLedger, orderCount] = await Promise.all([
    requireAccountUser(),
    getAccountProfile(),
    getAccountPointBalance(),
    listAccountPointLedger(5),
    getAccountOrderCount()
  ]);
  const params = await searchParams;
  const pointProgress = Math.min(points.balance, 100);

  return (
    <div className={styles.cards}>
      <div className={styles.contentHead}>
        <p className={styles.kicker}>07 / PROFILIM</p>
        <h2 className={styles.contentTitle}>Profilim</h2>
        <p className={styles.contentLead}>
          Bu bilgiler destek ekibinin hesabini hizli bulmasina yardim eder. Profil
          duzenleme, pazarlama tercihleri ve telefon dogrulama sonraki adimda
          genisletilebilir.
        </p>
      </div>

      {params?.saved === "preferences" ? (
        <div className={styles.notices}>
          <div className={styles.noticeSuccess}>Iletisim izinleriniz guncellendi.</div>
        </div>
      ) : null}
      {params?.error ? (
        <div className={styles.notices}>
          <div className={styles.noticeError}>Tercihler kaydedilemedi: {params.error}</div>
        </div>
      ) : null}

      <section className={styles.sectionPanel}>
        <div className={styles.cardTop}>
          <span className={`${styles.badge} ${styles.badgeGold}`}>Hesap</span>
          <span className={styles.badge}>{profile?.locale ?? "tr"}</span>
        </div>
        <dl className={styles.profileDl}>
          <div className={styles.profileItem}>
            <dt className={styles.profileLabel}>E-posta</dt>
            <dd className={styles.profileValue}>{profile?.email ?? user.email}</dd>
          </div>
          <div className={styles.profileItem}>
            <dt className={styles.profileLabel}>Ad Soyad</dt>
            <dd className={styles.profileValue}>{profile?.full_name ?? "Henuz eklenmedi"}</dd>
          </div>
          <div className={styles.profileItem}>
            <dt className={styles.profileLabel}>Telefon</dt>
            <dd className={styles.profileValue}>{profile?.phone ?? "Henuz eklenmedi"}</dd>
          </div>
          <div className={styles.profileItem}>
            <dt className={styles.profileLabel}>Kayit Tarihi</dt>
            <dd className={styles.profileValue}>{formatDateTime(profile?.created_at ?? null)}</dd>
          </div>
          <div className={styles.profileItem}>
            <dt className={styles.profileLabel}>E-posta Izni</dt>
            <dd className={styles.profileValue}>
              {profile?.marketing_email_opt_in ? "Onayli" : "Onay Yok"}
            </dd>
          </div>
          <div className={styles.profileItem}>
            <dt className={styles.profileLabel}>SMS Izni</dt>
            <dd className={styles.profileValue}>
              {profile?.marketing_sms_opt_in ? "Onayli" : "Onay Yok"}
            </dd>
          </div>
        </dl>
      </section>

      <div className={styles.pointsPanel}>
        <div className={styles.pointsHead}>
          <div className={styles.pointsInfo}>
            <span className={`${styles.badge} ${styles.badgeGold}`}>IOH PUAN</span>
            <h3 className={styles.pointsTitle}>IOH puan bakiyesi</h3>
            <p className={styles.pointsDesc}>
              Uye olma ve basarili kitap siparislerinden kazandiginiz uygulama ici
              puanlar. Yatirim araci degildir.
            </p>
          </div>
          <div className={styles.pointsValue}>
            <span className={styles.pointsNumber}>{points.balance}</span>
            <span className={styles.pointsUnit}>IOH Puan</span>
          </div>
        </div>
        <div>
          <div className={styles.pointsBarLabel}>
            <span>Sonraki Hedef</span>
            <span>{pointProgress}/100 IOH</span>
          </div>
          <div
            aria-label="IOH puan ilerleme bari"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={pointProgress}
            className={styles.pointsBar}
            role="progressbar"
          >
            <div className={styles.pointsBarFill} style={{ width: `${pointProgress}%` }} />
          </div>
          {points.balance > 100 ? (
            <p className={styles.cardMono} style={{ marginTop: "0.5rem" }}>
              Bar 100 IOH hedefinde dolu gorunur; gercek bakiyeniz yukarida.
            </p>
          ) : null}
        </div>
        <div className={styles.pointsStats}>
          <div className={styles.pointsStat}>
            <span className={styles.pointsStatLabel}>Toplam Kazanilan</span>
            <span className={styles.pointsStatValue}>{points.lifetimeEarned} IOH</span>
          </div>
          <div className={styles.pointsStat}>
            <span className={styles.pointsStatLabel}>Toplam Kullanilan</span>
            <span className={styles.pointsStatValue}>{points.lifetimeSpent} IOH</span>
          </div>
          <div className={styles.pointsStat}>
            <span className={styles.pointsStatLabel}>Siparis Sayisi</span>
            <span className={styles.pointsStatValue}>{orderCount}</span>
          </div>
          <div className={styles.pointsStat}>
            <span className={styles.pointsStatLabel}>Mevcut Bakiye</span>
            <span className={styles.pointsStatValue}>{points.balance} IOH</span>
          </div>
        </div>
      </div>

      {pointLedger.length > 0 ? (
        <section className={styles.sectionPanel}>
          <div className={styles.cardRow}>
            <h3 className={styles.sectionTitle}>Puan Gecmisi</h3>
            <span className={styles.badge}>Son {pointLedger.length}</span>
          </div>
          <div className={styles.ledger}>
            {pointLedger.map((entry) => (
              <div className={styles.ledgerItem} key={entry.id}>
                <div className={styles.ledgerInfo}>
                  <span className={styles.ledgerReason}>{formatIohPointReason(entry.reason)}</span>
                  <span className={styles.ledgerDate}>
                    {formatDateTime(entry.created_at)}
                    {entry.order_id ? ` / Siparis: ${entry.order_id.slice(0, 8)}` : ""}
                  </span>
                </div>
                <span className={`${styles.ledgerAmount} ${entry.amount < 0 ? styles.ledgerAmountNegative : ""}`}>
                  {entry.amount > 0 ? "+" : ""}{entry.amount} IOH
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <form action={updateCommunicationPreferences} className={styles.sectionPanel}>
        <h3 className={styles.sectionTitle}>Iletisim Izinleri</h3>
        <p className={styles.cardDesc}>
          Bu alanlar acik riza kapsamindadir; KVKK aydinlatma metnini okumakla
          pazarlama izni vermis olmazsiniz. Izinleri istediginiz zaman
          kapatabilirsiniz.
        </p>
        <div className={styles.cards}>
          <label className={styles.card} style={{ padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <input
              defaultChecked={profile?.marketing_email_opt_in ?? false}
              name="email_marketing_consent"
              type="checkbox"
              style={{ marginTop: "0.2rem", accentColor: "var(--a-gold)" }}
            />
            <span className={styles.cardDesc}>
              E-posta ile kampanya, yeni kitap ve koleksiyon duyurulari almak istiyorum.
            </span>
          </label>
          <label className={styles.card} style={{ padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <input
              defaultChecked={profile?.marketing_sms_opt_in ?? false}
              name="sms_marketing_consent"
              type="checkbox"
              style={{ marginTop: "0.2rem", accentColor: "var(--a-gold)" }}
            />
            <span className={styles.cardDesc}>
              SMS/telefon kanaliyla kampanya ve siparis disi duyuru almak istiyorum.
            </span>
          </label>
        </div>
        <button className={styles.btnPrimary} type="submit">Izinleri Kaydet</button>
      </form>
    </div>
  );
}
