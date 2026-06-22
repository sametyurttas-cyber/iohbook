import { formatAddressLines } from "@/features/account/account-utils";
import { listAccountAddresses } from "@/features/account/queries";
import styles from "@/features/account/account-scene.module.css";

export default async function AccountAddressesPage() {
  const addresses = await listAccountAddresses();

  return (
    <div className={styles.cards}>
      <div className={styles.contentHead}>
        <p className={styles.kicker}>06 / ADRESLERIM</p>
        <h2 className={styles.contentTitle}>Adreslerim</h2>
        <p className={styles.contentLead}>
          Kayitli adresler checkout hatalarini azaltir. Adres duzenleme bir sonraki
          hesap yonetimi adiminda eklenecek; checkout yine de yeni adres alabilir.
        </p>
      </div>

      {addresses.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyVisual}>IOH</div>
          <h3 className={styles.emptyTitle}>Kayitli adres yok</h3>
          <p className={styles.emptyDesc}>
            Fiziksel gonderimler aktif oldugunda adreslerini buradan yonetebilirsin.
            Su anda checkout adresini satin alma aninda alir.
          </p>
          <span className={`${styles.emptyCta} ${styles.emptyCtaDisabled}`}>
            Adres Duzenleme Yakinda
          </span>
        </div>
      ) : (
        <div className={styles.grid2}>
          {addresses.map((address) => (
            <article className={styles.card} key={address.id}>
              <div className={styles.cardTop}>
                <span className={`${styles.badge} ${address.is_default ? styles.badgeGold : ""}`}>
                  {address.type === "shipping" ? "Teslimat" : "Fatura"}
                </span>
                {address.is_default ? (
                  <span className={`${styles.badge} ${styles.badgeBlue}`}>Varsayilan</span>
                ) : null}
              </div>
              <h3 className={styles.cardTitle}>{address.full_name}</h3>
              <div className={styles.cards}>
                {formatAddressLines(address).map((line) => (
                  <p className={styles.cardDesc} key={line}>{line}</p>
                ))}
              </div>
              {address.phone ? (
                <p className={styles.cardMono}>Telefon: <b>{address.phone}</b></p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
