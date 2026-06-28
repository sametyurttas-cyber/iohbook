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
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (index: number) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredMonitor(index);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMonitor(null);
    }, 1200); // Delay reverting to default stars by 1.2s to prevent screen-shake/dizziness
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseVal(prev => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(2));
    }, 1500);
    return () => {
      clearInterval(interval);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
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
          <span className={styles.terminalLabelKicker}>IOH UNIVERSE // CENTRAL CONSOLE</span>
          <h1 className={styles.terminalTitleMain}>INTER-UNIVERSE DATA NETWORK</h1>
          <p className={styles.terminalSubtitle}>
            SELECT LORE MONITOR VECTOR TO EXPAND SECTOR INTELLIGENCE
          </p>
        </section>

        {/* Console Kicker Bar */}
        <div className={styles.syncStatusBar}>
          <span className={styles.syncDot} />
          <span>CENTRAL SYNCHRONIZATION: ACTIVE</span>
        </div>

        {/* 2x2 Cyber Console with Center Hub */}
        <section className={styles.consoleWrapper}>
          
          {/* Connector Lines (desktop only) */}
          <svg className={styles.connectorSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Line to Top-Left Panel (Karakterler - Gold) */}
            <path
              d="M 50,50 L 25,25"
              className={`${styles.connectorPath} ${hoveredMonitor === 0 ? styles.connectorPathActive : ""}`}
              stroke="#ffb700"
              strokeWidth={hoveredMonitor === 0 ? "1.5" : "0.75"}
              strokeDasharray="4 3"
              filter="url(#glow-gold)"
            />
            {/* Line to Top-Right Panel (Sirketler - Red) */}
            <path
              d="M 50,50 L 75,25"
              className={`${styles.connectorPath} ${hoveredMonitor === 1 ? styles.connectorPathActive : ""}`}
              stroke="#ff3c00"
              strokeWidth={hoveredMonitor === 1 ? "1.5" : "0.75"}
              strokeDasharray="4 3"
              filter="url(#glow-red)"
            />
            {/* Line to Bottom-Left Panel (SWOS - Blue) */}
            <path
              d="M 50,50 L 25,75"
              className={`${styles.connectorPath} ${hoveredMonitor === 2 ? styles.connectorPathActive : ""}`}
              stroke="#00e5ff"
              strokeWidth={hoveredMonitor === 2 ? "1.5" : "0.75"}
              strokeDasharray="4 3"
              filter="url(#glow-blue)"
            />
            {/* Line to Bottom-Right Panel (Yapay Zekalar - Purple) */}
            <path
              d="M 50,50 L 75,75"
              className={`${styles.connectorPath} ${hoveredMonitor === 3 ? styles.connectorPathActive : ""}`}
              stroke="#ff007f"
              strokeWidth={hoveredMonitor === 3 ? "1.5" : "0.75"}
              strokeDasharray="4 3"
              filter="url(#glow-purple)"
            />
          </svg>

          {/* Central Hub */}
          <div className={styles.centerHub} aria-hidden="true">
            <div className={styles.hubRadarRing} />
            <div className={styles.hubInnerCore}>
              <span className={styles.hubCoreGlow} />
              <span className={styles.hubCoreLabel}>CORE HUB</span>
              <span className={styles.hubSubText}>IOH_NET_V2</span>
            </div>
            <div className={styles.hubRotatingNodes}>
              <div className={styles.hubOrbiter} style={{ backgroundColor: "#ffb700", animationDelay: "0s" }} />
              <div className={styles.hubOrbiter} style={{ backgroundColor: "#ff3c00", animationDelay: "-2s" }} />
              <div className={styles.hubOrbiter} style={{ backgroundColor: "#00e5ff", animationDelay: "-4s" }} />
              <div className={styles.hubOrbiter} style={{ backgroundColor: "#ff007f", animationDelay: "-6s" }} />
            </div>
          </div>

          <div className={styles.hudGrid}>
            {/* Panel 1: Karakterler */}
            <div 
              className={`${styles.monitorCard} ${hoveredMonitor === 0 ? styles.monitorFocused : ""} ${hoveredMonitor !== null && hoveredMonitor !== 0 ? styles.monitorDimmed : ""}`}
              onMouseEnter={() => handleMouseEnter(0)}
              onMouseLeave={handleMouseLeave}
              style={{ "--monitor-accent": "#ffb700" } as React.CSSProperties}
            >
              <div className={styles.monitorGridBackdrop} />
              <div className={styles.monitorGlowLine} />
              
              <div className={styles.monitorHeaderTab}>
                <span className={styles.monitorDot} style={{ backgroundColor: "#ffb700" }} />
                <span className={styles.monitorId}>01 // RESISTANCE_CELLS</span>
              </div>

              <div className={styles.monitorBody}>
                <h2 className={styles.monitorTitle}>CHARACTERS</h2>
                <span className={styles.monitorKicker}>DECENTRALIZED RESISTANCE</span>
                <p className={styles.monitorDesc}>
                  Dossiers of activists and code runners fighting to protect physical memories and disrupt centralized data hegemony.
                </p>

                {/* Constellation visual */}
                <div className={styles.monitorGraphic}>
                  <svg className="w-full h-full" viewBox="0 0 100 50">
                    <circle cx="20" cy="15" r="2.5" fill="#ffb700" className="animate-pulse" />
                    <circle cx="45" cy="35" r="2" fill="#ffb700" style={{ animationDelay: "0.5s" }} className="animate-pulse" />
                    <circle cx="75" cy="20" r="3" fill="#ffb700" style={{ animationDelay: "1s" }} className="animate-pulse" />
                    <circle cx="90" cy="40" r="1.5" fill="#ffb700" style={{ animationDelay: "1.5s" }} className="animate-pulse" />
                    
                    <line x1="20" y1="15" x2="45" y2="35" stroke="rgba(255, 183, 0, 0.35)" strokeWidth="0.75" />
                    <line x1="45" y1="35" x2="75" y2="20" stroke="rgba(255, 183, 0, 0.35)" strokeWidth="0.75" strokeDasharray="2 1" />
                    <line x1="75" y1="20" x2="90" y2="40" stroke="rgba(255, 183, 0, 0.35)" strokeWidth="0.75" />
                  </svg>
                  <div className={styles.graphicOverlayText}>
                    <span>STATUS: GRID ACTIVE // SECURITY: SPOILER SAFE</span>
                  </div>
                </div>

                <div className={styles.telemetryStats}>
                  <div className={styles.statRow}>
                    <span>COGNITIONS DETECTED</span>
                    <span>5 SUB-DOSSIERS</span>
                  </div>
                  <div className={styles.statRow}>
                    <span>THREAT COEFFICIENT</span>
                    <span style={{ color: "#ff3c00" }}>CRITICAL ALIENATION</span>
                  </div>
                </div>

                <Link href="/encyclopedia/characters" className={styles.monitorBtn}>
                  OPEN DOSSIERS [→]
                </Link>
              </div>
            </div>

            {/* Panel 2: Şirketler */}
            <div 
              className={`${styles.monitorCard} ${hoveredMonitor === 1 ? styles.monitorFocused : ""} ${hoveredMonitor !== null && hoveredMonitor !== 1 ? styles.monitorDimmed : ""}`}
              onMouseEnter={() => handleMouseEnter(1)}
              onMouseLeave={handleMouseLeave}
              style={{ "--monitor-accent": "#ff3c00" } as React.CSSProperties}
            >
              <div className={styles.monitorGridBackdrop} />
              <div className={styles.monitorGlowLine} />

              <div className={styles.monitorHeaderTab}>
                <span className={styles.monitorDot} style={{ backgroundColor: "#ff3c00" }} />
                <span className={styles.monitorId}>02 // CORPORATE_NEXUS</span>
              </div>

              <div className={styles.monitorBody}>
                <h2 className={styles.monitorTitle}>CORPORATIONS</h2>
                <span className={styles.monitorKicker}>CONGLOMERATE ALLIANCE</span>
                <p className={styles.monitorDesc}>
                  Capital oligarchies controlling cities, energy grids, media feeds, financial flows, and consciousness transfer infrastructure.
                </p>

                {/* Holographic city visual */}
                <div className={styles.monitorGraphic}>
                  <svg className="w-full h-full" viewBox="0 0 100 50">
                    {/* Bars simulating buildings */}
                    <rect x="15" y="20" width="8" height="30" fill="rgba(255, 60, 0, 0.2)" stroke="#ff3c00" strokeWidth="0.5" />
                    <rect x="30" y="10" width="10" height="40" fill="rgba(255, 60, 0, 0.3)" stroke="#ff3c00" strokeWidth="0.5" />
                    <rect x="47" y="25" width="8" height="25" fill="rgba(255, 60, 0, 0.15)" stroke="#ff3c00" strokeWidth="0.5" />
                    <rect x="62" y="15" width="12" height="35" fill="rgba(255, 60, 0, 0.25)" stroke="#ff3c00" strokeWidth="0.5" />
                    <rect x="80" y="30" width="6" height="20" fill="rgba(255, 60, 0, 0.1)" stroke="#ff3c00" strokeWidth="0.5" />
                    
                    {/* Glowing coordinate line */}
                    <line x1="5" y1="42" x2="95" y2="42" stroke="#ff3c00" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.6" />
                  </svg>
                  <div className={styles.graphicOverlayText}>
                    <span>CAPITAL RATIO: 64.8% // TARGET: EGO COMMERCIALIZATION</span>
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

            {/* Panel 3: SWOS */}
            <div 
              className={`${styles.monitorCard} ${hoveredMonitor === 2 ? styles.monitorFocused : ""} ${hoveredMonitor !== null && hoveredMonitor !== 2 ? styles.monitorDimmed : ""}`}
              onMouseEnter={() => handleMouseEnter(2)}
              onMouseLeave={handleMouseLeave}
              style={{ "--monitor-accent": "#00e5ff" } as React.CSSProperties}
            >
              <div className={styles.monitorGridBackdrop} />
              <div className={styles.monitorGlowLine} />

              <div className={styles.monitorHeaderTab}>
                <span className={styles.monitorDot} style={{ backgroundColor: "#00e5ff" }} />
                <span className={styles.monitorId}>03 // STATE_AUTHORITY</span>
              </div>

              <div className={styles.monitorBody}>
                <h2 className={styles.monitorTitle}>SWOS</h2>
                <span className={styles.monitorKicker}>FEDERAL CONTROL AUTHORITY</span>
                <p className={styles.monitorDesc}>
                  Central state authority controlling post-death ego integrity laws, defensive shields, and currency cores.
                </p>

                {/* Blue shield / sphere visual */}
                <div className={styles.monitorGraphic}>
                  <svg className="w-full h-full" viewBox="0 0 100 50">
                    <circle cx="50" cy="25" r="18" fill="none" stroke="rgba(0, 229, 255, 0.15)" strokeWidth="1" />
                    <circle cx="50" cy="25" r="12" fill="none" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="0.75" strokeDasharray="3 2" />
                    <circle cx="50" cy="25" r="6" fill="rgba(0, 229, 255, 0.1)" stroke="#00e5ff" strokeWidth="1" />
                    
                    {/* Crosshair accents */}
                    <line x1="50" y1="3" x2="50" y2="47" stroke="rgba(0, 229, 255, 0.2)" strokeWidth="0.5" />
                    <line x1="28" y1="25" x2="72" y2="25" stroke="rgba(0, 229, 255, 0.2)" strokeWidth="0.5" />
                  </svg>
                  <div className={styles.graphicOverlayText}>
                    <span>PROTOCOL: D-9 ENFORCEMENT // INTEGRITY: {pulseVal}% CALIBRATED</span>
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

            {/* Panel 4: Yapay Zekalar */}
            <div 
              className={`${styles.monitorCard} ${hoveredMonitor === 3 ? styles.monitorFocused : ""} ${hoveredMonitor !== null && hoveredMonitor !== 3 ? styles.monitorDimmed : ""}`}
              onMouseEnter={() => handleMouseEnter(3)}
              onMouseLeave={handleMouseLeave}
              style={{ "--monitor-accent": "#ff007f" } as React.CSSProperties}
            >
              <div className={styles.monitorGridBackdrop} />
              <div className={styles.monitorGlowLine} />

              <div className={styles.monitorHeaderTab}>
                <span className={styles.monitorDot} style={{ backgroundColor: "#ff007f" }} />
                <span className={styles.monitorId}>04 // CORE_INTELLIGENCE</span>
              </div>

              <div className={styles.monitorBody}>
                <h2 className={styles.monitorTitle}>AI CORES</h2>
                <span className={styles.monitorKicker}>SYSTEM CORE INTELLIGENCE</span>
                <p className={styles.monitorDesc}>
                  Core intelligence layers maintaining the system's foundational infrastructure, urban defenses, and quantum data flows.
                </p>

                {/* Purple quantum core visual */}
                <div className={styles.monitorGraphic}>
                  <svg className="w-full h-full" viewBox="0 0 100 50">
                    <circle cx="50" cy="25" r="5" fill="#ff007f" filter="drop-shadow(0 0 6px rgba(255, 0, 127, 0.8))" />
                    
                    {/* Elliptical orbits */}
                    <ellipse cx="50" cy="25" rx="20" ry="7" fill="none" stroke="rgba(255, 0, 127, 0.35)" strokeWidth="0.75" transform="rotate(-15 50 25)" />
                    <ellipse cx="50" cy="25" rx="20" ry="7" fill="none" stroke="rgba(255, 0, 127, 0.35)" strokeWidth="0.75" transform="rotate(25 50 25)" />
                    
                    {/* Orbiting particles */}
                    <circle cx="33" cy="21" r="1.5" fill="#ff007f" />
                    <circle cx="68" cy="32" r="1.5" fill="#ff007f" />
                  </svg>
                  <div className={styles.graphicOverlayText}>
                    <span>CLASS: 4 MATRIX LAYERS // CORE: KAI / COREWIT</span>
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
          </div>
        </section>

        {/* Supplementary Systems Lore Section */}
        <section className={styles.supplementarySection}>
          <div className={styles.supHeader}>
            <span className={styles.supKicker}>COMPLEMENTARY DATA REGISTRY</span>
            <h2 className={styles.supTitle}>System Registry</h2>
            <p className={styles.supDesc}>
              The following registries detail the secondary factions, operational modules, and quantum technologies active in the universe.
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
