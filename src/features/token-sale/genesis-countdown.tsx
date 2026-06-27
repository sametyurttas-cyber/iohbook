"use client";

import { useEffect, useState } from "react";
import styles from "./token-sale-scene.module.css";

const TARGET_DATE = new Date("2027-06-27T12:00:00+03:00").getTime();

export function GenesisCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    function calculateTime() {
      const now = Date.now();
      const difference = TARGET_DATE - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.countdownSection}>
      <div className={styles.countdownShell}>
        <div className={styles.countdownKicker}>
          <span>GENESIS COUNTDOWN / ECOSYSTEM LAUNCH</span>
        </div>
        
        {timeLeft.isExpired ? (
          <div className={styles.expiredMessage}>
            GENESIS PHASE COMPLETED / ECOSYSTEM ACTIVE
          </div>
        ) : (
          <div className={styles.countdownGrid}>
            <div className={styles.countdownBox}>
              <span className={styles.countdownNumber}>
                {String(timeLeft.days).padStart(3, "0")}
              </span>
              <span className={styles.countdownLabel}>GÜN</span>
            </div>
            <div className={styles.countdownDivider}>:</div>
            <div className={styles.countdownBox}>
              <span className={styles.countdownNumber}>
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className={styles.countdownLabel}>SAAT</span>
            </div>
            <div className={styles.countdownDivider}>:</div>
            <div className={styles.countdownBox}>
              <span className={styles.countdownNumber}>
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className={styles.countdownLabel}>DK</span>
            </div>
            <div className={styles.countdownDivider}>:</div>
            <div className={styles.countdownBox}>
              <span className={styles.countdownNumber}>
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className={styles.countdownLabel}>SN</span>
            </div>
          </div>
        )}

        <p className={styles.countdownDescription}>
          Ecosystem Launch sonrasında IOH Puanlarının IOHCOIN'e dönüşümü planlanmaktadır. 
          Early access sürecinde elde edilen her katılım hakkı, gelecek kullanım alanları için temel oluşturur.
        </p>
      </div>
    </section>
  );
}
