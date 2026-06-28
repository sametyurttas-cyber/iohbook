"use client";

import React, { useState } from "react";
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

  // Separate dossiers by class id
  const kai = aiClasses.find(c => c.id === "kai")!;
  const corewit = aiClasses.find(c => c.id === "corewit")!;
  const antivirus = aiClasses.find(c => c.id === "antivirus")!;
  const kown = aiClasses.find(c => c.id === "kown")!;

  return (
    <div className={styles.page}>
      <IohIndexStylesPlaceholder />
      
      {/* 5th WebGL phase trigger is 3 (Purple/magenta matrix cube) */}
      <EncyclopediaWebGL hoveredIndex={3} />

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
                {/* Simplified Vector Human Body outline */}
                <path d="M50,10 C46,10 44,14 44,18 C44,22 46,26 50,26 C54,26 56,22 56,18 C56,14 54,10 50,10 Z" /> {/* Head */}
                <path d="M50,26 L50,30" /> {/* Neck */}
                <path d="M30,36 C35,32 40,30 50,30 C60,30 65,32 70,36 L75,65 C76,68 74,70 71,69 L67,46 L67,90 L59,145 L50,100 L41,145 L33,90 L33,46 L29,69 C26,70 24,68 25,65 L30,36 Z" /> {/* Body & Limbs */}
                {/* Glowing Code veins inside silhouette */}
                <path className={styles.veinPaths} d="M50,30 L50,85 M50,45 L35,50 M50,45 L65,50 M50,75 L37,110 M50,75 L63,110" />
              </svg>
            </div>
          </div>

          <div className={styles.heroContent}>
            <span className={styles.heroSubtitle}>SYSTEM INTELLIGENCE</span>
            <h1 className={styles.heroTitle}>The Machine Layer of the System</h1>
            <p className={styles.heroLead}>
              İnsan ölümsüzlüğünün altında çalışan makine katmanı.
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
            {/* Vertical Flow Topology */}
            <div className={styles.verticalTopology}>
              <div className={styles.topologyLine} />

              <div 
                className={styles.topologyNode} 
                style={{ "--node-color": "#d8f3ff" } as React.CSSProperties}
                onMouseEnter={() => setHoveredNode(0)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <h3 className={styles.nodeTitle}>KAI</h3>
                <span className={styles.nodeLabel}>Central Quantum Intelligence</span>
              </div>

              <div 
                className={styles.topologyNode} 
                style={{ "--node-color": "#9be7ff" } as React.CSSProperties}
                onMouseEnter={() => setHoveredNode(1)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <h3 className={styles.nodeTitle}>COREWITS</h3>
                <span className={styles.nodeLabel}>Execution / Processing Layer</span>
              </div>

              <div 
                className={styles.topologyNode} 
                style={{ "--node-color": "#ff4d4d" } as React.CSSProperties}
                onMouseEnter={() => setHoveredNode(2)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <h3 className={styles.nodeTitle}>ANTIVIRUS</h3>
                <span className={styles.nodeLabel}>Defense / Immune Layer</span>
              </div>

              <div 
                className={styles.topologyNode} 
                style={{ "--node-color": "#b8bcc8" } as React.CSSProperties}
                onMouseEnter={() => setHoveredNode(3)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <h3 className={styles.nodeTitle}>KOWN</h3>
                <span className={styles.nodeLabel}>Military / Operational AI</span>
              </div>
            </div>

            {/* Explanatory text side */}
            <div className={styles.hierarchyDescription}>
              <p className={styles.hierarchyLead}>
                System’in yapay zekâ mimarisi tek bir akıldan oluşmaz. Her katman başka bir görevi üstlenir.
              </p>
              <p className={styles.hierarchyDetail}>
                KAI varoluşu hesaplar. CoreWit’ler bu hesaplamaları işler ve derin altyapıda gerçeğe dönüştürür. 
                Antivirüsler sistemi savunur ve koruma reflekslerini tetikler. KOWN’lar ise savaşır, itaat eder 
                ve gerektiğinde yok oluşu operasyonel bir başarı kütüğü haline getirir.
              </p>
            </div>
          </div>
        </section>

        {/* 03 KAI SECTION */}
        <section id="kai" className={styles.layerBlueprintSection} style={{ "--theme-color": kai.color } as React.CSSProperties}>
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
                <span className={styles.specSloganTr}>{kai.sloganTr}</span>
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

        {/* 04 COREWIT SECTION */}
        <section id="corewit" className={styles.layerBlueprintSection} style={{ "--theme-color": corewit.color } as React.CSSProperties}>
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
                <span className={styles.specSloganTr}>{corewit.sloganTr}</span>
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
        <section id="antivirus" className={styles.layerBlueprintSection} style={{ "--theme-color": antivirus.color } as React.CSSProperties}>
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
                <span className={styles.specSloganTr}>{antivirus.sloganTr}</span>
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
        <section id="kown" className={styles.layerBlueprintSection} style={{ "--theme-color": kown.color } as React.CSSProperties}>
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
                <span className={styles.specSloganTr}>{kown.sloganTr}</span>
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
                  <th>Yapı</th>
                  <th>Ana Görev</th>
                  <th>Güçlü Taraf</th>
                  <th>Zayıf Taraf</th>
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

        {/* 10 FINAL MANIFESTO */}
        <section className={styles.manifestoSection}>
          <div className={styles.manifestoInner}>
            <p className={styles.manifestoPara}>
              System’in içinde insan olmak, yalnızca yaşamak değildir.<br />
              Hesaplanmak, işlenmek, korunmak ve gerektiğinde silinmek demektir.
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
              <span className={styles.finalSloganTr}>
                System insanı hayatta tutmaz. Çalışır halde tutar.
              </span>
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
