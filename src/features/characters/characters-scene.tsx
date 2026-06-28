"use client";

import Link from "next/link";
import { type IohSceneHeaderUser } from "@/components/layout/ioh-scene-header";
import { IohSceneHeader } from "@/components/layout/ioh-scene-header";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { characters } from "./characters-data";
import { CharacterCard } from "./character-card";
import { CharactersWebGL } from "./characters-webgl";
import { TeamConsole } from "./team-console";
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
            Not forgotten within the System, but a suppressed threat. Five distinct fronts of the battlefield, code architecture, and human resilience.
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
            A cyber organization originating from diverse backgrounds, united to push the boundaries of the System.
          </p>
          
          <TeamConsole />
        </section>

      </main>

      <BooksIndexFooter context="encyclopedia" />
    </div>
  );
}
