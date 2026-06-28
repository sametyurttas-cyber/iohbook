"use client";

import Link from "next/link";
import { type IohSceneHeaderUser } from "@/components/layout/ioh-scene-header";
import { IohSceneHeader } from "@/components/layout/ioh-scene-header";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { characters } from "./characters-data";
import { CharacterCard } from "./character-card";
import { CharactersWebGL } from "./characters-webgl";
import styles from "./characters.module.css";

type CharactersSceneProps = {
  user: IohSceneHeaderUser;
};

export function CharactersScene({ user }: CharactersSceneProps) {
  return (
    <div className={styles.page}>
      <IohIndexStyles />
      <style
        dangerouslySetInnerHTML={{
          __html: "body{cursor:auto!important}a,button,[data-hover],[data-magnet]{cursor:pointer!important}"
        }}
      />

      {/* fixed full-page WebGL canvas background */}
      <CharactersWebGL />

      {/* Transparent Scene Header */}
      <IohSceneHeader user={user} />

      <main className={styles.shell}>
        
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.kickerWrapper}>
            <span className={styles.statusDot} />
            <span className={styles.kicker}>GODCODE / ENCRYPTED DOSSIERS</span>
          </div>
          <h1 className={styles.heroTitle}>THE TEAM</h1>
          <p className={styles.heroLead}>
            System içinde unutulmuş değil; bastırılmış bir tehdit. Savaş alanının, kod mimarisinin ve insan direncinin beş farklı cephesi.
          </p>
        </section>

        {/* Vertically Stacked Character Profiles */}
        <section className={styles.cardsContainer}>
          {characters.map((char, index) => (
            <CharacterCard
              key={char.id}
              character={char}
              index={index}
            />
          ))}
        </section>

        {/* Team Overview section with Particle silhouettes */}
        <section className={styles.teamOverviewSection}>
          <span className={styles.overviewKicker}>TACTICAL ALLIANCE SCAN</span>
          <h2 className={styles.overviewTitle}>Five Minds. One System. No Exit.</h2>
          <p className={styles.overviewDesc}>
            Farklı geçmişlerden gelen, ancak System'in sınırlarını zorlamak için bir araya gelmiş siber organizasyon.
          </p>
          
          <div className={styles.silhouetteBox}>
            <div className={styles.silhouetteGrid} />
            <div className={styles.silhouetteGlow} />
            
            {/* High-tech abstract SVG vector visualizing 5 standing team figures */}
            <svg
              viewBox="0 0 600 240"
              className={styles.silhouetteVector}
              fill="none"
              stroke="var(--ch-gold)"
              strokeWidth="1.5"
            >
              {/* Ground grids */}
              <line x1="50" y1="200" x2="550" y2="200" strokeOpacity="0.4" />
              <line x1="50" y1="200" x2="300" y2="120" strokeOpacity="0.1" />
              <line x1="550" y1="200" x2="300" y2="120" strokeOpacity="0.1" />

              {/* 5 standing abstract figures */}
              {/* Figure 1 - Algus (Center) */}
              <g stroke="#e7c574" strokeOpacity="0.8">
                <circle cx="300" cy="90" r="10" />
                <line x1="300" y1="100" x2="300" y2="170" />
                <line x1="300" y1="120" x2="280" y2="150" />
                <line x1="300" y1="120" x2="320" y2="150" />
                <line x1="300" y1="170" x2="285" y2="200" />
                <line x1="300" y1="170" x2="315" y2="200" />
              </g>

              {/* Figure 2 - Mina (Left Center) */}
              <g stroke="#ff5b7f" strokeOpacity="0.7">
                <circle cx="230" cy="100" r="8" />
                <line x1="230" y1="108" x2="230" y2="170" />
                <line x1="230" y1="125" x2="215" y2="150" />
                <line x1="230" y1="125" x2="245" y2="145" />
                <line x1="230" y1="170" x2="220" y2="200" />
                <line x1="230" y1="170" x2="240" y2="200" />
              </g>

              {/* Figure 3 - Kevin (Right Center) */}
              <g stroke="#78c7ff" strokeOpacity="0.7">
                <circle cx="370" cy="100" r="9" />
                <line x1="370" y1="109" x2="370" y2="170" />
                <line x1="370" y1="125" x2="350" y2="145" />
                <line x1="370" y1="125" x2="385" y2="150" />
                <line x1="370" y1="170" x2="360" y2="200" />
                <line x1="370" y1="170" x2="380" y2="200" />
              </g>

              {/* Figure 4 - Mike (Left Outer) */}
              <g stroke="#6f9bff" strokeOpacity="0.6">
                <circle cx="160" cy="110" r="8" />
                <line x1="160" y1="118" x2="160" y2="170" />
                <line x1="160" y1="130" x2="145" y2="155" />
                <line x1="160" y1="130" x2="175" y2="150" />
                <line x1="160" y1="170" x2="150" y2="200" />
                <line x1="160" y1="170" x2="170" y2="200" />
              </g>

              {/* Figure 5 - Elia (Right Outer) */}
              <g stroke="#65e6df" strokeOpacity="0.6">
                <circle cx="440" cy="110" r="8" />
                <line x1="440" y1="118" x2="440" y2="170" />
                <line x1="440" y1="130" x2="425" y2="150" />
                <line x1="440" y1="130" x2="455" y2="155" />
                <line x1="440" y1="170" x2="430" y2="200" />
                <line x1="440" y1="170" x2="450" y2="200" />
              </g>

              {/* Scanning crosshairs overlays */}
              <path d="M 280,70 L 320,70" strokeOpacity="0.3" />
              <path d="M 300,50 L 300,90" strokeOpacity="0.3" />
              <rect x="270" y="40" width="60" height="150" strokeDasharray="3,3" strokeOpacity="0.2" />
            </svg>
            <div className={styles.silhouetteOverlay} />
          </div>
        </section>

      </main>

      <BooksIndexFooter context="encyclopedia" />
    </div>
  );
}
