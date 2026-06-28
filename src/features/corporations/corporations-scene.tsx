"use client";

import { useState } from "react";
import Image from "next/image";
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
  const [activeLightbox, setActiveLightbox] = useState<string | null>(null);

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
          <CorporateMap activeId="agrom" onSelect={() => {}} />
        </section>

        {/* Corporate Union Section Header */}
        <section className={styles.unionHeaderSection}>
          <span className={styles.mapKicker}>ARCHIVE 04 / CONGLOMERATE INDEX</span>
          <h2 className={styles.mapTitle}>Corporate Union</h2>
          <p className={styles.mapDesc}>
            System'i yöneten, sınırları ve yasaları belirleyen beş büyük oligarşik holdingin gizli dosyaları ve bölgesel güç dengeleri.
          </p>
        </section>

        {/* Company Dossiers Grid */}
        <section className={styles.cardsContainer} style={{ marginTop: "1rem" }}>
          {corporations.map((corp, index) => (
            <CorporationCard 
              key={corp.id} 
              company={corp} 
              index={index} 
              onZoom={setActiveLightbox}
            />
          ))}
        </section>

        {/* Outro - What is the Corporate Union? */}
        <section className={styles.unionExplainerSection}>
          <div className={styles.explainerGrid}>
            <div className={styles.explainerTextContainer}>
              <div className={styles.explainerKicker}>
                <span className={styles.kickerDotRed} />
                <span>EXECUTIVE ANALYSIS / CLASSIFIED OVERVIEW</span>
              </div>
              <h2 className={styles.explainerTitle}>Şirketler Birliği Nedir?</h2>
              
              <p className={styles.explainerParagraph}>
                Şirketler Birliği, devletlerin zayıfladığı, ekonomilerin çöktüğü ve insanlığın güvenlik arayışı içinde kendi özgürlüğünden vazgeçmeye başladığı dönemde ortaya çıkan yeni güç düzenidir.
              </p>
              
              <p className={styles.explainerParagraph}>
                Bu yapı, yalnızca şirketlerin bir araya gelmesi değildir. Şirketler Birliği; şehirleri yöneten, enerji akışını kontrol eden, medyayı şekillendiren, dijital para sistemlerini işleten, lojistik ağları yöneten ve System’in teknolojik omurgasını elinde tutan kurumsal bir iktidar biçimidir.
              </p>
              
              <div className={styles.explainerQuotes}>
                <p><strong>Agrom Technology</strong> geleceği inşa eder.</p>
                <p><strong>Nets</strong> insanların ne gördüğünü ve neye inandığını şekillendirir.</p>
                <p><strong>Tencon</strong> savaşı oyuna, oyunu savaşa dönüştürür.</p>
                <p><strong>Qualty Energy</strong> şehirlerin ışığını kimin alacağına karar verir.</p>
                <p><strong>Ubless</strong> dünyanın hareket etmesini sağlar.</p>
                <p><strong>Social Media</strong> hakikatin değil, inancın hızını yönetir.</p>
                <p><strong>Miner Henry</strong> ise dijital ekonominin derinlerinde, altının ve verinin karanlık damarlarını işletir.</p>
              </div>

              <div className={styles.explainerHighlightBox}>
                <p className="font-mono text-xs text-[#ff1e27] mb-1">// SYSTEM COGNITIVE PROTOCOL</p>
                <p className="text-sm italic">
                  "Şirketler Birliği’nin vaadi düzendir. Bedeli ise kontroldür."
                </p>
              </div>

              <p className={styles.explainerParagraph}>
                Bu evrende şirketler artık yalnızca ürün satmaz. Sınır çizer, şehir kurar, hafıza saklar, para üretir, savaş yönetir ve insanlığın geleceğine yön verir.
              </p>

              <p className={styles.explainerParagraph}>
                Devletlerin çöktüğü yerde şirketler yükselmiştir. Ve yükseldikleri yerde hiçbir şey artık masum değildir.
              </p>
            </div>
            
            <div className={styles.explainerImageWrapper}>
              <div 
                className={`${styles.explainerImageContainer} cursor-zoom-in`}
                onClick={() => setActiveLightbox("/media/corporations/corporate-union-board.png")}
              >
                <Image
                  src="/media/corporations/corporate-union-board.png"
                  alt="Corporate Union Board Room meeting of the oligarchy"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 500px"
                  unoptimized
                />
                <div className={styles.imageOverlay} />
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mt-3 flex justify-between px-1">
                <span>SEC_FILE // CLASSIFIED_MEETING_2303</span>
                <span>STATUS: ACTIVE DIRECTIVE</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <BooksIndexFooter context="encyclopedia" />

      {/* Global Lightbox Modal Viewport Overlay (Immune to parent CSS transforms) */}
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
              alt="Telemetry Viewport Zoomed"
              fill
              className="object-contain"
              sizes="90vw"
              priority
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}
