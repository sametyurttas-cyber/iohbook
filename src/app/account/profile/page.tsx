import { updateCommunicationPreferences } from "@/features/account/actions";
import {
  getAccountPointBalance,
  getAccountProfile,
  getAccountOrderCount,
  listAccountPointLedger,
  requireAccountUser
} from "@/features/account/queries";
import { getAccountEmailPreferences } from "@/features/email/preferences-actions";
import { formatDateTime } from "@/features/account/account-utils";
import { formatIohPointReason, getIohPointLedgerDetail, getIohPointLedgerTitle } from "@/features/points/queries";
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
  const emailPrefs = await getAccountEmailPreferences(profile?.id || user.id);
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
                  <span className={styles.ledgerReason}>{getIohPointLedgerTitle(entry)}</span>
                  <span className={styles.ledgerDate}>
                    {formatDateTime(entry.created_at)}
                    {entry.order_id ? ` / Siparis: ${entry.order_id.slice(0, 8)}` : ""}
                  </span>
                  {getIohPointLedgerDetail(entry) ? (
                    <span className={styles.ledgerDetail}>{getIohPointLedgerDetail(entry)}</span>
                  ) : null}
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
        <h3 className={styles.sectionTitle}>Iletisim Tercihleri & İzinleri</h3>
        <p className={styles.cardDesc}>
          Tercihlerinizi istediğiniz zaman güncelleyebilirsiniz. Pazarlama ve duyuru iletişimleri açık rıza kapsamındadır.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Transactional (Mandatory) */}
          <label className={styles.card} style={{ padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", alignItems: "flex-start", opacity: 0.8 }}>
            <input
              checked={true}
              disabled={true}
              type="checkbox"
              style={{ marginTop: "0.2rem", accentColor: "var(--a-gold)", cursor: "not-allowed" }}
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-mono text-[#f2efe8] font-bold">İşlemsel E-postalar (Sipariş ve Sistem Bildirimleri)</span>
              <span className={styles.cardDesc} style={{ fontSize: "10px" }}>
                Sipariş onayları, dijital teslimat ve hesap doğrulama e-postaları. Kapatılamaz (Zorunlu).
              </span>
            </div>
          </label>

          {/* Marketing */}
          <label className={styles.card} style={{ padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", alignItems: "flex-start", cursor: "pointer" }}>
            <input
              defaultChecked={emailPrefs.marketing_enabled}
              name="email_marketing_consent"
              type="checkbox"
              style={{ marginTop: "0.2rem", accentColor: "var(--a-gold)" }}
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-mono text-[#f2efe8] font-bold">Kampanya ve Pazarlama E-postaları</span>
              <span className={styles.cardDesc} style={{ fontSize: "10px" }}>
                Yeni kitap duyuruları, indirimler ve dönemsel kampanyalar.
              </span>
            </div>
          </label>

          {/* Product Updates */}
          <label className={styles.card} style={{ padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", alignItems: "flex-start", cursor: "pointer" }}>
            <input
              defaultChecked={emailPrefs.product_updates_enabled}
              name="email_product_updates"
              type="checkbox"
              style={{ marginTop: "0.2rem", accentColor: "var(--a-gold)" }}
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-mono text-[#f2efe8] font-bold">Ürün ve İçerik Güncellemeleri</span>
              <span className={styles.cardDesc} style={{ fontSize: "10px" }}>
                Platforma eklenen yeni özellikler ve dijital format güncellemeleri.
              </span>
            </div>
          </label>

          {/* Community */}
          <label className={styles.card} style={{ padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", alignItems: "flex-start", cursor: "pointer" }}>
            <input
              defaultChecked={emailPrefs.community_enabled}
              name="email_community"
              type="checkbox"
              style={{ marginTop: "0.2rem", accentColor: "var(--a-gold)" }}
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-mono text-[#f2efe8] font-bold">Topluluk ve Duyurular</span>
              <span className={styles.cardDesc} style={{ fontSize: "10px" }}>
                Evren güncellemeleri, ansiklopedi girdileri ve yazar mesajları.
              </span>
            </div>
          </label>

          {/* Amazon Rewards */}
          <label className={styles.card} style={{ padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", alignItems: "flex-start", cursor: "pointer" }}>
            <input
              defaultChecked={emailPrefs.amazon_rewards_enabled}
              name="email_amazon_rewards"
              type="checkbox"
              style={{ marginTop: "0.2rem", accentColor: "var(--a-gold)" }}
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-mono text-[#f2efe8] font-bold">Amazon Ödül Bildirimleri (Önerilen)</span>
              <span className={styles.cardDesc} style={{ fontSize: "10px" }}>
                Amazon yorum/satın alma onaylarınız ve IOH puan hareketleriniz.
              </span>
            </div>
          </label>

          {/* SMS Consent */}
          <label className={styles.card} style={{ padding: "1rem 1.25rem", display: "flex", gap: "0.75rem", alignItems: "flex-start", cursor: "pointer" }}>
            <input
              defaultChecked={profile?.marketing_sms_opt_in ?? false}
              name="sms_marketing_consent"
              type="checkbox"
              style={{ marginTop: "0.2rem", accentColor: "var(--a-gold)" }}
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-mono text-[#f2efe8] font-bold">SMS / Telefon İletişimleri</span>
              <span className={styles.cardDesc} style={{ fontSize: "10px" }}>
                SMS kanalıyla sipariş dışı duyurular ve özel kampanya bildirimleri.
              </span>
            </div>
          </label>
        </div>
        <button className={styles.btnPrimary} type="submit">İzinleri ve Tercihleri Kaydet</button>
      </form>
    </div>
  );
}
