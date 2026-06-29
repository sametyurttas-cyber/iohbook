"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { CharacterProfile } from "./characters-data";
import { CharacterRadar } from "./character-radar";
import styles from "./characters.module.css";

type CharacterCardProps = {
  character: CharacterProfile;
  index: number;
};

export function CharacterCard({ character, index }: CharacterCardProps) {
  const cardStyle = {
    "--char-accent": character.accent
  } as CSSProperties;

  return (
    <article
      className={styles.card}
      style={cardStyle}
      id={character.id}
    >
      <div className={styles.cardBorderTop} />
      
      {/* 1. Header Metadata Section */}
      <div className={styles.cardHeader}>
        <div className={styles.headerMain}>
          <h2 className={styles.charName}>{character.name}</h2>
          <span className={styles.charRole}>{character.role}</span>
        </div>
        <div className={styles.headerMeta}>
          <div className={styles.statusIndicator}>
            <span className={styles.statusDotPulse} />
            <span>STATUS: ACTIVE RECORD</span>
          </div>
          <span>FILE_REF: IOH-CHAR-00{index + 1}</span>
          <span>SECTOR: DIGITAL_CORE</span>
        </div>
      </div>

      {/* 2. Core Profile Layout Grid */}
      <div className={styles.cardBodyGrid}>
        
        {/* Left Side: Grayscale notched portrait */}
        <div className={styles.portraitWrapper}>
          <span className={`${styles.notch} ${styles.notchTL}`} />
          <span className={`${styles.notch} ${styles.notchTR}`} />
          <span className={`${styles.notch} ${styles.notchBL}`} />
          <span className={`${styles.notch} ${styles.notchBR}`} />
          
          <Image
            src={character.image}
            alt={`${character.name} portrait`}
            fill
            className={styles.portraitImage}
            sizes="(max-width: 768px) 100vw, 280px"
            priority={index === 0}
          />
          <div className={styles.portraitOverlay} aria-hidden="true" />
        </div>

        {/* Right Side: Identity information and capabilities */}
        <div className={styles.infoColumn}>
          <p className={styles.tagline}>// {character.tagline}</p>
          <p className={styles.bio}>{character.bio}</p>

          {/* Capabilities Grid */}
          <div className={styles.powersContainer}>
            <span className={styles.sectionLabel}>SYSTEM CAPABILITIES</span>
            <div className={styles.powersList}>
              {character.powers.map((power, idx) => (
                <div key={idx} className={styles.powerItem}>
                  <div className={styles.powerTitleRow}>
                    <span className={styles.powerMarker}>◆</span>
                    <span>{power.name}</span>
                  </div>
                  <p className={styles.powerDesc}>{power.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Lower Data Block (Weakness + Stats Radar + Tags) */}
      <div className={styles.lowerGrid}>
        
        {/* Weaknesses List */}
        <div className={styles.weaknessList}>
          <span className={styles.sectionLabel}>CRITICAL ANOMALIES</span>
          {character.weaknesses.map((weakness, idx) => (
            <div key={idx} className={styles.weaknessItem}>
              <span className={styles.weaknessMarker}>△</span>
              <p style={{ margin: 0 }}>{weakness}</p>
            </div>
          ))}
        </div>

        {/* Radar Chart Visualizer */}
        <div>
          <span className={styles.sectionLabel} style={{ textAlign: "center" }}>TELEMETRY RADAR</span>
          <CharacterRadar stats={character.stats} accentColor={character.accent} />
        </div>

        {/* Tags cloud */}
        <div className={styles.tagsCloud}>
          <span className={styles.sectionLabel} style={{ width: "100%" }}>CLASSIFICATION TAGS</span>
          {character.tags.map((tag, idx) => (
            <span key={idx} className={styles.tagPill}>
              {tag.toUpperCase()}
            </span>
          ))}
        </div>

        {/* 4. Poster Visual Archive details */}
        {character.posterImage && (
          <div className={`${styles.posterBlock} w-full`}>
            <details className={`${styles.posterToggle} max-w-[280px] md:max-w-none mx-auto w-full`}>
              <summary className="list-none outline-none focus:outline-none cursor-pointer p-0 bg-transparent block [&::-webkit-details-marker]:hidden">
                <div className={`${styles.posterSummary} flex flex-row items-center justify-between p-4 md:px-6 md:py-4 w-full`}>
                  <div className={`${styles.summaryLabel} flex flex-wrap gap-2 items-center min-w-0 flex-1`}>
                    <span className="font-mono text-[0.6rem] md:text-[0.72rem] tracking-normal md:tracking-[0.15em] whitespace-normal break-words leading-relaxed">
                      [▼] ACCESS NEXUS ARCHIVE (MAGAZINE)
                    </span>
                  </div>
                  <span className={styles.posterStatus}>DECRYPTED</span>
                </div>
              </summary>
              <div className={styles.posterContent} style={{ padding: "1rem" }}>
                <div className={`${styles.posterImageWrapper} w-full`}>
                  <Image
                    src={character.posterImage}
                    alt={`${character.name} database poster`}
                    fill
                    className={styles.posterImg}
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              </div>
            </details>
          </div>
        )}

        {/* 5. Classified Details Spoiler */}
        <div className={`${styles.classifiedBlock} w-full`}>
          <details className={`${styles.classifiedToggle} max-w-[280px] md:max-w-none mx-auto w-full`}>
            <summary className="list-none outline-none focus:outline-none cursor-pointer p-0 bg-transparent block [&::-webkit-details-marker]:hidden">
              <div className={`${styles.classifiedSummary} flex flex-row items-center justify-between p-4 md:px-6 md:py-4 w-full`}>
                <div className={`${styles.summaryLabel} flex flex-wrap gap-2 items-center min-w-0 flex-1`}>
                  <span className="font-mono text-[0.6rem] md:text-[0.72rem] tracking-normal md:tracking-[0.15em] whitespace-normal break-words leading-relaxed">
                    [▼] ACCESS CLASSIFIED REVELATIONS
                  </span>
                </div>
                <span className={styles.summaryStatus}>ENCRYPTED / SPOILER_LOCKED</span>
              </div>
            </summary>
            <div className={styles.classifiedContent}>
              <p style={{ margin: 0, fontStyle: "italic", color: "rgba(242, 239, 232, 0.5)" }}>
                // RECORD SHIELDED: Detailed lore developments and storyline plot points (spoilers) will be decrypted once submitted to the network by the author.
              </p>
            </div>
          </details>
        </div>

      </div>

    </article>
  );
}
