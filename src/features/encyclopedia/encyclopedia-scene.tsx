"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  IohSceneHeader,
  type IohSceneHeaderUser
} from "@/components/layout/ioh-scene-header";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { EncyclopediaTracker } from "@/features/analytics/encyclopedia-tracker";
import { factions, technologies, timeline } from "./encyclopedia-data";
import { EncyclopediaWebGL } from "./encyclopedia-webgl";
import styles from "./encyclopedia-scene.module.css";

export function EncyclopediaScene({ user }: { user: IohSceneHeaderUser }) {
  const [hoveredMonitor, setHoveredMonitor] = useState<number | null>(null);
  const [pulseVal, setPulseVal] = useState(94.2);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseVal(prev => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(2));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.page}>
      <IohIndexStyles />
      <EncyclopediaWebGL hoveredIndex={hoveredMonitor} />
      <style
        dangerouslySetInnerHTML={{
          __html: "body{cursor:auto!important}a,button,[data-hover],[data-magnet]{cursor:pointer!important}"
        }}
      />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      
      {/* Main Navigation Header */}
      <IohSceneHeader user={user} />
      <EncyclopediaTracker />

      {/* Sub-Header Navigation Bar */}
      <div className={styles.subHeader}>
        <div className={styles.subHeaderInner}>
          <span className={styles.systemStatus}>
            <span className={styles.statusPulse} />
            LORE DIRECTORY ONLINE // SECURE NODE PORTAL
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
            <Link href="/encyclopedia/ai" className={styles.subHeaderLink}>
              AI SYSTEM
            </Link>
          </nav>
        </div>
      </div>

      <main className={styles.main}>
        {/* Terminal Header */}
        <section className={styles.terminalIntroHeader}>
          <div className={styles.glitchGlow} />
          <span className={styles.terminalLabelKicker}>// ENCYCLOPEDIA DATABASE REFERENCE</span>
          <h1 className={styles.terminalTitleMain}>UNIVERSAL CORE</h1>
          <p className={styles.terminalSubtitle}>
            SELECT LORE MONITOR VECTOR TO EXPAND SECTOR INTELLIGENCE
          </p>
        </section>

        {/* 3-Column Cyber Monitor Deck */}
        <section className={styles.hudGrid}>
          {/* Monitor 1: Karakterler */}
          <div 
            className={`${styles.monitorCard} ${hoveredMonitor === 0 ? styles.monitorFocused : ""} ${hoveredMonitor !== null && hoveredMonitor !== 0 ? styles.monitorDimmed : ""}`}
            onMouseEnter={() => setHoveredMonitor(0)}
            onMouseLeave={() => setHoveredMonitor(null)}
            style={{ "--monitor-accent": "#e7c574" } as React.CSSProperties}
          >
            {/* Vector grid backdrop */}
            <div className={styles.monitorGridBackdrop} />
            <div className={styles.monitorGlowLine} />
            
            <div className={styles.monitorHeaderTab}>
              <span className={styles.monitorDot} style={{ backgroundColor: "#e7c574" }} />
              <span className={styles.monitorId}>MONITOR // RESISTANCE_CELLS</span>
            </div>

            <div className={styles.monitorBody}>
              <h2 className={styles.monitorTitle}>KARAKTERLER</h2>
              <span className={styles.monitorKicker}>DECENTRALIZED RESISTANCE</span>
              <p className={styles.monitorDesc}>
                Fiziksel dünya anılarını korumak ve merkezi veri hegemonyasını kırmak için savaşan siber aktivistler ve kod kaçakçıları.
              </p>

              {/* Graphic/Vector Simulation inside card */}
              <div className={styles.monitorGraphic}>
                <div className={styles.vectorNodes}>
                  <div className={styles.nodePoint} style={{ left: "20%", top: "30%" }} />
                  <div className={styles.nodePoint} style={{ left: "70%", top: "60%" }} />
                  <div className={styles.nodePoint} style={{ left: "50%", top: "40%" }} />
                  <div className={styles.connectingLine} />
                </div>
                <div className={styles.graphicOverlayText}>
                  <span>GRID: ACTIVE // SPOILER SAFE</span>
                </div>
              </div>

              <div className={styles.telemetryStats}>
                <div className={styles.statRow}>
                  <span>COGNITIONS DETECTED</span>
                  <span>5 SUB-DOSSIERS</span>
                </div>
                <div className={styles.statRow}>
                  <span>THREAT COEFFICIENT</span>
                  <span style={{ color: "#ff3b3b" }}>CRITICAL ALIENATION</span>
                </div>
              </div>

              <Link href="/encyclopedia/characters" className={styles.monitorBtn}>
                OPEN DOSSIERS [→]
              </Link>
            </div>
          </div>

          {/* Monitor 2: Sirketler */}
          <div 
            className={`${styles.monitorCard} ${hoveredMonitor === 1 ? styles.monitorFocused : ""} ${hoveredMonitor !== null && hoveredMonitor !== 1 ? styles.monitorDimmed : ""}`}
            onMouseEnter={() => setHoveredMonitor(1)}
            onMouseLeave={() => setHoveredMonitor(null)}
            style={{ "--monitor-accent": "#ff5533" } as React.CSSProperties}
          >
            <div className={styles.monitorGridBackdrop} />
            <div className={styles.monitorGlowLine} />

            <div className={styles.monitorHeaderTab}>
              <span className={styles.monitorDot} style={{ backgroundColor: "#ff5533" }} />
              <span className={styles.monitorId}>MONITOR // CORPORATE_NEXUS</span>
            </div>

            <div className={styles.monitorBody}>
              <h2 className={styles.monitorTitle}>ŞİRKETLER</h2>
              <span className={styles.monitorKicker}>CONGLOMERATE ALLIANCE</span>
              <p className={styles.monitorDesc}>
                Centrium'un devasa bilgi sunucularını ve zihin transferi portallarını kontrol eden sermaye oligarşisi.
              </p>

              {/* Graphic/Vector Simulation inside card */}
              <div className={styles.monitorGraphic}>
                <div className={styles.networkMesh}>
                  <div className={styles.meshLine} style={{ transform: "rotate(15deg)" }} />
                  <div className={styles.meshLine} style={{ transform: "rotate(-30deg)" }} />
                  <div className={styles.meshCircle} />
                </div>
                <div className={styles.graphicOverlayText}>
                  <span>CAPITAL RATIO: 64.8%</span>
                </div>
              </div>

              <div className={styles.telemetryStats}>
                <div className={styles.statRow}>
                  <span>SECTOR SHARES</span>
                  <span>CENTRIUM INFRA</span>
                </div>
                <div className={styles.statRow}>
                  <span>CORE TARGET</span>
                  <span>EGO COMMERCIALIZATION</span>
                </div>
              </div>

              <Link href="/encyclopedia/corporations" className={styles.monitorBtn}>
                ACCESS CORPORATIONS [→]
              </Link>
            </div>
          </div>

          {/* Monitor 3: SWOS */}
          <div 
            className={`${styles.monitorCard} ${hoveredMonitor === 2 ? styles.monitorFocused : ""} ${hoveredMonitor !== null && hoveredMonitor !== 2 ? styles.monitorDimmed : ""}`}
            onMouseEnter={() => setHoveredMonitor(2)}
            onMouseLeave={() => setHoveredMonitor(null)}
            style={{ "--monitor-accent": "#7aa7ff" } as React.CSSProperties}
          >
            <div className={styles.monitorGridBackdrop} />
            <div className={styles.monitorGlowLine} />

            <div className={styles.monitorHeaderTab}>
              <span className={styles.monitorDot} style={{ backgroundColor: "#7aa7ff" }} />
              <span className={styles.monitorId}>MONITOR // STATE_AUTHORITY</span>
            </div>

            <div className={styles.monitorBody}>
              <h2 className={styles.monitorTitle}>SWOS</h2>
              <span className={styles.monitorKicker}>FEDERAL CONTROL AUTHORITY</span>
              <p className={styles.monitorDesc}>
                Ölüm sonrası ego bütünlüğü yasalarını, savunma kalkanlarını ve para çekirdeklerini kontrol eden merkezi bürokrasi.
              </p>

              {/* Graphic/Vector Simulation inside card */}
              <div className={styles.monitorGraphic}>
                <div className={styles.radarSweepCircle}>
                  <div className={styles.radarLine} />
                </div>
                <div className={styles.graphicOverlayText}>
                  <span>SWOS ENCRYPTION: SECURE</span>
                </div>
              </div>

              <div className={styles.telemetryStats}>
                <div className={styles.statRow}>
                  <span>ACTIVE PROTOCOL</span>
                  <span>D-9 ENFORCEMENT</span>
                </div>
                <div className={styles.statRow}>
                  <span>EGO INTEGRITY</span>
                  <span>{pulseVal}% // CALIBRATED</span>
                </div>
              </div>

              <Link href="/encyclopedia/swos" className={styles.monitorBtn}>
                CONNECT TO SWOS [→]
              </Link>
            </div>
          </div>

          {/* Monitor 4: Yapay Zekalar */}
          <div 
            className={`${styles.monitorCard} ${hoveredMonitor === 3 ? styles.monitorFocused : ""} ${hoveredMonitor !== null && hoveredMonitor !== 3 ? styles.monitorDimmed : ""}`}
            onMouseEnter={() => setHoveredMonitor(3)}
            onMouseLeave={() => setHoveredMonitor(null)}
            style={{ "--monitor-accent": "#d026f5" } as React.CSSProperties}
          >
            <div className={styles.monitorGridBackdrop} />
            <div className={styles.monitorGlowLine} />

            <div className={styles.monitorHeaderTab}>
              <span className={styles.monitorDot} style={{ backgroundColor: "#d026f5" }} />
              <span className={styles.monitorId}>MONITOR // CORE_INTELLIGENCE</span>
            </div>

            <div className={styles.monitorBody}>
              <h2 className={styles.monitorTitle}>YAPAY ZEKALAR</h2>
              <span className={styles.monitorKicker}>SYSTEM CORE INTELLIGENCE</span>
              <p className={styles.monitorDesc}>
                System'in varoluş altyapısını, şehir savunmalarını ve quantum veri akışını ayakta tutan yapay zeka katmanları.
              </p>

              {/* Graphic/Vector Simulation inside card */}
              <div className={styles.monitorGraphic}>
                <div className={styles.networkMesh}>
                  <div className={styles.meshLine} style={{ transform: "rotate(45deg)", borderColor: "rgba(208, 38, 245, 0.3)" }} />
                  <div className={styles.meshLine} style={{ transform: "rotate(-45deg)", borderColor: "rgba(208, 38, 245, 0.3)" }} />
                  <div className={styles.meshCircle} style={{ borderColor: "#d026f5", boxShadow: "0 0 10px rgba(208, 38, 245, 0.5)" }} />
                </div>
                <div className={styles.graphicOverlayText}>
                  <span>INTELLIGENCE RATIO: 100%</span>
                </div>
              </div>

              <div className={styles.telemetryStats}>
                <div className={styles.statRow}>
                  <span>ACTIVE CLASS</span>
                  <span>4 MATRIX LAYERS</span>
                </div>
                <div className={styles.statRow}>
                  <span>CORE LOGIC</span>
                  <span>KAI / COREWIT</span>
                </div>
              </div>

              <Link href="/encyclopedia/ai" className={styles.monitorBtn}>
                ACCESS AI INDEX [→]
              </Link>
            </div>
          </div>
        </section>

        {/* Supplementary Systems Lore Section */}
        <section className={styles.supplementarySection}>
          <div className={styles.supHeader}>
            <span className={styles.supKicker}>COMPLEMENTARY DATA REGISTRY</span>
            <h2 className={styles.supTitle}>System Registry</h2>
            <p className={styles.supDesc}>
              Aşağıdaki veri kütükleri, evrendeki diğer ikincil organizasyonları ve kuantum teknolojilerini içerir.
            </p>
          </div>

          <div className={styles.registryGridContainer}>
            {/* Factions Block */}
            <div className={styles.registryBlock}>
              <h3 className={styles.blockHeadline}>// FACTION REGISTER</h3>
              <div className={styles.itemContainer}>
                {factions.map((f, i) => (
                  <div key={i} className={styles.registryItem} style={{ borderLeft: `2px solid ${f.accent}` }}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemName}>{f.name}</span>
                      <span className={styles.itemMeta}>{f.domain}</span>
                    </div>
                    <p className={styles.itemDesc}>{f.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Technologies Block */}
            <div className={styles.registryBlock}>
              <h3 className={styles.blockHeadline}>// TECH PROTOCOLS</h3>
              <div className={styles.itemContainer}>
                {technologies.map((t, i) => (
                  <div key={i} className={styles.registryItem} style={{ borderLeft: `2px solid ${t.accent}` }}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemName}>{t.name}</span>
                      <span className={styles.itemMeta}>{t.code}</span>
                    </div>
                    <p className={styles.itemDesc}>{t.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline Registry */}
          <div className={styles.timelineBlock}>
            <h3 className={styles.blockHeadline}>// CHRONOLOGICAL MARKERS</h3>
            <div className={styles.timelineHorizontal}>
              {timeline.map((entry, idx) => (
                <div key={idx} className={styles.timelineCard}>
                  <time className={styles.timelineYear}>{entry.year}</time>
                  <h4 className={styles.timelineCardTitle}>{entry.title}</h4>
                  <p className={styles.timelineCardDesc}>{entry.event}</p>
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
