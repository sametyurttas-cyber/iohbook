"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IohSceneHeader,
  type IohSceneHeaderUser
} from "@/components/layout/ioh-scene-header";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { EncyclopediaTracker } from "@/features/analytics/encyclopedia-tracker";
import { factions, technologies, timeline } from "./encyclopedia-data";
import styles from "./encyclopedia-scene.module.css";

export function EncyclopediaScene({ user }: { user: IohSceneHeaderUser }) {
  const [activeColumn, setActiveColumn] = useState<number | null>(null);
  const [systemOnline, setSystemOnline] = useState(false);

  useEffect(() => {
    setSystemOnline(true);
  }, []);

  return (
    <div className={styles.page}>
      <IohIndexStyles />
      <style
        dangerouslySetInnerHTML={{
          __html: "body{cursor:auto!important}a,button,[data-hover],[data-magnet]{cursor:pointer!important}"
        }}
      />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      
      {/* Main Header */}
      <IohSceneHeader user={user} />
      <EncyclopediaTracker />

      {/* Sub-Header Navigation Bar */}
      <div className={styles.subHeader}>
        <div className={styles.subHeaderInner}>
          <span className={styles.systemStatus}>
            <span className={styles.statusPulse} />
            ARCHIVE SYSTEM ACTIVE
          </span>
          <nav className={styles.subHeaderNav}>
            <Link href="/encyclopedia" className={styles.subHeaderLinkActive}>
              PORTAL INDEX
            </Link>
            <Link href="/encyclopedia/characters" className={styles.subHeaderLink}>
              CHARACTERS
            </Link>
            <Link href="/encyclopedia/corporations" className={styles.subHeaderLink}>
              CORPORATIONS
            </Link>
            <Link href="/encyclopedia/swos" className={styles.subHeaderLink}>
              SWOS AUTHORITY
            </Link>
          </nav>
        </div>
      </div>

      <main className={styles.main}>
        {/* Portal Hero */}
        <section className={styles.heroSection}>
          <div className={styles.heroGlow} />
          <h1 className={styles.heroTitle}>THE ARCHIVE</h1>
          <p className={styles.heroSubtitle}>
            IOH UNIVERSE CORE DIRECTORY // ACCESS COMPLETED FOR YEAR 2303
          </p>
        </section>

        {/* 3-Column Tri-Sector Gateway */}
        <section className={styles.portalGrid}>
          {/* Column 1: Characters */}
          <div 
            className={`${styles.portalColumn} ${activeColumn === 0 ? styles.columnExpanded : ""} ${activeColumn !== null && activeColumn !== 0 ? styles.columnCollapsed : ""}`}
            onMouseEnter={() => setActiveColumn(0)}
            onMouseLeave={() => setActiveColumn(null)}
            style={{ "--accent-color": "#e7c574" } as React.CSSProperties}
          >
            <div className={styles.columnBackground} style={{ backgroundImage: "url('/media/encyclopedia/characters/algus.webp')" }} />
            <div className={styles.columnOverlay} />
            <div className={styles.columnGlow} />
            
            <div className={styles.columnContent}>
              <div className={styles.sectorMeta}>
                <span>SECTOR 01 // RESISTANCE</span>
                <span className={styles.securityBadge} style={{ color: "#e7c574", borderColor: "#e7c574" }}>CODE GOD</span>
              </div>
              <h2 className={styles.columnTitle}>KARAKTERLER (THE TEAM)</h2>
              <p className={styles.columnDesc}>
                Godcode programcıları, siber aktivistler ve fiziksel gerçeklik anılarını korumaya çalışan isyankar bilinçler.
              </p>
              
              <div className={styles.telemetryGrid}>
                <div className={styles.telemetryItem}>
                  <span className={styles.telemetryLabel}>REGISTERED COGNITIONS</span>
                  <span className={styles.telemetryValue}>5 ACTIVE DOSSIERS</span>
                </div>
                <div className={styles.telemetryItem}>
                  <span className={styles.telemetryLabel}>THREAT ASSESSMENT</span>
                  <span className={styles.telemetryValue} style={{ color: "#ff3b3b" }}>CRITICAL OUTLIER</span>
                </div>
              </div>

              <Link href="/encyclopedia/characters" className={styles.columnBtn}>
                ENTER DOSSIERS [→]
              </Link>
            </div>
          </div>

          {/* Column 2: Corporations */}
          <div 
            className={`${styles.portalColumn} ${activeColumn === 1 ? styles.columnExpanded : ""} ${activeColumn !== null && activeColumn !== 1 ? styles.columnCollapsed : ""}`}
            onMouseEnter={() => setActiveColumn(1)}
            onMouseLeave={() => setActiveColumn(null)}
            style={{ "--accent-color": "#ff5533" } as React.CSSProperties}
          >
            <div className={styles.columnBackground} style={{ backgroundImage: "url('/media/encyclopedia/cities/archive-map.webp')" }} />
            <div className={styles.columnOverlay} />
            <div className={styles.columnGlow} />

            <div className={styles.columnContent}>
              <div className={styles.sectorMeta}>
                <span>SECTOR 02 // CAPITALISM</span>
                <span className={styles.securityBadge} style={{ color: "#ff5533", borderColor: "#ff5533" }}>CODE WAR</span>
              </div>
              <h2 className={styles.columnTitle}>ŞİRKETLER (CORPORATIONS)</h2>
              <p className={styles.columnDesc}>
                Centrium kaynaklarını, siber sunucuları ve zihin aktarım portallarını yöneten acımasız şirketler koalisyonu.
              </p>

              <div className={styles.telemetryGrid}>
                <div className={styles.telemetryItem}>
                  <span className={styles.telemetryLabel}>CONTROL RATIO</span>
                  <span className={styles.telemetryValue}>64.8% TOTAL CAPITAL</span>
                </div>
                <div className={styles.telemetryItem}>
                  <span className={styles.telemetryLabel}>PRIMARY OBJECTIVE</span>
                  <span className={styles.telemetryValue}>EGO COMMERCIALIZATION</span>
                </div>
              </div>

              <Link href="/encyclopedia/corporations" className={styles.columnBtn}>
                ACCESS CONGLOMERATE [→]
              </Link>
            </div>
          </div>

          {/* Column 3: SWOS */}
          <div 
            className={`${styles.portalColumn} ${activeColumn === 2 ? styles.columnExpanded : ""} ${activeColumn !== null && activeColumn !== 2 ? styles.columnCollapsed : ""}`}
            onMouseEnter={() => setActiveColumn(2)}
            onMouseLeave={() => setActiveColumn(null)}
            style={{ "--accent-color": "#7aa7ff" } as React.CSSProperties}
          >
            <div className={styles.columnBackground} style={{ backgroundImage: "url('/media/corporations/centrium-parade-full.jpg')" }} />
            <div className={styles.columnOverlay} />
            <div className={styles.columnGlow} />

            <div className={styles.columnContent}>
              <div className={styles.sectorMeta}>
                <span>SECTOR 03 // JURISDICTION</span>
                <span className={styles.securityBadge} style={{ color: "#7aa7ff", borderColor: "#7aa7ff" }}>SYS GOD</span>
              </div>
              <h2 className={styles.columnTitle}>SWOS (STATE AUTHORITY)</h2>
              <p className={styles.columnDesc}>
                Ölüm sonrası vatandaşlık yasalarını uygulayan, dijital bilinç kalkanları ve merkezi vergi çekirdekleriyle yöneten devlet mekanizması.
              </p>

              <div className={styles.telemetryGrid}>
                <div className={styles.telemetryItem}>
                  <span className={styles.telemetryLabel}>GOVERNMENT MODEL</span>
                  <span className={styles.telemetryValue}>BUREAUCRATIC UNION</span>
                </div>
                <div className={styles.telemetryItem}>
                  <span className={styles.telemetryLabel}>ACTIVE MARTIAL PROTOCOLS</span>
                  <span className={styles.telemetryValue} style={{ color: "#27c93f" }}>D-9 SECURITY ENFORCED</span>
                </div>
              </div>

              <Link href="/encyclopedia/swos" className={styles.columnBtn}>
                CONNECT TO AUTHORITY [→]
              </Link>
            </div>
          </div>
        </section>

        {/* Supplementary Lore Archive Index */}
        <section className={styles.loreRegistrySection}>
          <div className={styles.registryHeader}>
            <span className={styles.registryKicker}>SECONDARY SYSTEMS</span>
            <h2 className={styles.registryTitle}>Lore Registry</h2>
            <p className={styles.registrySlogan}>Supplementary factions, technologies, and chronological markers of the 2303 crisis.</p>
          </div>

          <div className={styles.loreGrid}>
            {/* Factions list */}
            <div className={styles.loreBlock}>
              <h3 className={styles.blockTitle}>// 01. ACTIVE FACTIONS</h3>
              <div className={styles.blockList}>
                {factions.map((f, i) => (
                  <div key={i} className={styles.loreItem} style={{ borderLeft: `2px solid ${f.accent}` }}>
                    <div className={styles.loreItemHead}>
                      <span className={styles.loreItemName}>{f.name}</span>
                      <span className={styles.loreItemSub}>{f.domain}</span>
                    </div>
                    <p className={styles.loreItemDesc}>{f.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Technologies list */}
            <div className={styles.loreBlock}>
              <h3 className={styles.blockTitle}>// 02. SYSTEM TECH LOGS</h3>
              <div className={styles.blockList}>
                {technologies.map((t, i) => (
                  <div key={i} className={styles.loreItem} style={{ borderLeft: `2px solid ${t.accent}` }}>
                    <div className={styles.loreItemHead}>
                      <span className={styles.loreItemName}>{t.name}</span>
                      <span className={styles.loreItemSub}>{t.code}</span>
                    </div>
                    <p className={styles.loreItemDesc}>{t.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline Block */}
          <div className={styles.timelineBlock}>
            <h3 className={styles.blockTitle}>// 03. SYSTEM CHRONOLOGY</h3>
            <div className={styles.timelineRowGrid}>
              {timeline.map((entry, idx) => (
                <div key={idx} className={styles.timelineCard}>
                  <time className={styles.timelineYear}>{entry.year}</time>
                  <h4 className={styles.timelineTitle}>{entry.title}</h4>
                  <p className={styles.timelineEvent}>{entry.event}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <BooksIndexFooter context="encyclopedia" />
    </div>
  );
}
