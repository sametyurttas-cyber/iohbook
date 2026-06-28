"use client";

import { type IohSceneHeaderUser } from "@/components/layout/ioh-scene-header";
import { IohSceneHeader } from "@/components/layout/ioh-scene-header";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { corporations } from "./corporations-data";
import { CorporationCard } from "./corporation-card";
import { CorporateMap } from "./corporate-map";
import { CorporationsWebGL } from "./corporations-webgl";
import styles from "./corporations.module.css";

type CorporationsSceneProps = {
  user: IohSceneHeaderUser;
};

export function CorporationsScene({ user }: CorporationsSceneProps) {
  return (
    <div className={styles.page}>
      <IohIndexStyles />
      <style
        dangerouslySetInnerHTML={{
          __html: "body{cursor:auto!important}a,button,[data-hover],[data-magnet]{cursor:pointer!important}"
        }}
      />

      {/* WebGL Matrix Background */}
      <CorporationsWebGL />

      {/* Scene Header */}
      <IohSceneHeader user={user} />

      {/* Main Container */}
      <main className={styles.shell}>
        
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroKicker}>
            <span className={styles.kickerDot} />
            <span>CORPORATE UNION / ARCHIVE</span>
          </div>
          <h1 className={styles.heroTitle}>The Oligarchies</h1>
          <p className={styles.heroLead}>
            After the collapse of states, corporations did not simply survive. They became borders, currencies, armies, cities, and gods.
          </p>
        </section>

        {/* Interactive GIS Network Map */}
        <section className={styles.mapSection}>
          <span className={styles.mapKicker}>ARCHIVE 03 / GEOGRAPHIC TELEMETRY</span>
          <h2 className={styles.mapTitle}>Corporate Union Grid Map</h2>
          <p className={styles.mapDesc}>
            Oligarşilerin kontrolündeki megacityler, enerji reaktörleri ve yeraltı maden şehirlerini bağlayan siber yolların canlı veri akış şeması.
          </p>
          <CorporateMap />
        </section>

        {/* Company Dossiers Grid */}
        <section className={styles.cardsContainer}>
          {corporations.map((corp, index) => (
            <CorporationCard key={corp.id} company={corp} index={index} />
          ))}
        </section>

      </main>

      {/* Footer */}
      <BooksIndexFooter context="encyclopedia" />
    </div>
  );
}
