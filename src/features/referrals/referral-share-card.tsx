"use client";

import { useState } from "react";
import styles from "@/features/account/account-scene.module.css";

type ReferralShareCardProps = {
  code: string;
  link: string;
};

function buildShareUrl(provider: "telegram" | "twitter" | "whatsapp", link: string) {
  const text = `IOHBOOK'a davet linkimle katil: ${link}`;

  if (provider === "whatsapp") {
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  if (provider === "telegram") {
    return `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("IOHBOOK'a katil")}`;
  }

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function ReferralShareCard({ code, link }: ReferralShareCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className={styles.pointsPanel}>
      <div className={styles.pointsHead}>
        <div className={styles.pointsInfo}>
          <span className={`${styles.badge} ${styles.badgeGold}`}>DAVET KODU</span>
          <h3 className={styles.pointsTitle}>{code}</h3>
          <p className={styles.pointsDesc}>
            Bu linkle kaydolan arkadasin e-posta dogrulamasini tamamladiginda iki
            hesaba da IOH puani islenir.
          </p>
        </div>
        <button className={styles.btnPrimary} onClick={copyLink} type="button">
          {copied ? "Kopyalandi" : "Linki Kopyala"}
        </button>
      </div>
      <div className={styles.pointsStat}>
        <span className={styles.pointsStatLabel}>Referral Link</span>
        <span className={styles.walletAddress}>{link}</span>
      </div>
      <div className={styles.cardActions}>
        <a
          className={styles.btnLink}
          href={buildShareUrl("whatsapp", link)}
          rel="noreferrer"
          target="_blank"
        >
          WhatsApp
        </a>
        <a
          className={styles.btnLink}
          href={buildShareUrl("telegram", link)}
          rel="noreferrer"
          target="_blank"
        >
          Telegram
        </a>
        <a
          className={styles.btnLink}
          href={buildShareUrl("twitter", link)}
          rel="noreferrer"
          target="_blank"
        >
          X / Twitter
        </a>
      </div>
    </section>
  );
}
