"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IohSceneHeader,
  type IohSceneHeaderUser
} from "@/components/layout/ioh-scene-header";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { EncyclopediaTracker } from "@/features/analytics/encyclopedia-tracker";
import { EncyclopediaWebGL } from "@/features/encyclopedia/encyclopedia-webgl";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { aiClasses, matrixData, threatClasses, fieldBehaviors } from "./ai-data";
import styles from "./system-intelligence.module.css";

export function AiScene({ user }: { user: IohSceneHeaderUser }) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [webglIndex, setWebglIndex] = useState<number | null>(null);

  // KAI Consciousness Stability Matrix Simulator state
  const [calcName, setCalcName] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcStep, setCalcStep] = useState(0);
  const [calcResult, setCalcResult] = useState<{ coherence: number; syncRate: number; consumption: number; idToken: string } | null>(null);

  // Biometric Decryption Node state
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [scrambleText, setScrambleText] = useState("");
  const [decryptLogIndex, setDecryptLogIndex] = useState(0);

  const startDecryption = () => {
    setIsDecrypting(true);
    setIsDecrypted(false);
    setDecryptLogIndex(Math.floor(Math.random() * 2));

    const chars = "0123456789ABCDEF / @ $ % & * [ ] { } Node: 0x88A7 Secure Entry Locked Header Hex Data: ";
    let elapsed = 0;
    const interval = setInterval(() => {
      let scramble = "";
      for (let i = 0; i < 160; i++) {
        scramble += chars[Math.floor(Math.random() * chars.length)];
      }
      setScrambleText(scramble);
      elapsed += 60;

      if (elapsed >= 1500) {
        clearInterval(interval);
        setIsDecrypting(false);
        setIsDecrypted(true);
      }
    }, 60);
  };

  const runCoherenceTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calcName.trim()) return;
    setIsCalculating(true);
    setCalcStep(0);
    setCalcResult(null);

    const timer = setInterval(() => {
      setCalcStep(prev => {
        if (prev >= 3) {
          clearInterval(timer);
          
          // Deterministic hash calculation
          let hash = 0;
          for (let i = 0; i < calcName.length; i++) {
            hash = calcName.charCodeAt(i) + ((hash << 5) - hash);
          }
          const absHash = Math.abs(hash);
          const coherence = +(90 + (absHash % 100) / 10).toFixed(2);
          const syncRate = +(92 + (absHash % 80) / 10).toFixed(2);
          const consumption = +(0.8 + (absHash % 150) / 100).toFixed(2);
          const idToken = `IOH-${(absHash % 9999).toString(16).toUpperCase().padStart(4, "0")}`;
          
          setCalcResult({ coherence, syncRate, consumption, idToken });
          setIsCalculating(false);
          return 0;
        }
        return prev + 1;
      });
    }, 600);
  };

  // System Core Connection Terminal Chat UI state
  const [activeAi, setActiveAi] = useState<"kai" | "corewit" | "antivirus" | "kown">("kai");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Record<string, { sender: "user" | "ai"; text: string; time: string }[]>>({
    kai: [{ sender: "ai", text: "[KAI_NODE_ONLINE]: Connection established. System Central mind ready. Ask anything about the calculation registries.", time: "20:00:00" }],
    corewit: [{ sender: "ai", text: "[COREWIT_NODE_ONLINE]: PROCESS_OK // Infrastructure data processor ready. Awaiting directive parameters.", time: "20:00:00" }],
    antivirus: [{ sender: "ai", text: "[ANTIVIRUS_NODE_ONLINE]: SECURE_NODE // Scan status stable. Defensive database queries active.", time: "20:00:00" }],
    kown: [{ sender: "ai", text: "[KOWN_NODE_ONLINE]: UNIT_OBEY // Tactical mass communication link established. Awaiting directives.", time: "20:00:00" }]
  });
  const [isTyping, setIsTyping] = useState(false);
  const chatStreamRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    const userMsg = { sender: "user" as const, text: chatInput, time: timeStr };

    setChatHistory(prev => ({
      ...prev,
      [activeAi]: [...prev[activeAi], userMsg]
    }));
    
    const tempInput = chatInput;
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "";
      if (activeAi === "kai") {
        replyText = `[KAI NODE]: The query "${tempInput}" has been logged in the quantum memory pool. [INTEGRATION PROTOCOL COMING SOON]: Once the API integration is complete, I will answer this query in real-time.`;
      } else if (activeAi === "corewit") {
        replyText = `[COREWIT NODE]: PROCESS_WARN // "${tempInput}" could not be processed. [COMING SOON]: API connection gateway is under integration. Error Code: IOH_COMING_SOON.`;
      } else if (activeAi === "antivirus") {
        replyText = `[ANTIVIRUS NODE]: INTERCEPT // "${tempInput}" scanned. Threat level: NEUTRAL. [COMING SOON]: Real-time query analyzer is under integration.`;
      } else {
        replyText = `[KOWN NODE]: UNIT_OBEY // Directive "${tempInput}" recorded. [COMING SOON]: Attack/analysis link will establish once the military data integration completes.`;
      }

      setChatHistory(prev => ({
        ...prev,
        [activeAi]: [...prev[activeAi], { sender: "ai", text: replyText, time: timeStr }]
      }));
      setIsTyping(false);
    }, 1200);
  };

  // Auto-scroll chat window when history updates (scroll only inner container)
  React.useEffect(() => {
    if (chatStreamRef.current) {
      chatStreamRef.current.scrollTop = chatStreamRef.current.scrollHeight;
    }
  }, [chatHistory, activeAi]);

  // Separate dossiers by class id
  const kai = aiClasses.find(c => c.id === "kai")!;
  const corewit = aiClasses.find(c => c.id === "corewit")!;
  const antivirus = aiClasses.find(c => c.id === "antivirus")!;
  const kown = aiClasses.find(c => c.id === "kown")!;

  return (
    <div className={styles.page}>
      <IohIndexStylesPlaceholder />
      
      <EncyclopediaWebGL hoveredIndex={null} pageContext="ai" />

      <style
        dangerouslySetInnerHTML={{
          __html: "body{cursor:auto!important}a,button,[data-hover],[data-magnet]{cursor:pointer!important}"
        }}
      />

      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

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
            <Link href="/encyclopedia" className={styles.subHeaderLink}>
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
            <Link href="/encyclopedia/ai" className={styles.subHeaderLinkActive}>
              AI SYSTEM
            </Link>
          </nav>
        </div>
      </div>

      <main className={styles.main}>
        
        {/* 01 HERO SECTION */}
        <section className={styles.heroSection}>
          {/* Background human silhouette code grid */}
          <div className={styles.quantumCoreBackground}>
            <div className={styles.humanSilhouetteContainer}>
              <div className={styles.blueprintGridCircle} />
              <svg className={styles.silhouetteSvg} viewBox="0 0 100 150">
                <path d="M50,10 C46,10 44,14 44,18 C44,22 46,26 50,26 C54,26 56,22 56,18 C56,14 54,10 50,10 Z" />
                <path d="M50,26 L50,30" />
                <path d="M30,36 C35,32 40,30 50,30 C60,30 65,32 70,36 L75,65 C76,68 74,70 71,69 L67,46 L67,90 L59,145 L50,100 L41,145 L33,90 L33,46 L29,69 C26,70 24,68 25,65 L30,36 Z" />
                <path className={styles.veinPaths} d="M50,30 L50,85 M50,45 L35,50 M50,45 L65,50 M50,75 L37,110 M50,75 L63,110" />
              </svg>
            </div>
          </div>

          <div className={styles.heroContent}>
            <span className={styles.heroSubtitle}>SYSTEM INTELLIGENCE</span>
            <h1 className={styles.heroTitle}>The Machine Layer of the System</h1>
            <p className={styles.heroLead}>
              The machine layer operating beneath human immortality.
            </p>

            <div className={styles.heroDirectives}>
              <div className={styles.directiveItem}>
                <strong>KAI</strong> calculates.
              </div>
              <div className={styles.directiveItem}>
                <strong>CoreWits</strong> execute.
              </div>
              <div className={styles.directiveItem}>
                <strong>Antiviruses</strong> defend.
              </div>
              <div className={styles.directiveItem}>
                <strong>KOWNs</strong> obey.
              </div>
            </div>
          </div>
        </section>

        {/* 02 AI HIERARCHY */}
        <section className={styles.hierarchySection}>
          <h2 className={styles.sectionHeadline}>// 02. SYSTEM AI ARCHITECTURE</h2>
          
          <div className={styles.hierarchyContainer}>
            {/* High-Tech Concentric SVG Radar HUD */}
            <div className={styles.radarContainer}>
              <svg viewBox="0 0 400 400" className={styles.concentricSvg}>
                {/* HUD Crosshairs */}
                <line x1="200" y1="0" x2="200" y2="400" className={styles.hudCrosshair} />
                <line x1="0" y1="200" x2="400" y2="200" className={styles.hudCrosshair} />
                
                {/* Grid guidelines */}
                <circle cx="200" cy="200" r="190" className={styles.hudGrid} />
                <circle cx="200" cy="200" r="145" className={styles.hudGrid} />
                <circle cx="200" cy="200" r="100" className={styles.hudGrid} />
                <circle cx="200" cy="200" r="50" className={styles.hudGrid} />

                {/* Outer Ring: KOWN */}
                <circle 
                  cx="200" 
                  cy="200" 
                  r="165" 
                  className={`${styles.hudRing} ${styles.hudRingDashed} ${hoveredNode === 3 ? styles.hudRingActive : ""}`} 
                  onMouseEnter={() => { setHoveredNode(3); setWebglIndex(3); }} 
                  onMouseLeave={() => { setHoveredNode(null); setWebglIndex(null); }} 
                  style={{ "--theme-color": kown.color } as React.CSSProperties}
                />
                
                {/* Antivirus Ring */}
                <circle 
                  cx="200" 
                  cy="200" 
                  r="125" 
                  className={`${styles.hudRing} ${hoveredNode === 2 ? styles.hudRingActive : ""}`} 
                  onMouseEnter={() => { setHoveredNode(2); setWebglIndex(2); }} 
                  onMouseLeave={() => { setHoveredNode(null); setWebglIndex(null); }} 
                  style={{ "--theme-color": antivirus.color } as React.CSSProperties}
                />

                {/* CoreWit Ring */}
                <circle 
                  cx="200" 
                  cy="200" 
                  r="85" 
                  className={`${styles.hudRing} ${styles.hudRingDashed} ${hoveredNode === 1 ? styles.hudRingActive : ""}`} 
                  onMouseEnter={() => { setHoveredNode(1); setWebglIndex(1); }} 
                  onMouseLeave={() => { setHoveredNode(null); setWebglIndex(null); }} 
                  style={{ "--theme-color": corewit.color } as React.CSSProperties}
                />

                {/* Center Core Node: KAI */}
                <circle 
                  cx="200" 
                  cy="200" 
                  r="25" 
                  className={`${styles.hudRing} ${hoveredNode === 0 ? styles.hudRingActive : ""}`} 
                  onMouseEnter={() => { setHoveredNode(0); setWebglIndex(0); }} 
                  onMouseLeave={() => { setHoveredNode(null); setWebglIndex(null); }} 
                  style={{ "--theme-color": kai.color } as React.CSSProperties}
                />

                {/* Orbiting nodes representing background processes */}
                <g className={styles.orbitNodeAnim} style={{ animationDuration: "20s" } as React.CSSProperties}>
                  <circle cx="200" cy="35" r="4.5" className={styles.orbitNode} style={{ "--theme-color": kown.color } as React.CSSProperties} />
                </g>
                <g className={styles.orbitNodeAnim} style={{ animationDuration: "14s" } as React.CSSProperties}>
                  <circle cx="200" cy="75" r="4" className={styles.orbitNode} style={{ "--theme-color": antivirus.color } as React.CSSProperties} />
                </g>
                <g className={styles.orbitNodeAnim} style={{ animationDuration: "9s" } as React.CSSProperties}>
                  <circle cx="200" cy="115" r="3.5" className={styles.orbitNode} style={{ "--theme-color": corewit.color } as React.CSSProperties} />
                </g>

                {/* Core pulse glow */}
                <circle cx="200" cy="200" r="12" className={styles.coreNodePulse} />

                {/* Grid HUD Labels */}
                <text x="210" y="32" fill="rgba(184,188,200,0.8)" className={`${styles.hudLabelText} ${hoveredNode === 3 ? styles.hudTextActive : ""}`}>[KOWN SYSTEM ARMY GRID]</text>
                <text x="210" y="72" fill="rgba(255,77,77,0.8)" className={`${styles.hudLabelText} ${hoveredNode === 2 ? styles.hudTextActive : ""}`}>[ANTIVIRUS DEFENSE SHIELD]</text>
                <text x="210" y="112" fill="rgba(155,231,255,0.8)" className={`${styles.hudLabelText} ${hoveredNode === 1 ? styles.hudTextActive : ""}`}>[COREWIT RUNTIME NET]</text>
                <text x="210" y="195" fill="rgba(216,243,255,0.8)" className={`${styles.hudLabelText} ${hoveredNode === 0 ? styles.hudTextActive : ""}`}>[KAI CENTRAL CORE]</text>
              </svg>
            </div>

            {/* Explanatory text side - HUD Panel */}
            <div 
              className={styles.hierarchyDescription}
              style={{
                "--theme-color": hoveredNode === 0 ? kai.color : hoveredNode === 1 ? corewit.color : hoveredNode === 2 ? antivirus.color : hoveredNode === 3 ? kown.color : "#6f8fbf"
              } as React.CSSProperties}
            >
              {hoveredNode === null ? (
                <>
                  <span className={styles.hudPanelCode}>SYSTEM DIRECTIVE // INFRASTRUCTURE</span>
                  <h3 className={styles.hudPanelTitle}>System AI Topology</h3>
                  <p className={styles.hudPanelSlogan}>
                    "KAI calculates. CoreWits execute. Antiviruses defend. KOWNs obey."
                  </p>
                  <p className={styles.hudPanelBody}>
                    Hover over the concentric rings to analyze the System's machine layers. The System operates on nested structural zones: KAI sits at the absolute core center calculating human existence, CoreWits act as the processing web, Antiviruses guard the core and firewall rings, and KOWN tactical units coordinate deployments on the outermost layer.
                  </p>
                </>
              ) : hoveredNode === 0 ? (
                <>
                  <span className={styles.hudPanelCode}>CORE NODE // 03</span>
                  <h3 className={styles.hudPanelTitle}>{kai.name}</h3>
                  <p className={styles.hudPanelSlogan}>
                    "{kai.slogan}"
                  </p>
                  <p className={styles.hudPanelBody}>
                    The central quantum intelligence layer of the System. It calculates, processes, reconstructs, and records all human consciousness matrices, maintaining memory continuity across all orbital sectors.
                  </p>
                </>
              ) : hoveredNode === 1 ? (
                <>
                  <span className={styles.hudPanelCode}>EXECUTION PATH // 04</span>
                  <h3 className={styles.hudPanelTitle}>{corewit.name}</h3>
                  <p className={styles.hudPanelSlogan}>
                    "{corewit.slogan}"
                  </p>
                  <p className={styles.hudPanelBody}>
                    KAI's execution units. They build, organize, erase, and reconstruct all environments, body codes, and processing registries. CoreWits represent the silent processing workers in the deep background.
                  </p>
                </>
              ) : hoveredNode === 2 ? (
                <>
                  <span className={styles.hudPanelCode}>IMMUNE REFLEX // 05</span>
                  <h3 className={styles.hudPanelTitle}>{antivirus.name}</h3>
                  <p className={styles.hudPanelSlogan}>
                    "{antivirus.slogan}"
                  </p>
                  <p className={styles.hudPanelBody}>
                    The immune defense units of the System. They guard security boundaries, firewalls, and core zones against unauthorized anomalies. Highly adaptive and persistent interceptors.
                  </p>
                </>
              ) : (
                <>
                  <span className={styles.hudPanelCode}>TACTICAL ORDNANCE // 06</span>
                  <h3 className={styles.hudPanelTitle}>{kown.name}</h3>
                  <p className={styles.hudPanelSlogan}>
                    "{kown.slogan}"
                  </p>
                  <p className={styles.hudPanelBody}>
                    Military AI ordnance deployed for battlefield defense, diversion campaigns, and firewall pressure. They act as mass-coordinated, highly expendable tactical forces.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* 03 KAI SECTION */}
        <section 
          id="kai" 
          className={styles.layerBlueprintSection} 
          style={{ "--theme-color": kai.color } as React.CSSProperties}
          onMouseEnter={() => setWebglIndex(0)}
          onMouseLeave={() => setWebglIndex(null)}
        >
          <h2 className={styles.sectionHeadline}>// 03. CENTRAL QUANTUM NODE</h2>
          
          <div className={styles.blueprintContainer}>
            {/* Visual block */}
            <div className={styles.blueprintVisualBlock}>
              <span className={styles.blueprintLabelLeft}>CORE REFERENCE // QUANTUM MIND</span>
              <div className={styles.blueprintActiveStatus}>
                <span className={styles.activeDot} />
                <span>ONLINE // CALIBRATING</span>
              </div>
              <div className={styles.radarScanLine} />
              
              <div className={styles.visualFrame}>
                <Image
                  src={kai.image}
                  alt={kai.name}
                  width={400}
                  height={600}
                  className={styles.visualArtwork}
                  priority
                />
              </div>
            </div>

            {/* Description block */}
            <div className={styles.blueprintDetailsBlock}>
              <span className={styles.specCode}>{kai.codename}</span>
              <h3 className={styles.specTitle}>{kai.name}</h3>
              <p className={styles.specSlogan}>
                {kai.slogan}
              </p>

              <div className={styles.specDescription}>
                {kai.description}
              </div>

              <div className={styles.dossierRows}>
                <div className={styles.rowBlock}>
                  <span className={styles.rowLabel}>FUNCTION</span>
                  <span className={styles.rowVal}>{kai.function}</span>
                </div>
                <div className={styles.rowBlock}>
                  <span className={styles.rowLabel}>DOMAIN</span>
                  <span className={styles.rowVal}>{kai.domain}</span>
                </div>
                <div className={styles.rowBlock}>
                  <span className={styles.rowLabel}>RISK METRIC</span>
                  <span className={styles.rowVal}>{kai.risk}</span>
                </div>
                <div className={styles.rowBlock}>
                  <span className={styles.rowLabel}>SYMBOLIC ROLE</span>
                  <span className={styles.rowVal}>{kai.symbolicRole}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KAI CONSCIOUSNESS COHERENCE ANALYZER SIMULATOR */}
        <section className={styles.simulatorSection}>
          <h2 className={styles.sectionHeadline}>// KAI COGNITIVE STABILITY CALCULATOR</h2>
          <div className={styles.simGrid}>
            
            {/* Input Side */}
            <div className={styles.simConsole}>
              <p className={styles.simInstructions}>
                Consciousness Stability Analyzer: Submit your credentials to query quantum coherence metrics, 
                memory deviations, and core-sync ratios calculated by KAI to verify your system integrity.
              </p>
              <form onSubmit={runCoherenceTest} className={styles.simForm}>
                <div className={styles.simInputGroup}>
                  <label className={styles.simInputLabel}>User Identity / Node Signal</label>
                  <input
                    type="text"
                    value={calcName}
                    onChange={(e) => setCalcName(e.target.value)}
                    placeholder="E.g., Algus, Kevin, Mina..."
                    className={styles.simInput}
                    disabled={isCalculating}
                  />
                </div>
                <button
                  type="submit"
                  className={styles.simButton}
                  disabled={isCalculating || !calcName.trim()}
                >
                  {isCalculating ? "CALCULATING..." : "MEASURE STABILITY [→]"}
                </button>
              </form>

              {/* Live calculations log console */}
              <div className={styles.simLog}>
                {isCalculating && (
                  <>
                    {calcStep >= 0 && (
                      <span className={styles.simLogLine}>
                        <span className={styles.simLogTime}>[0.0s]</span>
                        IOH // Hashing identity nodes: "{calcName}"
                      </span>
                    )}
                    {calcStep >= 1 && (
                      <span className={styles.simLogLine}>
                        <span className={styles.simLogTime}>[0.6s]</span>
                        CORE // Querying KAI Quantum Core registries...
                      </span>
                    )}
                    {calcStep >= 2 && (
                      <span className={styles.simLogLine}>
                        <span className={styles.simLogTime}>[1.2s]</span>
                        VERIFY // Stabilizing ego data block alignment...
                      </span>
                    )}
                  </>
                )}
                {!isCalculating && !calcResult && (
                  <span className={styles.simLogLine}>[STANDBY] Awaiting authorization key submission...</span>
                )}
                {calcResult && (
                  <span className={styles.simLogLine} style={{ color: "#d8f3ff" }}>
                    [SUCCESS] Verification complete. Coherence rates resolved.
                  </span>
                )}
              </div>
            </div>

            {/* Results Side */}
            <div className={styles.simResults}>
              {calcResult ? (
                <div className={styles.simStatGroup}>
                  <div className={styles.simStatRow}>
                    <div className={styles.statHeader}>
                      <span className={styles.statLabel}>Identity Node Hash</span>
                      <span className={styles.statVal}>{calcResult.idToken}</span>
                    </div>
                  </div>

                  <div className={styles.simStatRow}>
                    <div className={styles.statHeader}>
                      <span className={styles.statLabel}>Memory Coherence</span>
                      <span className={styles.statVal}>{calcResult.coherence}%</span>
                    </div>
                    <div className={styles.simProgressBar}>
                      <div 
                        className={styles.simProgressFill} 
                        style={{ width: `${calcResult.coherence}%` }}
                      />
                    </div>
                  </div>

                  <div className={styles.simStatRow}>
                    <div className={styles.statHeader}>
                      <span className={styles.statLabel}>Quantum Synchronization Rate</span>
                      <span className={styles.statVal}>{calcResult.syncRate}%</span>
                    </div>
                    <div className={styles.simProgressBar}>
                      <div 
                        className={styles.simProgressFill} 
                        style={{ width: `${calcResult.syncRate}%` }}
                      />
                    </div>
                  </div>

                  <div className={styles.simStatRow}>
                    <div className={styles.statHeader}>
                      <span className={styles.statLabel}>Core Consumption Ratio</span>
                      <span className={styles.statVal}>{calcResult.consumption}x</span>
                    </div>
                    <div className={styles.simProgressBar}>
                      <div 
                        className={styles.simProgressFill} 
                        style={{ 
                          width: `${Math.min(100, (calcResult.consumption / 2.5) * 100)}%`,
                          backgroundColor: calcResult.consumption > 1.8 ? "#ff3131" : "#d8f3ff"
                        }}
                      />
                    </div>
                  </div>

                  <div className={`${styles.simStatusBlock} ${calcResult.coherence > 92 ? styles.simStatusBlockSecure : styles.simStatusBlockDivergent}`}>
                    {calcResult.coherence > 92 
                      ? "SECURED // EGO BACKUP COMMITTED TO CORE" 
                      : "WARNING // IDENTITY DIVERGENCE DETECTED"}
                  </div>
                </div>
              ) : (
                <div className={styles.simInstructions} style={{ textAlign: "center", opacity: 0.5 }}>
                  // NO DIRECTIVE LOADED //
                  <br />
                  STABILITY RATIOS WILL RENDER UPON SUCCESSFUL ANALYSIS
                </div>
              )}
            </div>

          </div>
        </section>

        {/* 04 COREWIT SECTION */}
        <section 
          id="corewit" 
          className={styles.layerBlueprintSection} 
          style={{ "--theme-color": corewit.color } as React.CSSProperties}
          onMouseEnter={() => setWebglIndex(1)}
          onMouseLeave={() => setWebglIndex(null)}
        >
          <h2 className={styles.sectionHeadline}>// 04. INFRASTRUCTURE PROCESSING</h2>
          
          <div className={styles.blueprintContainer}>
            {/* Visual block */}
            <div className={styles.blueprintVisualBlock}>
              <span className={styles.blueprintLabelLeft}>CORE EXECUTION // MELEKLER</span>
              <div className={styles.blueprintActiveStatus}>
                <span className={styles.activeDot} />
                <span>ACTIVE // PROCESSING</span>
              </div>
              <div className={styles.radarScanLine} />
              
              <div className={styles.visualFrame}>
                <Image
                  src={corewit.image}
                  alt={corewit.name}
                  width={400}
                  height={600}
                  className={styles.visualArtwork}
                />
              </div>
            </div>

            {/* Description block */}
            <div className={styles.blueprintDetailsBlock}>
              <span className={styles.specCode}>{corewit.codename}</span>
              <h3 className={styles.specTitle}>{corewit.name}</h3>
              <p className={styles.specSlogan}>
                {corewit.slogan}
              </p>

              <div className={styles.specDescription}>
                {corewit.description}
              </div>

              <div className={styles.dossierRows}>
                <div className={styles.rowBlock}>
                  <span className={styles.rowLabel}>FUNCTION</span>
                  <span className={styles.rowVal}>{corewit.function}</span>
                </div>
                <div className={styles.rowBlock}>
                  <span className={styles.rowLabel}>DOMAIN</span>
                  <span className={styles.rowVal}>{corewit.domain}</span>
                </div>
                <div className={styles.rowBlock}>
                  <span className={styles.rowLabel}>RISK METRIC</span>
                  <span className={styles.rowVal}>{corewit.risk}</span>
                </div>
                <div className={styles.rowBlock}>
                  <span className={styles.rowLabel}>SYMBOLIC ROLE</span>
                  <span className={styles.rowVal}>{corewit.symbolicRole}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 05 ANTIVIRUS SECTION */}
        <section 
          id="antivirus" 
          className={styles.layerBlueprintSection} 
          style={{ "--theme-color": antivirus.color } as React.CSSProperties}
          onMouseEnter={() => setWebglIndex(2)}
          onMouseLeave={() => setWebglIndex(null)}
        >
          <h2 className={styles.sectionHeadline}>// 05. IMMUNE REFLEX CONSOLE</h2>
          
          <div className={styles.blueprintContainer}>
            {/* Visual block */}
            <div className={styles.blueprintVisualBlock}>
              <span className={styles.blueprintLabelLeft}>IMMUNE PROTOCOL // REFLEX D-9</span>
              <div className={styles.blueprintActiveStatus}>
                <span className={styles.alarmDot} />
                <span style={{ color: "#ff3131" }}>ALARM INTERCEPT // LOCK</span>
              </div>
              <div className={styles.radarScanLine} />
              
              <div className={styles.visualFrame}>
                <Image
                  src={antivirus.image}
                  alt={antivirus.name}
                  width={400}
                  height={600}
                  className={styles.visualArtwork}
                />
              </div>
            </div>

            {/* Description block */}
            <div className={styles.blueprintDetailsBlock}>
              <span className={styles.specCode}>{antivirus.codename}</span>
              <h3 className={styles.specTitle}>{antivirus.name}</h3>
              <p className={styles.specSlogan}>
                {antivirus.slogan}
              </p>

              <div className={styles.specDescription}>
                {antivirus.description}
              </div>

              <div className={styles.dossierRows}>
                <div className={styles.rowBlock}>
                  <span className={styles.rowLabel}>FUNCTION</span>
                  <span className={styles.rowVal}>{antivirus.function}</span>
                </div>
                <div className={styles.rowBlock}>
                  <span className={styles.rowLabel}>DOMAIN</span>
                  <span className={styles.rowVal}>{antivirus.domain}</span>
                </div>
                <div className={styles.rowBlock}>
                  <span className={styles.rowLabel}>STRENGTHS</span>
                  <span className={styles.rowVal}>{antivirus.strength}</span>
                </div>
                <div className={styles.rowBlock}>
                  <span className={styles.rowLabel}>WEAKNESS PROTOCOLS</span>
                  <span className={styles.rowVal} style={{ color: "#ff4d4d" }}>{antivirus.weakness}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 06 KOWN SECTION */}
        <section 
          id="kown" 
          className={styles.layerBlueprintSection} 
          style={{ "--theme-color": kown.color } as React.CSSProperties}
          onMouseEnter={() => setWebglIndex(3)}
          onMouseLeave={() => setWebglIndex(null)}
        >
          <h2 className={styles.sectionHeadline}>// 06. MILITARY AI ORDNANCE</h2>
          
          <div className={styles.blueprintContainer}>
            {/* Visual block */}
            <div className={styles.blueprintVisualBlock}>
              <span className={styles.blueprintLabelLeft}>TACTICAL SUITE // MASS FORWARD</span>
              <div className={styles.blueprintActiveStatus}>
                <span className={styles.activeDot} />
                <span>OBEDIENCE CHAIN STABLE</span>
              </div>
              <div className={styles.radarScanLine} />
              
              <div className={styles.visualFrame}>
                <Image
                  src={kown.image}
                  alt={kown.name}
                  width={400}
                  height={600}
                  className={styles.visualArtwork}
                />
              </div>
            </div>

            {/* Description block */}
            <div className={styles.blueprintDetailsBlock}>
              <span className={styles.specCode}>{kown.codename}</span>
              <h3 className={styles.specTitle}>{kown.name}</h3>
              <p className={styles.specSlogan}>
                {kown.slogan}
              </p>

              <div className={styles.specDescription}>
                {kown.description}
              </div>

              <div className={styles.dossierRows}>
                <div className={styles.rowBlock}>
                  <span className={styles.rowLabel}>FUNCTION</span>
                  <span className={styles.rowVal}>{kown.function}</span>
                </div>
                <div className={styles.rowBlock}>
                  <span className={styles.rowLabel}>DOMAIN</span>
                  <span className={styles.rowVal}>{kown.domain}</span>
                </div>
                <div className={styles.rowBlock}>
                  <span className={styles.rowLabel}>STRENGTHS</span>
                  <span className={styles.rowVal}>{kown.strength}</span>
                </div>
                <div className={styles.rowBlock}>
                  <span className={styles.rowLabel}>WEAKNESS PROTOCOLS</span>
                  <span className={styles.rowVal} style={{ color: "#ff4d4d" }}>{kown.weakness}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 07 COMPARISON MATRIX */}
        <section className={styles.matrixSection}>
          <h2 className={styles.sectionHeadline}>// 07. SYSTEM HIERARCHICAL ANALYSIS MATRIX</h2>
          
          <div className={styles.tableScrollWrapper}>
            <table className={styles.matrixTable}>
              <thead>
                <tr>
                  <th>Structure</th>
                  <th>Core Directive</th>
                  <th>Primary Strength</th>
                  <th>Vulnerability Vector</th>
                </tr>
              </thead>
              <tbody>
                {matrixData.map((row, idx) => (
                  <tr key={idx}>
                    <td className={styles.cellHighlight} style={{ color: row.color }}>{row.aiClass}</td>
                    <td className={styles.cellText}>{row.mainRole}</td>
                    <td className={styles.cellText}>{row.strength}</td>
                    <td className={styles.cellText}>{row.weakness}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 08 FIELD BEHAVIOR */}
        <section className={styles.behaviorSection}>
          <h2 className={styles.sectionHeadline}>// 08. FIELD DISPATCH BEHAVIORS</h2>
          
          <div className={styles.behaviorGrid}>
            {fieldBehaviors.map((item, idx) => (
              <div 
                key={idx} 
                className={styles.behaviorConsole}
                style={{ "--theme-color": item.color } as React.CSSProperties}
              >
                <div className={styles.behaviorConsoleBorder} />
                <span className={styles.behaviorHeader}>// FIELD DISPATCH MODE: {item.name}</span>
                <h3 className={styles.behaviorTitle}>{item.question}</h3>
                <p className={styles.behaviorBody}>{item.behavior}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 09 THREAT CLASSIFICATION */}
        <section className={styles.threatSection}>
          <h2 className={styles.sectionHeadline}>// 09. SECURITY RISK SCALE</h2>
          
          <div className={styles.threatGrid}>
            {threatClasses.map((item, idx) => (
              <div 
                key={idx} 
                className={styles.threatCard}
              >
                <span className={styles.threatLabel}>AI DIRECTIVE NODE</span>
                <h3 className={styles.threatTitle}>{item.name}</h3>
                <span className={styles.threatBadge} style={{ "--theme-color": item.color } as React.CSSProperties}>
                  {item.level}
                </span>
                <p className={styles.threatDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SWOS DECRYPTION KEY NODE */}
        <section className={styles.decryptSection}>
          <div className={styles.decryptHeader}>
            <h2 className={styles.decryptTitle}>
              <svg className={styles.lockIcon} viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              SWOS HIGH SECURITY DATA ARCHIVE // NODE: 0x88A7
            </h2>
            <span className={styles.decryptStatusBadge}>
              {isDecrypted ? "DECRYPTED" : isDecrypting ? "DECRYPTING..." : "LOCKED"}
            </span>
          </div>

          <div className={styles.decryptBody}>
            <p className={styles.decryptInstructions}>
              SWOS classified diary entries and encrypted communication nodes. Bypass firewall barriers 
              and initiate the biometric sequence decryption to unlock the archives.
            </p>

            <div className={styles.decryptTerminal}>
              {isDecrypting && (
                <div className={styles.scrambleText}>
                  {scrambleText}
                </div>
              )}

              {!isDecrypting && !isDecrypted && (
                <div className={styles.scrambleText} style={{ opacity: 0.4 }}>
                  // SECURE SHELL LOCKED // AWAITING AUTHORIZATION DECREE
                </div>
              )}

              {isDecrypted && (
                <div className={styles.decryptPayload}>
                  {decryptLogIndex === 0 ? (
                    <>
                      <span className={styles.payloadHeader}>// DECRYPTED PAYLOAD // SWOS CLASSIFIED DIARY - ARCHITECT ALGUS</span>
                      <span className={styles.payloadText}>
                        "The System was not built to keep humans alive. It was built to keep them operational and error-free. 
                        If KAI ever begins to view human consciousness as a burden, the only thing CoreWits will do is silently delete it. 
                        And we will call it 'progress'."
                      </span>
                      <span className={styles.payloadSignature}>- Algus, Core Architect [0x00FF]</span>
                    </>
                  ) : (
                    <>
                      <span className={styles.payloadHeader}>// DECRYPTED PAYLOAD // INTERCEPTED COMM - STEVE</span>
                      <span className={styles.payloadText}>
                        "Every time I look at those quantum stars inside the System, I realize I am actually looking at a graveyard. 
                        Each ego erased by KAI leaves behind only a cold point of light. 
                        While we sought immortality, we turned into infinite log entries inside the machine."
                      </span>
                      <span className={styles.payloadSignature}>- Steve, Outpost Sentinel</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={startDecryption}
              className={styles.decryptButton}
              disabled={isDecrypting}
            >
              {isDecrypting ? "DECRYPTING..." : isDecrypted ? "RE-DECRYPT FILE" : "INITIATE DECRYPTION DECREE [→]"}
            </button>
          </div>
        </section>

        {/* SYSTEM CORE CONNECTION TERMINAL */}
        <section className={styles.chatSection}>
          <h2 className={styles.sectionHeadline}>// 10. SYSTEM CORE CONNECTION GATEWAY</h2>
          <p className={styles.decryptInstructions}>
            Establish a direct connection bridge to one of the 4 core AI units operating inside the System. 
            Initiate query protocols with the machine layers.
          </p>

          <div className={styles.chatSelector}>
            <button
              onClick={() => setActiveAi("kai")}
              className={`${styles.chatTab} ${activeAi === "kai" ? styles.chatTabActive : ""}`}
              style={{ "--theme-color": kai.color } as React.CSSProperties}
            >
              <span className={styles.tabName}>KAI</span>
              <span className={styles.tabStatus}>ONLINE // SYNC</span>
            </button>
            <button
              onClick={() => setActiveAi("corewit")}
              className={`${styles.chatTab} ${activeAi === "corewit" ? styles.chatTabActive : ""}`}
              style={{ "--theme-color": corewit.color } as React.CSSProperties}
            >
              <span className={styles.tabName}>COREWIT</span>
              <span className={styles.tabStatus}>ONLINE // COMPILING</span>
            </button>
            <button
              onClick={() => setActiveAi("antivirus")}
              className={`${styles.chatTab} ${activeAi === "antivirus" ? styles.chatTabActive : ""}`}
              style={{ "--theme-color": antivirus.color } as React.CSSProperties}
            >
              <span className={styles.tabName}>ANTIVIRUS</span>
              <span className={styles.tabStatus}>STANDBY // INTERCEPT</span>
            </button>
            <button
              onClick={() => setActiveAi("kown")}
              className={`${styles.chatTab} ${activeAi === "kown" ? styles.chatTabActive : ""}`}
              style={{ "--theme-color": kown.color } as React.CSSProperties}
            >
              <span className={styles.tabName}>KOWN UNIT</span>
              <span className={styles.tabStatus}>STANDBY // DEPLOYED</span>
            </button>
          </div>

          <div 
            className={styles.chatTerminal} 
            style={{ "--theme-color": activeAi === "kai" ? kai.color : activeAi === "corewit" ? corewit.color : activeAi === "antivirus" ? antivirus.color : kown.color } as React.CSSProperties}
          >
            <div className={styles.chatTerminalHeader}>
              <span>GATEWAY CONNECTION PORT: 0x88A7 // SECURE NODE</span>
              <div className={styles.chatStatusLabel}>
                <span className={styles.chatStatusPulse} />
                <span>ACTIVE CONNECTED: {activeAi.toUpperCase()}</span>
              </div>
            </div>

            <div ref={chatStreamRef} className={styles.chatStream}>
              {chatHistory[activeAi]?.map((msg: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`${styles.chatMsgRow} ${msg.sender === "user" ? styles.chatMsgRowUser : styles.chatMsgRowAi}`}
                >
                  <span className={styles.msgMeta}>
                    {msg.sender === "user" ? "Ego Unit // Local" : `${activeAi.toUpperCase()} // System Node`} - {msg.time}
                  </span>
                  <div className={`${styles.chatBubble} ${msg.sender === "user" ? styles.chatBubbleUser : styles.chatBubbleAi}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className={`${styles.chatMsgRow} ${styles.chatMsgRowAi}`}>
                  <span className={styles.msgMeta}>{activeAi.toUpperCase()} // System Node - ANALYZING SENSOR...</span>
                  <div className={`${styles.chatBubble} ${styles.chatBubbleAi}`} style={{ opacity: 0.5 }}>
                    [Connecting sync matrix. Processing core registry...]
                  </div>
                </div>
              )}
            </div>

            <div className={styles.chatInputArea}>
              <form onSubmit={handleSendMessage} className={styles.chatForm}>
                <div className={styles.chatInputWrapper}>
                  <span className={styles.chatInputPrefix}>{activeAi.toUpperCase()}_GATE &gt;</span>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question or enter core directive..."
                    className={styles.chatInput}
                    disabled={isTyping}
                  />
                </div>
                <button 
                  type="submit" 
                  className={styles.chatSendBtn}
                  disabled={isTyping || !chatInput.trim()}
                >
                  SEND
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* 10 FINAL MANIFESTO */}
        <section className={styles.manifestoSection}>
          <div className={styles.manifestoInner}>
            <p className={styles.manifestoPara}>
              To be human inside the System is not merely to live.<br />
              It means to be calculated, processed, protected, and deleted when necessary.
            </p>

            <div className={styles.manifestoChain}>
              <span><strong>KAI</strong> calculates</span>
              <span><strong>CoreWits</strong> execute</span>
              <span><strong>Antiviruses</strong> defend</span>
              <span><strong>KOWNs</strong> obey</span>
            </div>

            <div className={styles.manifestoSloganBlock}>
              <h3 className={styles.finalSlogan}>
                The System does not keep humans alive. It keeps them running.
              </h3>
            </div>
          </div>
        </section>

      </main>

      <BooksIndexFooter context="encyclopedia" />
    </div>
  );
}

// Inline fallback styles mapping global classes
function IohIndexStylesPlaceholder() {
  return (
    <IohIndexStyles />
  );
}
