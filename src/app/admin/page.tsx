import Link from "next/link";
import type { ReactNode } from "react";
import styles from "@/features/admin/admin-scene.module.css";

const modules = [
  {
    description: "Kitap ust kayitlarini, varyantlari, stok ve medya yonetimini ac.",
    href: "/admin/products",
    number: "01",
    title: "Urunler"
  },
  {
    description: "Odeme, fulfillment ve kargo operasyonlarini tek ekrandan izle.",
    href: "/admin/orders",
    number: "02",
    title: "Siparisler"
  },
  {
    description: "Musteri profilleri, IOH puan ve wallet yonetimi.",
    href: "/admin/users",
    number: "03",
    title: "Kullanicilar"
  },
  {
    description: "NFT teslimat ve mint fulfillment takibi.",
    href: "/admin/nft-orders",
    number: "04",
    title: "NFT Siparisleri"
  },
  {
    description: "IOHcoin kampanya ve paket yonetimi.",
    href: "/admin/token-campaigns",
    number: "05",
    title: "Token Kampanyalari"
  },
  {
    description: "Allocation kayitlari ve manuel transfer takibi.",
    href: "/admin/token-sales",
    number: "06",
    title: "Token Satislari"
  },
  {
    description: "Ana sayfa, yazar, iletisim ve SSS icerik yonetimi.",
    href: "/admin/content",
    number: "07",
    title: "Icerik"
  },
  {
    description: "Kapak, galeri ve banner gorselleri yukleme alani.",
    href: "/admin/media",
    number: "08",
    title: "Medya"
  }
] as const;

function Kicker({ children }: { children: ReactNode }) {
  return <p className={styles.kicker}>{children}</p>;
}

export default function AdminPage() {
  return (
    <main className={styles.main} id="main-content">
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.heroMain}>
            <div className={styles.heroGhost} aria-hidden="true">ADMIN</div>
            <Kicker>IOH / OPERATIONS CENTER</Kicker>
            <h2 className={styles.heroTitle}>Yonetim Merkezi</h2>
            <p className={styles.heroLead}>
              Bu alan sadece aktif staff rolu olan kullaniclar icindir. Urun,
              siparis, stok, icerik, token ve NFT operasyonlarini tek merkezden
              yonetin.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.modules}>
        {modules.map((mod) => (
          <Link className={styles.moduleCard} href={mod.href} key={mod.href}>
            <div className={styles.moduleCardTop}>
              <span className={styles.moduleNumber}>/ {mod.number}</span>
              <span className={styles.moduleArrow} aria-hidden="true">-&gt;</span>
            </div>
            <h3 className={styles.moduleTitle}>{mod.title}</h3>
            <p className={styles.moduleDesc}>{mod.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
