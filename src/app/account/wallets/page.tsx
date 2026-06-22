import { formatDateTime, shortenWalletAddress } from "@/features/account/account-utils";
import { revokeWalletLink } from "@/features/wallets/actions";
import { WalletConnectPanel } from "@/features/wallets/wallet-connect-panel";
import {
  listAccountClaimReservations,
  listAccountUserWallets,
  listAccountWalletLinks
} from "@/features/wallets/queries";
import styles from "@/features/account/account-scene.module.css";

type AccountWalletsPageProps = {
  searchParams?: Promise<{
    error?: string;
    saved?: string;
    sign?: string;
  }>;
};

export default async function AccountWalletsPage({ searchParams }: AccountWalletsPageProps) {
  const [walletLinks, wallets, reservations, params] = await Promise.all([
    listAccountWalletLinks(),
    listAccountUserWallets(),
    listAccountClaimReservations(),
    searchParams
  ]);
  const pendingLinks = walletLinks.filter((wallet) => wallet.status === "pending");

  return (
    <div className={styles.cards}>
      <div className={styles.contentHead}>
        <p className={styles.kicker}>05 / CUZDANLARIM</p>
        <h2 className={styles.contentTitle}>Cuzdanlarim</h2>
        <p className={styles.contentLead}>
          NFT-ready kimlik icin cuzdan sahipligi dogrulamasi. Hukuk onayi gelmeden
          mint, satis, odeme, token transferi veya zincir uzerinde claim islemi
          acilmaz.
        </p>
      </div>

      {params?.saved ? (
        <div className={styles.notices}>
          <div className={styles.noticeSuccess}>Islem tamamlandi: {params.saved}</div>
        </div>
      ) : null}
      {params?.error ? (
        <div className={styles.notices}>
          <div className={styles.noticeError}>Cuzdan islemi tamamlanamadi: {params.error}</div>
        </div>
      ) : null}

      <WalletConnectPanel
        pendingLinks={pendingLinks}
        projectId={process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}
      />

      <section className={styles.sectionPanel}>
        <h3 className={styles.sectionTitle}>Bagli Cuzdanlar</h3>
        {wallets.length === 0 ? (
          <p className={styles.cardDesc}>Henuz dogrulanmis cuzdan yok.</p>
        ) : (
          <div className={styles.cards}>
            {wallets.map((wallet) => (
              <article className={styles.card} key={wallet.id}>
                <div className={styles.cardRow}>
                  <div className={styles.cardMain}>
                    <div className={styles.cardTop}>
                      <span className={`${styles.badge} ${styles.badgeGold}`}>Dogrulanmis</span>
                      <span className={styles.badge}>{wallet.provider}</span>
                      {wallet.chain_id ? (
                        <span className={styles.badge}>Chain {wallet.chain_id}</span>
                      ) : null}
                      {wallet.is_primary ? (
                        <span className={`${styles.badge} ${styles.badgeBlue}`}>Primary</span>
                      ) : null}
                    </div>
                    <p className={styles.walletShort}>{shortenWalletAddress(wallet.normalized_address)}</p>
                    <p className={styles.cardMono}>Ilk dogrulama: <b>{formatDateTime(wallet.verified_at)}</b></p>
                  </div>
                  <form action={revokeWalletLink}>
                    <input name="wallet_id" type="hidden" value={wallet.id} />
                    <button className={styles.btnGhost} type="submit">Kaldir</button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.sectionPanel}>
        <h3 className={styles.sectionTitle}>Allowlist Rezervasyonlari</h3>
        <p className={styles.cardDesc}>
          Bu alan sadece hazirlik kaydidir. Zincir uzerinde claim/mint islemi
          baslatmaz.
        </p>
        {reservations.length === 0 ? (
          <p className={styles.cardDesc}>Aktif rezervasyon yok.</p>
        ) : (
          <div className={styles.cards}>
            {reservations.map((reservation) => (
              <article className={styles.card} key={reservation.id}>
                <div className={styles.cardTop}>
                  <span className={styles.badge}>{reservation.status}</span>
                  {reservation.nft_collections ? (
                    <span className={`${styles.badge} ${styles.badgeBlue}`}>
                      {reservation.nft_collections.title}
                    </span>
                  ) : null}
                </div>
                <p className={styles.profileValue}>
                  {reservation.nft_items?.title ?? reservation.allowlist_reason ?? "Gelecek claim rezervasyonu"}
                </p>
                <p className={styles.cardMono}>Claim acilisi: <b>{formatDateTime(reservation.claim_opens_at)}</b></p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
