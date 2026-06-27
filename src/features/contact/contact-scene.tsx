import Link from "next/link";
import type { ReactNode } from "react";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { getHeaderUserView } from "@/features/auth/queries";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import styles from "./contact-scene.module.css";
import { IohSceneHeader } from "@/components/layout/ioh-scene-header";

const channels = [
  {
    description:
      "Basin, roportaj ve yayin talepleri icin merkezi kanal. IOH Universe ve yazar hakkinda resmi bilgi almak icin kullanilir.",
    method: "press@iohuniverse.com",
    number: "01",
    tag: "PRESS",
    title: "Basin ve Roportajlar"
  },
  {
    description:
      "Yayinci, marka, koleksiyon ve dijital is birligi talepleri icin dogrudan baglanti noktasi.",
    method: "hello@iohuniverse.com",
    number: "02",
    tag: "PARTNERS",
    title: "Is Birligi Talepleri"
  },
  {
    description:
      "Siparis, dijital teslimat, indirme erisimi ve hesap konularinda okuyucu destegi.",
    method: "destek@iohuniverse.com",
    number: "03",
    tag: "READER",
    title: "Okuyucu Destegi"
  },
  {
    description:
      "Site erisimi, odeme hatlari ve teknik sorunlar icin ayri destek kanali.",
    method: "tech@iohuniverse.com",
    number: "04",
    tag: "TECH",
    title: "Teknik ve Site Destegi"
  }
] as const;

const directLinks = [
  {
    href: "mailto:contact@iohuniverse.com",
    label: "Email",
    note: "Genel iletisim ve yonlendirme.",
    value: "contact@iohuniverse.com"
  },
  {
    href: "/journal",
    label: "Topluluk",
    note: "Telegram kanali ileride duyurulacak.",
    value: "Telegram (ileride)"
  },
  {
    href: "/",
    label: "Website",
    note: "IOH Universe ana sayfa.",
    value: "IOH Universe"
  }
] as const;

function Kicker({ children }: { children: ReactNode }) {
  return <p className={styles.kicker}>{children}</p>;
}



function ContactHero() {
  return (
    <section className={styles.hero} id="contact">
      <div className={styles.heroGhost} aria-hidden="true">CONTACT</div>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={`${styles.shell} ${styles.heroShell}`}>
        <Kicker>SIGNAL ROOM</Kicker>
        <h1 className={styles.heroTitle}>Dogru konu icin dogru kanal</h1>
        <p className={styles.heroLead}>
          IOH Universe ile ilgili tum iletisim talepleri icin merkezi baglanti
          noktasi. Talebinizi dogru kanala yonlendirerek en hizli yaniti alin.
        </p>
      </div>
      <aside className={styles.infoPanel}>
        <div className={styles.infoHead}>
          <Kicker>IOH / STATUS</Kicker>
          <h2 className={styles.infoTitle}>IOH Universe</h2>
        </div>
        <div className={styles.infoRows}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Yazar</span>
            <span className={styles.infoValue}>Samet Yurttas</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Durum</span>
            <span className={`${styles.infoValue} ${styles.infoValueGold}`}>Aktif</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Yanit suresi</span>
            <span className={styles.infoValue}>1–3 Is Gunu</span>
          </div>
        </div>
        <div className={styles.infoChannels}>
          <span className={styles.infoChannelTag}>Basin</span>
          <span className={styles.infoChannelTag}>Is Birligi</span>
          <span className={styles.infoChannelTag}>Okuyucu Destegi</span>
          <span className={styles.infoChannelTag}>Teknik Destek</span>
        </div>
      </aside>
    </section>
  );
}

function ContactMarquee() {
  return (
    <div className={styles.marquee} aria-hidden="true">
      <div>
        <span>IOH SIGNAL ROOM / ILETISIM MERKEZI / DOGRU KANAL / HIZLI YANIT /</span>
        <span>IOH SIGNAL ROOM / ILETISIM MERKEZI / DOGRU KANAL / HIZLI YANIT /</span>
      </div>
    </div>
  );
}

function ContactChannels() {
  return (
    <section className={styles.channels} id="channels">
      <div className={styles.shell}>
        <div className={styles.channelsHeader}>
          <Kicker>01 / ILETISIM KANALLARI</Kicker>
          <div>
            <h2>DOGRU KANAL, HIZLI YANIT</h2>
            <p className={styles.channelsLead}>
              Her talep turu icin ayri bir kanal tutulur. Dogru kanala yazmak,
              yanit suresini kisa tutar.
            </p>
          </div>
        </div>
        <div className={styles.channelGrid}>
          {channels.map((channel) => (
            <article className={styles.channelCard} key={channel.number}>
              <div className={styles.channelCardTop}>
                <span className={styles.channelNumber}>/ {channel.number}</span>
                <span className={styles.channelTag}>{channel.tag}</span>
              </div>
              <h3 className={styles.channelTitle}>{channel.title}</h3>
              <p className={styles.channelDesc}>{channel.description}</p>
              <div className={styles.channelMethod}>
                <span className={styles.channelMethodLabel}>E-posta</span>
                <span className={styles.channelMethodValue}>{channel.method}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactDirect() {
  return (
    <section className={styles.direct} id="direct">
      <div className={styles.shell}>
        <Kicker>02 / DOGRUDAN ILETISIM</Kicker>
        <div className={styles.directInner}>
          {directLinks.map((link) => (
            <article className={styles.directCard} key={link.label}>
              <span className={styles.directLabel}>{link.label}</span>
              <Link className={styles.directValue} href={link.href}>
                {link.value}
              </Link>
              <span className={styles.directNote}>{link.note}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function ContactScene() {
  const userView = await getHeaderUserView();

  return (
    <div className={styles.page}>
      <IohIndexStyles />
      <style dangerouslySetInnerHTML={{ __html: "body{cursor:auto!important}a,button,[data-hover],[data-magnet]{cursor:pointer!important}" }} />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <IohSceneHeader user={userView} />
      <main className={styles.main} id="main-content">
        <ContactHero />
        <ContactMarquee />
        <ContactChannels />
        <ContactDirect />
        <BooksIndexFooter />
      </main>
    </div>
  );
}
