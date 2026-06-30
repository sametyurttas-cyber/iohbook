import Link from "next/link";
import type { ReactNode } from "react";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { getHeaderUserView } from "@/features/auth/queries";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import styles from "./contact-scene.module.css";
import { IohSceneHeader } from "@/components/layout/ioh-scene-header";
import { ContactForm } from "./contact-form";

const directLinks = [
  {
    href: "https://t.me/+U38BUu-Jlfg4ZGU0",
    label: "Telegram",
    note: "Resmi IOH duyuru ve yardimlasma kanali.",
    value: "Telegram Channel"
  },
  {
    href: "https://instagram.com/iohbook",
    label: "Instagram",
    note: "Gorsel arsiv, duyurular ve konsept tasarimlar.",
    value: "@iohbook"
  },
  {
    href: "https://x.com/iohchain",
    label: "Twitter / 𝕏",
    note: "Duyuru ve ekosistem guncellemeleri.",
    value: "@iohchain"
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
        <h1 className={styles.heroTitle}>Sinyal Odası</h1>
        <p className={styles.heroLead}>
          IOH Universe ile ilgili tüm iletişim talepleri için doğrudan sinyal gönderin. 
          Mesajınız veritabanımıza kilitlenecek ve operasyon birimimiz tarafından incelenecektir.
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
            <span className={styles.infoLabel}>Yanıt Süresi</span>
            <span className={styles.infoValue}>24 Saat</span>
          </div>
        </div>
        <div className={styles.infoChannels}>
          <span className={styles.infoChannelTag}>Support</span>
          <span className={styles.infoChannelTag}>Partnership</span>
          <span className={styles.infoChannelTag}>Press</span>
          <span className={styles.infoChannelTag}>Tech</span>
        </div>
      </aside>
    </section>
  );
}

function ContactMarquee() {
  return (
    <div className={styles.marquee} aria-hidden="true">
      <div>
        <span>IOH SIGNAL ROOM / TRANSMIT DIRECT MESSAGE / SECURED CONNECTION / NO MIDDLEMAN /</span>
        <span>IOH SIGNAL ROOM / TRANSMIT DIRECT MESSAGE / SECURED CONNECTION / NO MIDDLEMAN /</span>
      </div>
    </div>
  );
}

function ContactFormSection() {
  return (
    <section className="py-20 border-b border-[rgba(242,239,232,0.08)] bg-[#05060a]/40" id="form-section">
      <div className={styles.shell}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-4 font-mono">
            <Kicker>01 / TRANSMISSION GATE</Kicker>
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#f2efe8] leading-tight">
              DOĞRUDAN MESAJ İLETİMİ
            </h2>
            <p className="text-xs text-[#9297a6] leading-relaxed">
              Herhangi bir mail sunucusu veya aracı kullanmadan mesajınızı doğrudan IOH çekirdek veritabanına iletin. 
              Güvenli veri kuyruğumuz sayesinde her sinyal doğrudan admin yönetim paneline ulaşır.
            </p>
          </div>
          <div className="lg:col-span-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactDirect() {
  return (
    <section className={styles.direct} id="direct">
      <div className={styles.shell}>
        <Kicker>02 / SOSYAL BAĞLANTILAR</Kicker>
        <div className={styles.directInner}>
          {directLinks.map((link) => (
            <article className={styles.directCard} key={link.label}>
              <span className={styles.directLabel}>{link.label}</span>
              <Link 
                className={styles.directValue} 
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
              >
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
        <ContactFormSection />
        <ContactDirect />
        <BooksIndexFooter />
      </main>
    </div>
  );
}
