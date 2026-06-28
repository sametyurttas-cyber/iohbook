"use client";

import Image from "next/image";
import { type CompanyProfile } from "./corporations-data";
import styles from "./corporations.module.css";

type CorporationCardProps = {
  company: CompanyProfile;
  index: number;
};

export function CorporationCard({ company, index }: CorporationCardProps) {
  const indexStr = String(index + 1).padStart(3, "0");

  return (
    <article
      id={company.id}
      className={styles.card}
      style={{ "--char-accent": company.accent } as React.CSSProperties}
    >
      <div className={styles.cardBorderTop} />

      {/* Card Header */}
      <header className={styles.cardHeader}>
        <div className={styles.headerMain}>
          <h2 className={styles.corpName}>{company.displayName}</h2>
          <span className={styles.corpLeader}>
            LEADER: {company.leader} ({company.leaderTitle})
          </span>
        </div>
        <div className={styles.headerMeta}>
          <div className={styles.statusIndicator}>
            <span className={styles.statusDotPulse} />
            <span>OLIGARCHY ARCHIVE</span>
          </div>
          <div>FILE_REF: CU_0{index + 1}</div>
          <div>SECTOR: {company.cityName}</div>
        </div>
      </header>

      {/* Card Body */}
      <div className={styles.cardBodyGrid}>
        
        {/* Left Side: Portrait */}
        <div className={styles.portraitWrapper}>
          <span className={`${styles.notch} ${styles.notchTL}`} />
          <span className={`${styles.notch} ${styles.notchTR}`} />
          <span className={`${styles.notch} ${styles.notchBL}`} />
          <span className={`${styles.notch} ${styles.notchBR}`} />
          <div className="relative w-full h-full">
            <Image
              src={company.images.portrait}
              alt={company.leader}
              fill
              className={styles.portraitImage}
              sizes="280px"
              priority={index < 2}
            />
          </div>
        </div>

        {/* Right Side: Information Column */}
        <div className={styles.infoColumn}>
          <blockquote className={styles.tagline}>"{company.tagline}"</blockquote>
          <p className={styles.overviewText}>{company.overview}</p>

          <div>
            <span className={styles.secLabel}>CORE ASSETS</span>
            <div className={styles.capabilitiesGrid}>
              {company.assets.map((asset, aIdx) => (
                <div key={aIdx} className={styles.assetItem}>
                  <div className={styles.assetTitle}>◆ {asset.name}</div>
                  <div className={styles.assetDesc}>{asset.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Lower Grid: Influence Matrice, Relations and Badges */}
      <div className={styles.lowerGrid}>
        
        {/* Influence metrics list */}
        <div>
          <span className={styles.secLabel}>INFLUENCE MATRIX</span>
          <div className={styles.influenceList}>
            {Object.entries(company.influence).map(([key, val]) => (
              <div key={key} className={styles.influenceRow}>
                <div className={styles.influenceLabelRow}>
                  <span className={styles.influenceLabel}>{key.toUpperCase()}</span>
                  <span className={styles.influenceVal}>{val}/10</span>
                </div>
                <div className={styles.influenceBarBg}>
                  <div
                    className={styles.influenceBarFill}
                    style={{ width: `${val * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic relations & core details */}
        <div>
          <span className={styles.secLabel}>SYSTEM TELEMETRY</span>
          <div className={styles.detailsList}>
            <div className={styles.detailRow}>
              <div className={styles.detailTitle}>MAIN SECTOR / DIVISION</div>
              <div className={styles.detailVal}>{company.coreBusiness}</div>
            </div>
            <div className={styles.detailRow}>
              <div className={styles.detailTitle}>SYSTEM DOMINANCE ROLE</div>
              <div className={styles.detailVal}>{company.systemRole}</div>
            </div>
            {company.relations.length > 0 && (
              <div className={styles.detailRow}>
                <div className={styles.detailTitle}>CORPORATE ALLIANCES / CONFLICTS</div>
                <div className={styles.relationsList}>
                  {company.relations.map((rel, rIdx) => (
                    <div key={rIdx} className={styles.relationRow}>
                      <span className={styles.relationTarget}>
                        TO: {rel.target.toUpperCase()} | RELATION: {rel.type.toUpperCase()}
                      </span>
                      <p className={styles.relationDesc}>{rel.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pill tags cloud */}
        <div>
          <span className={styles.secLabel}>CLASSIFICATION TAGS</span>
          <div className={styles.tagsCloud}>
            {company.tags.map((tag, tIdx) => (
              <span key={tIdx} className={styles.tagBadge}>
                {tag}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Optional City brochure panels (Exclusive layout for Agrom with uncropped contain images) */}
      {company.id === "agrom" && company.images.cityDay && (
        <div className="mt-8 pt-8 border-t border-border/10">
          <span className={styles.secLabel}>AGROM CITY ATLAS DATABASE</span>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4">
            
            {/* Day city viewport */}
            <div className="relative border border-border/10 bg-black/40 rounded-lg overflow-hidden p-2 flex flex-col gap-2">
              <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-black/60">
                <Image
                  src={company.images.cityDay}
                  alt="Agrom City street day view"
                  fill
                  className="object-contain p-1"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mt-1 px-1">
                <span className="text-[#e7c574] block font-semibold mb-0.5">FILE_REF: AC_DAY_01</span>
                Agrom City dikey mimari ve sokak panoraması. Altın işlemeli spayrlar ve siber sancaklar görünür durumdadır.
              </div>
            </div>

            {/* Aerial city viewport */}
            <div className="relative border border-border/10 bg-black/40 rounded-lg overflow-hidden p-2 flex flex-col gap-2">
              <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-black/60">
                <Image
                  src={company.images.cityCenter}
                  alt="Agrom City aerial view"
                  fill
                  className="object-contain p-1"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mt-1 px-1">
                <span className="text-[#e7c574] block font-semibold mb-0.5">FILE_REF: AC_AERIAL_02</span>
                Merkez quantum sunucu kulesinin yörüngesel kalkan halkasıyla uydu kanallarından çekilmiş genel planı.
              </div>
            </div>

            {/* Brochure advertisement */}
            <div className="relative border border-border/10 bg-black/40 rounded-lg overflow-hidden p-2 flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
              <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-black/60">
                <Image
                  src={company.images.cityBrochure}
                  alt="Agrom City brochure"
                  fill
                  className="object-contain p-1"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mt-1 px-1">
                <span className="text-[#e7c574] block font-semibold mb-0.5">FILE_REF: AC_BROCHURE_03</span>
                "The future is here." - Corporate Union propaganda broşürü ve kentsel yaşam modülleri kılavuzu.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Expandable magazine cover layout for Agrom */}
      {company.id === "agrom" && company.images.magazine && (
        <details className="mt-6 border-t border-border/10 pt-6 group">
          <summary className={styles.classifiedSummary}>
            <div className={styles.classifiedLabel}>
              <span>📂 ACCESS SYSTEM OFFICIAL MAGAZINE COVER</span>
              <span className={styles.classifiedBadge}>YEAR_2303 / DEC_ARCHIVE</span>
            </div>
            <span className="font-mono text-xs group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="mt-4 flex justify-center bg-black/30 p-4 rounded-lg border border-border/5">
            <div className="relative w-full max-w-[480px] aspect-[1/1.5] rounded-md overflow-hidden border border-border/10 bg-black">
              <Image
                src={company.images.magazine}
                alt="System Magazine Cover"
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 100vw, 480px"
              />
            </div>
          </div>
        </details>
      )}

      {/* Classified notes block */}
      {company.classifiedNote && (
        <details className={styles.classifiedBlock}>
          <summary className={styles.classifiedSummary}>
            <div className={styles.classifiedLabel}>
              <span>📂 ACCESS CLASSIFIED INTELLIGENCE DOSSIER</span>
              <span className={`${styles.classifiedBadge} text-red-500 border-red-500/30`}>
                RESTRICTED / SPOILER_LOCKED
              </span>
            </div>
            <span className="font-mono text-xs group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className={styles.classifiedContent}>
            <span className="text-red-500 font-mono block mb-2">// RESTRICTED INTEL:</span>
            {company.classifiedNote}
          </div>
        </details>
      )}
    </article>
  );
}
