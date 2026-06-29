"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { IohSceneHeader } from "@/components/layout/ioh-scene-header";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { swosData } from "./swos-data";
import { SwosWebGL } from "./swos-webgl";
import styles from "./swos.module.css";

interface SwosSceneProps {
  user?: any;
}

export default function SwosScene({ user }: SwosSceneProps) {
  const [isLeaked, setIsLeaked] = useState(false);
  const [activeNode, setActiveNode] = useState(0);
  const [openCrisis, setOpenCrisis] = useState<string | null>(null);
  const [activeLightbox, setActiveLightbox] = useState<string | null>(null);
  
  // Interactive Citizen Audit Terminal States
  const [citizenName, setCitizenName] = useState("");
  const [auditState, setAuditState] = useState<"idle" | "scanning" | "done">("idle");
  const [auditProgress, setAuditProgress] = useState<string[]>([]);
  const [auditResult, setAuditResult] = useState<any>(null);

  // SWOS Tax Calculator States
  const [iohAmount, setIohAmount] = useState<string>("");
  const [taxResult, setTaxResult] = useState<any>(null);

  // Interactive Orbital Conflict Map State
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  const handleCalculateTax = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(iohAmount);
    if (isNaN(amount) || amount <= 0) return;

    const stateTax = amount * 0.34;
    const militaryFund = amount * 0.10;
    const leaderShare = amount * 0.05;
    const maintenanceFee = amount * 0.03;
    const totalDeductions = stateTax + militaryFund + leaderShare + maintenanceFee;
    const netBakiye = amount - totalDeductions;

    setTaxResult({
      stateTax: stateTax.toFixed(2),
      militaryFund: militaryFund.toFixed(2),
      leaderShare: leaderShare.toFixed(2),
      maintenanceFee: maintenanceFee.toFixed(2),
      total: totalDeductions.toFixed(2),
      net: netBakiye.toFixed(2)
    });
  };

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim()) return;

    setAuditState("scanning");
    setAuditProgress([]);
    setAuditResult(null);

    const logs = [
      "> INITIALIZING SWOS SECURE ENCRYPTION...",
      "> BIOMETRIC PARITY RESOLUTION IN PROGRESS...",
      "> QUERYING STATE ARCHIVES FOR: " + citizenName.toUpperCase(),
      "> CALCULATING COMPLIANCE & THREAT COEFFICIENT...",
      "> INTEGRATING TRANSFERRED DIGITAL EGO HASH...",
      "> SCAN COMPLETE. DECRYPTING DATA DOSSIER..."
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setAuditProgress(prev => [...prev, log]);
        if (index === logs.length - 1) {
          setTimeout(() => {
            const statuses = ["ACTIVE", "RESTRICTED", "DEVIANT", "TERMINATED"];
            const clearances = ["LEVEL 1 / PUBLIC", "LEVEL 2 / STAFF", "LEVEL 4 / EXECUTIVE", "LEVEL 0 / SUBJECT"];
            const actions = ["NO INTERVENTION REQUIRED", "MONITOR COGNITIVE RATIO", "IMMEDIATE DETENTION COMMAND", "VESSEL SHUTDOWN DECREE"];
            
            const hash = citizenName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const statusIdx = hash % statuses.length;
            const clearanceIdx = hash % clearances.length;
            const actionIdx = hash % actions.length;
            const threatScore = (hash % 92) + 8; 
            const egoIntegrity = (100 - (hash % 120) / 10).toFixed(1);

            setAuditResult({
              id: `SWOS-${(hash * 3).toString(16).toUpperCase().padStart(4, "0")}-${(hash * 7).toString(16).toUpperCase().padStart(4, "0")}`,
              status: statuses[statusIdx],
              clearance: clearances[clearanceIdx],
              threat: `${threatScore}%`,
              ego: statusIdx === 3 ? "NOT DEPLOYED" : `${egoIntegrity}%`,
              action: actions[actionIdx]
            });
            setAuditState("done");
          }, 600);
        }
      }, (index + 1) * 450);
    });
  };

  const [liveLogs, setLiveLogs] = useState<string[]>([
    "> SYSTEM ONLINE // SECURE NODE INITIALIZED",
    "> RUNNING GLOBAL INTEGRITY CHECKS...",
    "> NO COGNITIVE THREAT DETECTED IN SECTOR 7"
  ]);

  useEffect(() => {
    const logTemplates = [
      "> MONITORING QUANTUM PACKETS...",
      "> BIOMETRIC HASH VERIFIED // ID: #8291",
      "> SECURING CORPID GATEWAY [CENTRIUM]",
      "> ROUTING DATA THROUGH ORBITAL SHIELD",
      "> ACTIVE THREAT RESOLVED IN SECTOR 4",
      "> SYNCING STATE RECORD REGISTRY...",
      "> SYSTEM LATENCY: 0.12ms // CLEAR",
      "> COMPLIANCE INDEX: 94.2% // LEVEL D-9",
      "> DETECTING PORTAL DRIFT... CALIBRATING",
      "> MEMORY INGEST PROTOCOL ACTIVE",
      "> COMPILING CITIZEN ACTIVITY LOGS...",
      "> NO TRACE OF DEVIANT BEHAVIOR DETECTED",
      "> ENCRYPTING TRANSMISSION VIA SECURE SUBSCENE"
    ];

    const interval = setInterval(() => {
      const randomLine = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0]; // "HH:MM:SS"
      const formattedLog = `[${timeStr}] ${randomLine}`;
      
      setLiveLogs(prev => {
        const updated = [...prev, formattedLog];
        if (updated.length > 5) {
          return updated.slice(1);
        }
        return updated;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  const centriumNodes = [
    { name: "Tax Cores", ref: "HC_TAX_01", x: "32%", y: "45%", desc: "Data core that deducts taxes and resources from all connected worlds.", leak: "Contains hidden code snippets that automatically seize 34% of tokens earned by independent miners." },
    { name: "Ministries", ref: "HC_MIN_02", x: "48%", y: "30%", desc: "Federal assembly buildings coordinating economic, defense, and technological policies.", leak: "The actual approval authority for secret back-door agreements and concessions made with Corporate Union representatives." },
    { name: "Military Command Grid", ref: "HC_MIL_03", x: "65%", y: "55%", desc: "Command network for orbital satellites, defensive shields, and drone armies.", leak: "Manages emergency laser protocols programmed to eliminate cities in the event of civil uprisings." },
    { name: "Technology Hub", ref: "HC_TECH_04", x: "25%", y: "65%", desc: "Development centers maintaining the System's technological continuity and shield infrastructure.", leak: "Develops AI tracking algorithms that analyze citizens' mental logs and digital activity history." },
    { name: "Iohcoin Core", ref: "HC_IOH_05", x: "50%", y: "60%", desc: "The financial pipeline and quantum database within the System.", leak: "The main instrument utilized by SWOS to control the economy and lock citizens in a continuous debt cycle." },
    { name: "World Currency Core", ref: "HC_WCC_06", x: "78%", y: "35%", desc: "Financial registries and siber transfers of citizens residing in the old world.", leak: "Traces and logs every purchase and transaction using quantum entanglement." }
  ];

  const conflictHotspots = [
    {
      id: 1,
      name: "CENTRIUM RADICAL DISTRICT // SECTOR 4",
      x: "42%",
      y: "35%",
      status: "RIOT ACTIVE",
      threat: "CRITICAL",
      details: "Infiltration attempt into portal servers detected by civil rebels. Cyber security squads deployed. Martial Law Protocol S-12 active.",
      color: "#ff3b3b"
    },
    {
      id: 2,
      name: "ORBITAL DEFENSE PLATFORM // SWOS-SAT-09",
      x: "72%",
      y: "15%",
      status: "DEPLOYED",
      threat: "LOW",
      details: "Orbital ion cannons active. Scanning foreign data packets entering the Earth's atmosphere. Integrity at 99.8%.",
      color: "#27c93f"
    },
    {
      id: 3,
      name: "TAX VAULT DATA CENTER // SECTOR 9",
      x: "20%",
      y: "65%",
      status: "SABOTAGE DETECTED",
      threat: "HIGH",
      details: "Cyber attack warning on lines routed to the mining tax pool. Antivirus squads established a siber shield around the data core.",
      color: "#ffbd2e"
    },
    {
      id: 4,
      name: "EAST GATEWAY TRANSIT STATION",
      x: "85%",
      y: "75%",
      status: "RESTRICTED ACCESS",
      threat: "MEDIUM",
      details: "Discrepancy detected in ego transfers from the old world to Centrium. Quarantine protocol active. Transitions suspended.",
      color: "#ffbd2e"
    }
  ];

  const handleToggle = () => {
    setIsLeaked(prev => !prev);
  };

  return (
    <div className={styles.swosContainer}>
      <IohIndexStyles />
      <IohSceneHeader user={user} />
      <SwosWebGL />
      <style
        dangerouslySetInnerHTML={{
          __html: "body, html { cursor: auto !important; }"
        }}
      />

      <main className={styles.shell}>
        
        {/* 01. HERO — Resmî Devlet Giriş Ekranı */}
        <section className={styles.hero}>
          {/* Cyber HUD Corner Elements */}
          <div className={`${styles.hudCorner} ${styles.hudTopLeft}`} />
          <div className={`${styles.hudCorner} ${styles.hudTopRight}`} />
          <div className={`${styles.hudCorner} ${styles.hudBottomLeft}`} />
          <div className={`${styles.hudCorner} ${styles.hudBottomRight}`} />

          {/* Cyber Emblem / Seal Background */}
          <div className={styles.heroEmblemContainer}>
            <svg viewBox="0 0 200 200" className={styles.heroEmblem}>
              <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.15" />
              <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
              <circle cx="100" cy="100" r="75" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="10 5" opacity="0.15" />
              <line x1="100" y1="0" x2="100" y2="200" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
              <line x1="0" y1="100" x2="200" y2="100" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
              <polygon points="100,25 120,70 165,70 130,95 145,140 100,115 55,140 70,95 35,70 80,70" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.15" />
              <circle cx="100" cy="100" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
            </svg>
          </div>

          <div className={styles.heroContentWrapper}>
            <div className={styles.heroKicker}>
              <span className={styles.kickerDot} />
              <span>SWOS OFFICIAL STATE PORTAL</span>
            </div>
            
            <div className={styles.titleWrapper}>
              <span className={styles.bracketDecoration}>[</span>
              <h1 className={styles.heroTitle}>SWOS</h1>
              <span className={styles.bracketDecoration}>]</span>
            </div>

            <p className={styles.heroSubtitle}>SYSTEM WORLD STATES UNION</p>
            
            <div className={styles.sloganDividerContainer}>
              <div className={styles.sloganDivider} />
              <p className={styles.heroSlogan}>
                {isLeaked ? "CONTROL BEYOND RESISTANCE." : "ORDER BEYOND DEATH."}
              </p>
              <div className={styles.sloganDivider} />
            </div>

            <p className="max-w-[650px] mx-auto text-base text-[#8b949e] leading-relaxed mb-10">
              {isLeaked 
                ? "A federal control apparatus enveloped in expanding military police patrols and quantum tracking mechanisms throughout the System." 
                : "The highest federal authority safeguarding the security, order, and continuity of the System and connected worlds."
              }
            </p>

            <div className={styles.heroActions}>
              <a href="#state" className={`${styles.btnState} ${styles.btnPrimary}`}>
                {isLeaked ? "ENTER DOSSIERS" : "ENTER STATE ARCHIVE"}
              </a>
              <a href="#capital" className={styles.btnState}>
                VIEW CENTRIUM
              </a>
            </div>
          </div>
        </section>

        {/* 03. “State Identity” Bölümü */}
        <section id="state" className={styles.stateIdentity}>
          <div className={styles.panelGrid}>
            <div>
              <span className={styles.sectionKicker}>STATE PROFILE</span>
              <h2 className={styles.sectionTitle}>State Identity</h2>
              
              <p className={styles.stateText}>
                SWOS is the federal governing mechanism born from the ruins of old nations following the Great Collapse. It centrally manages the System, quantum cities, and the economic pipelines still connected to the old world.
              </p>

              {isLeaked ? (
                <div className={styles.leakedBox}>
                  <h4>// LEAKED INTEL ANALYSIS</h4>
                  <p>
                    The world has split in two following the Great Collapse: the Corporate Union on one side, and the States Union (SWOS) on the other. SWOS is a centralized dictatorship that subjects people to constant surveillance and mandatory digital registry even after death, all under the promise of security.
                  </p>
                </div>
              ) : (
                <div className={styles.officialBox}>
                  <h4>// OFFICIAL STATE PROMISE</h4>
                  <p>
                    Continuous order, absolute protection against chaos and anarchy, stable economic conditions, and guaranteed continuity for all citizens beyond death.
                  </p>
                </div>
              )}
            </div>

            <div className={styles.sealContainer}>
              <div 
                className="relative w-full aspect-square max-w-[220px] cursor-zoom-in"
                onClick={() => setActiveLightbox("/media/corporations/swos-logo.jpg")}
              >
                <Image
                  src="/media/corporations/swos-logo.jpg"
                  alt="SWOS Official Seal"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              
              <div className={styles.stateProfileList}>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>OFFICIAL NAME</span>
                  <span className={styles.profileValue}>{swosData.officialName}</span>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>EXECUTIVE AUTHORITY</span>
                  <span className={styles.profileValue}>{swosData.leader}</span>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>CAPITAL CITY</span>
                  <span className={styles.profileValue}>{swosData.capital}</span>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>SYSTEM TYPE</span>
                  <span className={styles.profileValue}>{swosData.governmentType}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 04. Centrium Bölümü — “Capital of Control” */}
        <section id="capital" className={styles.centriumSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>FEDERAL SECTOR</span>
            <h2 className={styles.sectionTitle}>Centrium // Capital of Swos</h2>
            <p className={styles.sectionSlogan}>"A city built not to inspire, but to contain."</p>
          </div>

          <div className={styles.atlasGrid}>
            <div className={styles.atlasMapContainer}>
              <Image
                src="/media/corporations/centrium-plaza.jpg"
                alt="Centrium Plaza overview"
                fill
                className="object-cover opacity-70"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              
              <div className={styles.atlasOverlay} />
              
              {/* Render Target Nodes on Grid Map */}
              {centriumNodes.map((node, index) => (
                <div
                  key={node.ref}
                  className={`${styles.atlasTargetNode} ${activeNode === index ? styles.atlasTargetNodeActive : ""}`}
                  style={{ left: node.x, top: node.y }}
                  onClick={() => setActiveNode(index)}
                  title={node.name}
                />
              ))}

              <div className="absolute bottom-4 left-4 font-mono text-[9px] text-[#8b949e] flex flex-col gap-0.5">
                <span>SECTOR: 01_CENTRIUM_GRID</span>
                <span>STATUS: OPERATIONAL</span>
              </div>
            </div>

            <div className={styles.atlasInfoPanel}>
              <span className={styles.atlasNodeRef}>
                REF: {centriumNodes[activeNode].ref}
              </span>
              <h3 className={styles.atlasNodeTitle}>
                {centriumNodes[activeNode].name}
              </h3>
              <p className={styles.atlasNodeDesc}>
                {centriumNodes[activeNode].desc}
              </p>

              <div className={`mt-4 border-t border-border/10 pt-4 ${isLeaked ? "border-red-500/10" : "border-blue-500/10"}`}>
                <span className={`font-mono text-[9px] block mb-1 uppercase ${isLeaked ? "text-red-500" : "text-[#7aa7ff]"}`}>
                  {isLeaked ? "// LEAKED INTERNAL REPORT" : "// OFFICIAL LOGISTICS ARCHIVE"}
                </span>
                <p className="text-xs italic text-[#8b949e] leading-relaxed">
                  {isLeaked ? centriumNodes[activeNode].leak : "Spatial data integrity verified. No siber threats or leak vectors detected."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 05. “Federal Structure” Bölümü */}
        <section className={styles.structureSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>GOVERNMENT STRUCTURE</span>
            <h2 className={styles.sectionTitle}>Federal Command Structure</h2>
            <p className={styles.sectionSlogan}>
              {isLeaked 
                ? "SWOS does not govern through persuasion. It governs through continuity, currency, and command."
                : "Continuous security. Seamless coordination. Unbroken chain of command."
              }
            </p>
          </div>

          <div className={styles.structureDiagram}>
            <div className={`${styles.diagramRow} flex flex-col md:flex-row items-center justify-center gap-12 md:gap-10 w-full mb-12 md:mb-14`}>
              <div className={`${styles.diagramNode} w-full max-w-[220px] md:max-w-none`} style={{ borderColor: isLeaked ? "#ff3b3b" : "#7aa7ff" }}>
                <span className={styles.nodeTitle}>PRESIDENT</span>
                <span className={styles.nodeValue}>Matt</span>
                <span className={styles.nodeLeader}>Supreme Command</span>
                <div className={styles.diagramLineVertical} />
              </div>
            </div>

            <div className={`${styles.diagramRow} flex flex-col md:flex-row items-center justify-center gap-12 md:gap-10 w-full mb-12 md:mb-14`}>
              <div className={`${styles.diagramNode} w-full max-w-[220px] md:max-w-none`}>
                <span className={styles.nodeTitle}>VICE PRESIDENT</span>
                <span className={styles.nodeValue}>Jeff</span>
                <span className={styles.nodeLeader}>Executive Deputy</span>
                <div className={styles.diagramLineVertical} />
              </div>
              <div className={`${styles.diagramNode} w-full max-w-[220px] md:max-w-none`}>
                <span className={styles.nodeTitle}>GENERAL SECRETARY</span>
                <span className={styles.nodeValue}>Alice</span>
                <span className={styles.nodeLeader}>Administration</span>
                <div className={styles.diagramLineVertical} />
              </div>
              <div className={`${styles.diagramNode} w-full max-w-[220px] md:max-w-none`}>
                <span className={styles.nodeTitle}>REPRESENTATIVE OF STATES</span>
                <span className={styles.nodeValue}>Linda Olesiv</span>
                <span className={styles.nodeLeader}>Federal Council</span>
                <div className={styles.diagramLineVertical} />
              </div>
            </div>

            <div className={`${styles.diagramRow} flex flex-col md:flex-row items-center justify-center gap-12 md:gap-10 w-full`}>
              <div className={`${styles.diagramNode} w-full max-w-[220px] md:max-w-none`}>
                <span className={styles.nodeTitle}>MINISTER OF DEFENSE</span>
                <span className={styles.nodeValue}>Samuel Fox</span>
                <span className={styles.nodeLeader}>Military Command</span>
                <div className={`${styles.diagramLineVertical} md:hidden`} />
              </div>
              <div className={`${styles.diagramNode} w-full max-w-[220px] md:max-w-none`}>
                <span className={styles.nodeTitle}>MINISTER OF ECONOMICS</span>
                <span className={styles.nodeValue}>Sergei Petkov</span>
                <span className={styles.nodeLeader}>Financial Control</span>
              </div>
            </div>
          </div>
        </section>

        {/* 06. Başkanlık Bölümü — “President Matt” */}
        <section className={styles.presidentSection}>
          <div className={styles.presidentProfileCard}>
            <div className={styles.presidentBody}>
              <div 
                className="relative w-full aspect-[1/1.35] border border-border/10 bg-black cursor-zoom-in"
                onClick={() => setActiveLightbox("/media/corporations/president-matt.jpg")}
              >
                <Image
                  src="/media/corporations/president-matt.jpg"
                  alt="President Matt Supreme Executive Portrait"
                  fill
                  className="object-cover"
                  sizes="280px"
                  unoptimized
                />
              </div>
              <div className={styles.presidentTextContainer}>
                <span className={styles.presidentSub}>SUPREME EXECUTIVE AUTHORITY</span>
                <h3 className={styles.presidentTitle}>President Matt</h3>
                <p className={styles.presidentDesc}>
                  Matt is not just the president of SWOS; he is the iron will of the structure. Under his regime, the state ceases to be an institution that changes with elections and becomes a three-hundred-year-old machine of continuity.
                </p>
                <div className="font-mono text-xs text-muted-foreground flex gap-4 mt-2">
                  <span>OFFICE: SWOS HQ</span>
                  <span>STATUS: GOVERNING</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 07. “Swos Headquarters” Bölümü */}
        <section className={styles.hqSection}>
          <div className={styles.hqGrid}>
            <div>
              <span className={styles.sectionKicker}>POWER CENTER</span>
              <h2 className={styles.sectionTitle}>Swos Headquarters</h2>
              <p className={styles.sectionSlogan}>"Where the capital obeys."</p>
              
              <p className="text-sm text-[#8b949e] leading-relaxed mt-4">
                Centrium is the federal capital on paper; but the true seat of power lies in Swos Headquarters, where crisis management councils convene and the Council of Ministers assembles under emergency codes.
              </p>
            </div>

            <div 
              className={`${styles.hqImageWrapper} cursor-zoom-in relative`}
              onClick={() => setActiveLightbox("/media/corporations/centrium-street.jpg")}
            >
              <img
                src="/media/corporations/centrium-street.jpg"
                alt="Centrium rainy siber-street view"
                className="w-full h-auto rounded-xl border border-[#30363d]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none rounded-xl" />
            </div>
          </div>
        </section>

        {/* 08. “Currency & Core Authority” Bölümü */}
        <section id="currency" className={styles.currencySection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>INFRASTRUCTURE</span>
            <h2 className={styles.sectionTitle}>Currency & Core Authority</h2>
            <p className={styles.sectionSlogan}>"All transactions. All accounts. All worlds. One center."</p>
          </div>

          <div className={styles.currencyGrid}>
            <div className={styles.currencyCoreCard}>
              <div className={styles.coreHeader}>
                <h3 className={styles.coreTitle}>Iohcoin Core</h3>
                <span className={styles.coreRef}>CORE_SYS_01</span>
              </div>
              <p className={styles.coreDesc}>
                The System's internal currency pipeline and primary transaction registry infrastructure. Stores all transaction history entirely within the siber database.
              </p>
            </div>

            <div className={styles.currencyCoreCard}>
              <div className={styles.coreHeader}>
                <h3 className={styles.coreTitle}>World-Currency Core</h3>
                <span className={styles.coreRef}>CORE_SYS_02</span>
              </div>
              <p className={styles.coreDesc}>
                Financial records and siber transfers of citizens still residing in the old world, facilitated via quantum entanglement.
              </p>
            </div>
          </div>

          {/* SWOS Tax Simulator Panel */}
          <div className={styles.taxSimulator}>
            <div className={`${styles.simulatorHeader} flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between p-4 sm:px-5 sm:py-3 w-full`}>
              <span className={`${styles.simulatorTitle} text-[0.65rem] sm:text-xs tracking-[0.02em] sm:tracking-[0.05em] whitespace-normal break-words leading-relaxed`}>
                // SWOS STATE TREASURY // TAX RESOLUTION WIDGET
              </span>
              <span className={`${styles.simulatorCode} text-[0.65rem] sm:text-xs font-mono font-bold text-[#7aa7ff]`}>
                SYS_TAX_82A
              </span>
            </div>

            <div className={`${styles.simulatorBody} p-4 sm:p-10 w-full`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start w-full">
                <div className={styles.simulatorFormCol}>
                  <p className={`${styles.simulatorDesc} text-xs sm:text-sm`}>
                    Calculate the federal tax to be deducted from your mining activities or siber transfers, in accordance with state fiscal policies.
                  </p>
                  <form onSubmit={handleCalculateTax} className="flex flex-col gap-4 w-full">
                    <div className={`${styles.inputWrapper} flex items-center w-full`}>
                      <span className={`${styles.inputPrefix} px-3 py-2.5 sm:px-5 sm:py-3`}>IOH</span>
                      <input
                        type="number"
                        placeholder="ENTER AMOUNT..."
                        value={iohAmount}
                        onChange={(e) => setIohAmount(e.target.value)}
                        className={`${styles.simulatorInput} flex-1 min-w-0 placeholder:text-[#555]`}
                        min="1"
                        step="any"
                        required
                      />
                    </div>
                    <button type="submit" className={`${styles.simulatorButton} w-full text-center py-2.5 sm:py-3`}>
                      CALCULATE DEDUCTIONS
                    </button>
                  </form>
                </div>

                <div className={`${styles.simulatorResultCol} p-4 sm:p-6 min-h-[180px] sm:min-h-[220px] w-full mt-4 lg:mt-0`}>
                  {taxResult ? (
                    <div className={styles.taxDetails}>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-[0.7rem] sm:text-xs py-1 border-b border-white/5">
                        <span className="text-[#8b949e]">State Core Tax (State Share 34%):</span>
                        <span className="text-[#ff3b3b] font-mono font-bold">-{taxResult.stateTax} IOH</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-[0.7rem] sm:text-xs py-1 border-b border-white/5">
                        <span className="text-[#8b949e]">Military Defense Fund (War Contribution 10%):</span>
                        <span className="text-[#ff3b3b] font-mono font-bold">-{taxResult.militaryFund} IOH</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-[0.7rem] sm:text-xs py-1 border-b border-white/5">
                        <span className="text-[#8b949e]">Presidential Directive Commission (Executive Share 5%):</span>
                        <span className="text-[#ff3b3b] font-mono font-bold">-{taxResult.leaderShare} IOH</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-[0.7rem] sm:text-xs py-1 border-b border-white/5">
                        <span className="text-[#8b949e]">Vessel Ego Backup Fee (Backup Fee 3%):</span>
                        <span className="text-[#ff3b3b] font-mono font-bold">-{taxResult.maintenanceFee} IOH</span>
                      </div>
                      
                      <div className={styles.taxDivider} />

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-[0.7rem] sm:text-xs py-1">
                        <span className="font-semibold text-muted-foreground">Total Deductions (Total Deductions 52%):</span>
                        <span className="text-[#ff3b3b] font-mono font-bold">-{taxResult.total} IOH</span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-[0.75rem] sm:text-sm py-2 mt-2 bg-[#7aa7ff]/5 px-2 rounded border border-[#7aa7ff]/10">
                        <span className="text-white font-bold">NET APPROVED BALANCE (Approved):</span>
                        <span className="text-[#7aa7ff] font-mono font-bold text-base sm:text-lg">+{taxResult.net} IOH</span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.emptyResults}>
                      <div className={styles.emptyScannerLine} />
                      <span className="text-xs sm:text-sm font-mono text-muted-foreground text-center">
                        AWAITING TRANSACTION VALUATION DATA...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 09. “Security State” Bölümü */}
        <section id="defense" className={styles.securitySection}>
          <div className={styles.securityGrid}>
            <div>
              <span className={styles.sectionKicker}>SECURITY CONTROL</span>
              <h2 className={styles.sectionTitle}>Security State</h2>
              <p className={styles.sectionSlogan}>"Protection is the language of control."</p>
              
              <div className={styles.securityList}>
                <div className={styles.securityItem}>
                  <span className={styles.securityItemName}>Military Grids</span>
                  <span className={styles.securityItemDesc}>Control of orbital shields and missile batteries.</span>
                </div>
                <div className={styles.securityItem}>
                  <span className={styles.securityItemName}>Security Divisions</span>
                  <span className={styles.securityItemDesc}>Cyber security squads and patrol grids.</span>
                </div>
                <div className={styles.securityItem}>
                  <span className={styles.securityItemName}>Drone Enforcement</span>
                  <span className={styles.securityItemDesc}>Autonomous drone surveillance over central zones.</span>
                </div>
                <div className={styles.securityItem}>
                  <span className={styles.securityItemName}>Antivirus Units</span>
                  <span className={styles.securityItemDesc}>Siber security and threat clean-up divisions.</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div 
                className="relative w-full cursor-zoom-in"
                onClick={() => setActiveLightbox("/media/corporations/centrium-parade-full.jpg")}
              >
                <img
                  src="/media/corporations/centrium-parade-full.jpg"
                  alt="Centrium Military Parade"
                  className="w-full h-auto rounded-lg border border-border/10"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none rounded-lg" />
                <div className="absolute bottom-2 left-3 font-mono text-[9px] text-[#ff3b3b] font-bold">
                  // FORCES DIRECTORY // PARADE_GRID_2303
                </div>
              </div>

              <div className={styles.securityTelemetry}>
                <div className={styles.telemetryHeader}>
                  <span>// SWOS FORCES TELEMETRY</span>
                  <span className="blink">EMERGENCY STATE ACTIVE</span>
                </div>
                <div className={styles.telemetryBody}>
                  <div className={styles.telemetryRow}>
                    <span className={styles.telemetryLabel}>DEFENSE PROTOCOL</span>
                    <span className={styles.telemetryValue}>D-9 ACTIVE</span>
                  </div>
                  <div className={styles.telemetryRow}>
                    <span className={styles.telemetryLabel}>THREAT FACTOR</span>
                    <span className={styles.telemetryValue}>SWOS FORCES ENGAGED</span>
                  </div>
                  <div className={styles.telemetryRow}>
                    <span className={styles.telemetryLabel}>CORE INTEGRITY</span>
                    <span className={styles.telemetryValue} style={{ color: "#ff3b3b" }}>34.2% (UNDER ATTACK)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orbital Conflict Radar Map */}
          <div className={styles.radarMapSection}>
            <div className={styles.radarHeader}>
              <span className={styles.radarTitle}>// SWOS ORBITAL COMMAND // SECTOR CONFLICT MONITOR</span>
              <span className={styles.radarCode}>SEC_RADAR_90X</span>
            </div>

            <div className={styles.radarBody}>
              <div className={styles.radarLayout}>
                {/* Vektörel Radar Haritası */}
                <div className={styles.radarViewport}>
                  {/* Grid background lines */}
                  <div className={styles.radarGridBackground} />
                  {/* Radar sweep line */}
                  <div className={styles.radarSweep} />
                  
                  {/* Radar Hotspots */}
                  {conflictHotspots.map((spot) => (
                    <button
                      key={spot.id}
                      onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                      className={`${styles.radarHotspot} ${activeHotspot === spot.id ? styles.activeHotspot : ""}`}
                      style={{ 
                        left: spot.x, 
                        top: spot.y,
                        backgroundColor: spot.color,
                        boxShadow: `0 0 10px ${spot.color}`
                      }}
                    >
                      <span className={styles.hotspotPing} style={{ borderColor: spot.color }} />
                    </button>
                  ))}
                  
                  <div className={styles.radarTargetOverlay}>
                    <div className={styles.targetReticle} />
                    <span className="font-mono text-[9px] text-[#7aa7ff] opacity-40 absolute top-2 right-3">SYS_ALT_REF: 829.1</span>
                  </div>
                </div>

                {/* İstihbarat Rapor Paneli */}
                <div className={`${styles.radarDossier} !h-auto !min-h-0 !p-4 md:!p-6 w-full`}>
                  {activeHotspot !== null ? (
                    (() => {
                      const spot = conflictHotspots.find(s => s.id === activeHotspot);
                      if (!spot) return null;
                      return (
                        <div className="flex flex-col gap-3 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full pb-2 border-b border-white/5">
                            <span className="font-mono text-[0.65rem] sm:text-xs font-bold tracking-wider" style={{ color: spot.color }}>
                              ✦ ALERT: {spot.status}
                            </span>
                            <span className="font-mono text-[0.6rem] sm:text-[0.65rem] font-bold border px-1.5 py-0.5 rounded self-start sm:self-auto" style={{ borderColor: spot.color, color: spot.color }}>
                              THREAT: {spot.threat}
                            </span>
                          </div>
                          
                          <h4 className="text-xs sm:text-sm font-bold tracking-wider text-white uppercase leading-snug">
                            {spot.name}
                          </h4>
                          
                          <p className="text-[0.7rem] sm:text-xs text-[#8b949e] leading-relaxed py-1">
                            {spot.details}
                          </p>

                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pt-2 border-t border-white/5 w-full">
                            <span className="font-mono text-[8px] sm:text-[9px] text-muted-foreground">COORDINATES: {spot.x} / {spot.y}</span>
                            <span className="font-mono text-[8px] sm:text-[9px] text-[#ff3b3b] font-bold blink self-start sm:self-auto">MARTIAL LAW ACTIVE</span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className={styles.emptyDossier}>
                      <span className={styles.emptyScannerLine} />
                      <span className="font-mono text-[10px] text-center">SELECT ACTIVE PING COORDINATES FOR DECISION DIRECTIVES...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. “Citizenship After Death” Bölümü */}
        <section id="citizenship" className={styles.citizenshipSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>SYSTEM LOGIC</span>
            <h2 className={styles.sectionTitle}>Citizenship After Death</h2>
            <p className={styles.sectionSlogan}>"Death is not an end. It is a transfer of jurisdiction."</p>
          </div>

          <div className={styles.flowContainer}>
            <div className={styles.flowStep}>
              <div className={styles.flowStepCircle}>01</div>
              <span className={styles.flowStepName}>DEATH</span>
              <span className={styles.flowStepDesc}>Termination of the biological vessel.</span>
            </div>
            <div className={styles.flowConnector}>→</div>
            <div className={styles.flowStep}>
              <div className={styles.flowStepCircle}>02</div>
              <span className={styles.flowStepName}>TRANSFER</span>
              <span className={styles.flowStepDesc}>Migration of the energy identity into quantum computing grids.</span>
            </div>
            <div className={styles.flowConnector}>→</div>
            <div className={styles.flowStep}>
              <div className={styles.flowStepCircle}>03</div>
              <span className={styles.flowStepName}>REGISTRATION</span>
              <span className={styles.flowStepDesc}>Establishing a registered profile in System servers.</span>
            </div>
            <div className={styles.flowConnector}>→</div>
            <div className={styles.flowStep}>
              <div className={styles.flowStepCircle}>04</div>
              <span className={styles.flowStepName}>EGO ACCESS</span>
              <span className={styles.flowStepDesc}>Authorization of memories and identity tags.</span>
            </div>
            <div className={styles.flowConnector}>→</div>
            <div className={styles.flowStep}>
              <div className={styles.flowStepCircle}>05</div>
              <span className={styles.flowStepName}>RECORD</span>
              <span className={styles.flowStepDesc}>Commitment into the official SWOS database registries.</span>
            </div>
          </div>

          {/* Interactive Citizen Audit Terminal */}
          <div className={styles.auditTerminal}>
            <div className={`${styles.terminalHeader} flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-4 sm:px-5 sm:py-3 w-full`}>
              <div className="flex items-center gap-1.5">
                <span className={styles.terminalDotRed} />
                <span className={styles.terminalDotYellow} />
                <span className={styles.terminalDotGreen} />
              </div>
              <span className={`${styles.terminalTitle} text-[0.65rem] sm:text-xs tracking-[0.02em] sm:tracking-[0.05em] whitespace-normal break-words leading-relaxed flex-1`}>
                SWOS // SECURE CITIZEN DATABASE QUERY
              </span>
              <span className="text-[0.6rem] sm:text-[0.7rem] font-bold text-[#7aa7ff] font-mono border border-[#7aa7ff]/30 px-1.5 py-0.5 rounded self-start sm:self-auto">
                ENCRYPTED
              </span>
            </div>

            <div className={`${styles.terminalBody} p-4 sm:p-10 w-full`}>
              <p className={styles.terminalIntro}>
                Enter your identity name to verify your citizenship status, threat coefficient index, and post-death digital ego transfer records in the state registries.
              </p>

              <form onSubmit={handleAudit} className="flex flex-col gap-4 w-full">
                <input
                  type="text"
                  placeholder="ENTER CITIZEN FULL NAME..."
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  disabled={auditState === "scanning"}
                  className={`${styles.auditInput} w-full px-4 py-2.5 sm:py-3 font-mono text-sm placeholder:text-[#555]`}
                />
                <button
                  type="submit"
                  disabled={auditState === "scanning" || !citizenName.trim()}
                  className={`${styles.auditButton} w-full py-2.5 sm:py-3 font-mono font-bold text-xs uppercase tracking-wider text-center`}
                >
                  {auditState === "scanning" ? "PROCESSING..." : "RUN SYSTEM AUDIT"}
                </button>
              </form>

              {auditState === "scanning" && (
                <div className={`${styles.terminalConsole} p-4 mt-4 font-mono text-[0.65rem] sm:text-xs leading-relaxed max-h-[180px] overflow-y-auto whitespace-pre-wrap break-all`}>
                  {auditProgress.map((log, idx) => (
                    <div key={idx} className="py-0.5 border-b border-white/[0.02]">
                      {log}
                    </div>
                  ))}
                  <div className={styles.consoleBlinkCursor} />
                </div>
              )}

              {auditState === "done" && auditResult && (
                <div className={`${styles.auditResultCard} p-4 sm:p-6 w-full mt-6`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-white/10 pb-3 mb-4">
                    <h4 className="text-xs sm:text-sm font-bold tracking-wider text-[#7aa7ff]">CITIZEN RECORD RETRIEVED</h4>
                    <span className="text-[0.65rem] sm:text-xs font-mono text-muted-foreground">{auditResult.id}</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-white/5 pb-2">
                      <span className="text-[0.65rem] sm:text-xs text-muted-foreground font-mono">CITIZEN NAME:</span>
                      <span className="text-xs sm:text-sm font-bold font-mono">{citizenName.toUpperCase()}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-white/5 pb-2">
                      <span className="text-[0.65rem] sm:text-xs text-muted-foreground font-mono">SWOS STATUS:</span>
                      <span 
                        className="text-xs sm:text-sm font-mono"
                        style={{ 
                          color: auditResult.status === "ACTIVE" ? "#7aa7ff" : 
                                 auditResult.status === "RESTRICTED" ? "#ffc83b" : 
                                 "#ff3b3b",
                          fontWeight: "bold"
                        }}
                      >
                        {auditResult.status}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-white/5 pb-2">
                      <span className="text-[0.65rem] sm:text-xs text-muted-foreground font-mono">CLEARANCE LEVEL:</span>
                      <span className="text-xs sm:text-sm font-mono font-semibold">{auditResult.clearance}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-white/5 pb-2">
                      <span className="text-[0.65rem] sm:text-xs text-muted-foreground font-mono">THREAT INDEX:</span>
                      <span 
                        className="text-xs sm:text-sm font-mono font-semibold"
                        style={{ 
                          color: parseFloat(auditResult.threat) > 50 ? "#ff3b3b" : "#8b949e"
                        }}
                      >
                        {auditResult.threat}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-white/5 pb-2">
                      <span className="text-[0.65rem] sm:text-xs text-muted-foreground font-mono">DIGITAL EGO INTEGRITY:</span>
                      <span className="text-xs sm:text-sm font-mono">{auditResult.ego}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="text-[0.65rem] sm:text-xs text-muted-foreground font-mono">DIRECTIVE ORDER:</span>
                      <span 
                        className="text-xs sm:text-sm font-mono font-semibold"
                        style={{ 
                          color: auditResult.status === "DEVIANT" || auditResult.status === "TERMINATED" ? "#ff3b3b" : "#7aa7ff"
                        }}
                      >
                        {auditResult.action}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 11. “Public Order Broadcast” Bölümü */}
        <section className={styles.broadcastSection}>
          <div className={`${styles.tickerContainer} flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 p-3 md:p-4 w-full`}>
            <span className={`${styles.tickerLabel} self-start`}>ALERT NOTICE</span>
            <div className={`${styles.tickerTrack} w-full overflow-hidden`}>
              <span>EMERGENCY CODE ACTIVE ✦ REPORT UNAUTHORIZED PORTAL ACTIVITY ✦ ALL CITIZENS STAY INDOORS DURING MATRIX FLUSH ✦ THREAT ACTORS DETECTED IN CENTRIUM ✦</span>
            </div>
          </div>

          <div className={styles.broadcastGrid}>
            <div className={styles.broadcastMonitor}>
              <div className={styles.monitorHeader}>
                <span className={styles.monitorDot} />
                <span className={styles.monitorTitle}>OFFICIAL DIRECTIVE</span>
              </div>
              <p className={styles.monitorContent}>
                Threat actors violating system-wide security have been identified. Report any unauthorized portal or siber activity immediately to the <span className={styles.monitorHighlight}>Security Divisions</span>.
              </p>
            </div>

            <div className={styles.broadcastMonitor} style={{ borderColor: "#ff3b3b" }}>
              <div className={styles.monitorHeader}>
                <span className={styles.monitorDot} style={{ backgroundColor: "#ff3b3b", boxShadow: "0 0 6px #ff3b3b" }} />
                <span className={styles.monitorTitle} style={{ color: "#ff3b3b" }}>WANTED ANNOUNCEMENT</span>
              </div>
              <p className={styles.monitorContent}>
                Algus, Kevin, Mike, and Mina. Charged with attempting to breach the Core network in collusion with the Corporate Union. A massive <span className={styles.monitorHighlight} style={{ color: "#ff3b3b" }}>Iohcoin bounty</span> is active for information leading to their capture.
              </p>
            </div>
          </div>
        </section>

        {/* 12. “Swos vs Corporate Union” Bölümü */}
        <section className={styles.dividedSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>GLOBAL CONFLICT</span>
            <h2 className={styles.sectionTitle}>The Divided World</h2>
            <p className={styles.sectionSlogan}>States Union vs Corporate Union</p>
          </div>

          <div className={styles.dividedGrid}>
            <div className={styles.dividedCol}>
              <h3 className={styles.dividedTitle}>SWOS (States Union)</h3>
              <p className={styles.dividedDesc}>
                The centralized federal mechanism carrying the legacy of old nations into the quantum age, controlling borders, data shields, and currency cores with state discipline.
              </p>
            </div>

            <div className={styles.dividedSplitter} />

            <div className={`${styles.dividedCol} ${styles.dividedColRight}`}>
              <h3 className={styles.dividedTitleRight}>Corporate Union</h3>
              <p className={styles.dividedDesc}>
                A loose alliance structure of five major oligarchic conglomerates that purchased cities, data servers, and siber logistics, commercializing the future.
              </p>
            </div>
          </div>
        </section>

        {/* 13. “Crisis Archive” Bölümü */}
        <section id="crisis" className={styles.crisisSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>CLASSIFIED INTEL</span>
            <h2 className={styles.sectionTitle}>Crisis Archive</h2>
            <p className={styles.sectionSlogan}>
              {isLeaked ? "// SYSTEM FAILURE CHRONOLOGICAL FILES" : "// OFFICIAL INCIDENT RESOLUTION LOGS"}
            </p>
          </div>

          <div className={styles.crisisList}>
            {swosData.crisisArchive.map((item) => (
              <div key={item.id} className={styles.crisisItem}>
                <div 
                  className={`${styles.crisisItemSummary} flex flex-col md:flex-row md:items-center justify-between p-4 md:px-8 md:py-5 gap-3 md:gap-4 w-full`}
                  onClick={() => setOpenCrisis(openCrisis === item.id ? null : item.id)}
                >
                  <div className="flex flex-row justify-between items-center w-full md:w-auto md:contents">
                    <span className={`${styles.crisisId} text-xs font-mono text-[#8b949e]`}>{item.id}</span>
                    <span className={`${styles.crisisSeverityBadge} ${item.severity === "critical" ? styles.severityCritical : styles.severityHigh} md:hidden`}>
                      {item.severity}
                    </span>
                  </div>
                  <span className={`${styles.crisisTitleText} text-xs sm:text-sm font-semibold tracking-wider text-[#d8dee9] w-full md:w-auto text-left`}>
                    {item.title}
                  </span>
                  <span className={`${styles.crisisSeverityBadge} ${item.severity === "critical" ? styles.severityCritical : styles.severityHigh} hidden md:inline-block`}>
                    {item.severity}
                  </span>
                </div>
                
                {openCrisis === item.id && (
                  <div className={`${styles.crisisItemContent} grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 p-4 sm:p-8 w-full`}>
                    <div className={`${styles.crisisColumn} w-full`}>
                      <h5 className="text-[#7aa7ff] text-[0.7rem] sm:text-[0.75rem] font-mono">// OFFICIAL STATE LOG</h5>
                      <p className="text-xs text-[#8b949e] leading-relaxed">{item.publicVersion}</p>
                    </div>
                    <div className={`${styles.crisisColumn} w-full border-t md:border-t-0 md:border-l border-[#30363d]/50 pt-4 md:pt-0 md:pl-8`}>
                      <h5 className="text-[#ff3b3b] text-[0.7rem] sm:text-[0.75rem] font-mono">// LEAKED SYSTEM REALITY</h5>
                      <p className="text-xs text-red-400/80 leading-relaxed">{item.classifiedVersion}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 14. En Alt: “SWOS nedir?” - Manifesto */}
        <section className={styles.finalSection}>
          <div className={styles.finalContent}>
            <h2 className={styles.finalTitle}>What is SWOS?</h2>
            
            <p className={styles.finalParagraph}>
              SWOS — the System World States Union — is the federal governing mechanism born from absorbing the ruins of old nations following the Great Collapse.
            </p>
            
            <p className={styles.finalParagraph}>
              It defines itself as the guardian of order, security, and continuity. It centrally governs quantum cities, economic records connected to the old world, currency cores, ministerial channels, and military command networks.
            </p>

            <p className={styles.finalHighlight}>
              "If the Corporate Union purchased the world, SWOS registered it. One markets the future, the other permits it."
            </p>

            <p className={styles.finalParagraph}>
              The promise of SWOS is simple: preventing the return of chaos. Yet the price of this promise is heavy. For SWOS, security is not merely protection; it is the right of surveillance, restriction, and suppression when necessary. Even after death, humans cannot escape its logging networks. The body changes, the city changes, the mode of existence changes; but the authority remains absolute.
            </p>

            <p className={styles.finalSlogan}>
              THE STATE DID NOT SURVIVE THE COLLAPSE. IT BECAME THE COLLAPSE.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <BooksIndexFooter context="encyclopedia" />

      {/* Global Lightbox Modal viewport */}
      {activeLightbox && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4 cursor-zoom-out select-none"
          onClick={() => setActiveLightbox(null)}
        >
          <div className="absolute top-4 right-4 text-paper/70 hover:text-paper font-mono text-sm cursor-pointer border border-white/10 px-3 py-1.5 rounded bg-black/40">
            ✕ CLOSE
          </div>
          <div className="relative w-[90vw] h-[90vh] max-w-[1200px]">
            <Image
              src={activeLightbox}
              alt="State Document Telemetry Viewport Zoomed"
              fill
              className="object-contain"
              sizes="90vw"
              priority
              unoptimized
            />
          </div>
        </div>
      )}
      {/* Floating Live Quantum System Logs */}
      <div className={`${styles.liveLogsHud} !fixed !bottom-4 !left-4 !right-auto !w-[280px] md:!bottom-8 md:!left-8 md:!w-[330px] pointer-events-none`}>
        <div className={styles.hudHeader}>
          <span className={styles.hudStatusDot} />
          <span>LIVE QUANTUM TELEMETRY</span>
        </div>
        <div className={styles.hudBody}>
          {liveLogs.map((log, idx) => (
            <div key={idx} className={`${styles.hudLogLine} whitespace-pre-wrap break-all text-[0.55rem] tracking-tight py-0.5 opacity-80`}>
              {log}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
