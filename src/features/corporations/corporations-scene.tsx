"use client";

import { useState } from "react";
import Image from "next/image";
import { type IohSceneHeaderUser } from "@/components/layout/ioh-scene-header";
import { IohSceneHeader } from "@/components/layout/ioh-scene-header";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { corporations } from "./corporations-data";
import { CorporateMap } from "./corporate-map";
import { CorporationsWebGL } from "./corporations-webgl";
import styles from "./corporations.module.css";

type CorporationsSceneProps = {
  user: IohSceneHeaderUser;
};

type ActiveTab = "overview" | "assets" | "relations" | "atlas";

export function CorporationsScene({ user }: CorporationsSceneProps) {
  const [selectedId, setSelectedId] = useState("agrom");
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  const activeCorp = corporations.find((c) => c.id === selectedId) || corporations[0];
  const indexStr = String(corporations.indexOf(activeCorp) + 1).padStart(2, "0");

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

      {/* Transparent Scene Header */}
      <IohSceneHeader user={user} />

      {/* Main Terminal Shell */}
      <main className={styles.shell}>
        
        {/* Hero title */}
        <section className={styles.hero}>
          <div className={styles.heroKicker}>
            <span className={styles.kickerDot} />
            <span>OPERATIONAL DATA LINK</span>
          </div>
          <h1 className={styles.heroTitle}>Corporate Union</h1>
          <p className={styles.heroLead}>
            Dünyanın enkazını satın alan oligarşiler. Swos ittifakına karşı System entegrasyonunun ekonomik ve askeri omurgası.
          </p>
        </section>

        {/* Coordinated Interactive GIS Map */}
        <section className="mb-10">
          <CorporateMap activeId={selectedId} onSelect={setSelectedId} />
        </section>

        {/* Split Console: Left List Menu vs Right Telemetry details */}
        <section className="grid gap-8 lg:grid-cols-[1.2fr_2fr] items-start mb-16 relative z-10">
          
          {/* LEFT: Oligarchy Directory Grid */}
          <div className="flex flex-col gap-3 max-h-[720px] overflow-y-auto pr-1">
            <span className="font-mono text-[9px] tracking-widest text-muted-foreground/60 block mb-1 uppercase">
              // SELECT COGNITIVE FILE
            </span>
            {corporations.map((corp, idx) => {
              const isSelected = corp.id === selectedId;
              return (
                <button
                  key={corp.id}
                  onClick={() => {
                    setSelectedId(corp.id);
                    setActiveTab("overview");
                  }}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-300 relative overflow-hidden flex gap-4 ${
                    isSelected
                      ? "bg-white/[0.03] border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.02)]"
                      : "bg-[#06080d]/60 border-white/5 hover:border-white/10"
                  }`}
                >
                  {/* Left accent color bar */}
                  <span
                    className="absolute left-0 top-0 bottom-0 w-[4px]"
                    style={{ backgroundColor: corp.accent }}
                  />

                  {/* Company indexing details */}
                  <div className="flex flex-col gap-1 w-full pl-2">
                    <div className="flex justify-between items-center w-full">
                      <span className="font-mono text-[9px] text-muted-foreground/50">
                        CU_0{idx + 1}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: corp.accent }} />
                    </div>
                    <div className="font-display font-medium text-sm text-paper tracking-wide">
                      {corp.displayName}
                    </div>
                    <div className="font-mono text-[9px] text-muted-foreground">
                      LEADER: {corp.leader}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT: Active Corporate Operations File Terminal */}
          <div
            className="relative border border-white/10 rounded-xl bg-[#06080d]/85 backdrop-blur-xl p-6 sm:p-8 flex flex-col gap-6"
            style={{ "--char-accent": activeCorp.accent } as React.CSSProperties}
          >
            {/* Corner styling elements */}
            <span className="absolute top-3 left-3 w-3 h-3 border-t border-l" style={{ borderColor: activeCorp.accent }} />
            <span className="absolute top-3 right-3 w-3 h-3 border-t border-r" style={{ borderColor: activeCorp.accent }} />
            <span className="absolute bottom-3 left-3 w-3 h-3 border-b border-l" style={{ borderColor: activeCorp.accent }} />
            <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r" style={{ borderColor: activeCorp.accent }} />

            {/* Active Header */}
            <div className="border-b border-white/10 pb-4 flex flex-wrap justify-between items-start gap-4">
              <div>
                <span className="font-mono text-[10px] tracking-widest block uppercase" style={{ color: activeCorp.accent }}>
                  FILE_REF: CU_0{corporations.indexOf(activeCorp) + 1} / {activeCorp.cityName.toUpperCase()}
                </span>
                <h2 className="font-display font-medium text-2xl text-paper mt-1 uppercase">
                  {activeCorp.name}
                </h2>
                <span className="font-mono text-[10px] text-muted-foreground block mt-0.5">
                  LEADER: {activeCorp.leader.toUpperCase()} ({activeCorp.leaderTitle.toUpperCase()})
                </span>
              </div>
            </div>

            {/* Sub-Tabbed menu within Terminal */}
            <div className="flex border-b border-white/5 font-mono text-[10px] tracking-wider select-none gap-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-2 px-1 border-b-2 transition-all ${
                  activeTab === "overview" ? "border-white text-paper" : "border-transparent text-muted-foreground/60 hover:text-paper"
                }`}
              >
                01_OVERVIEW
              </button>
              <button
                onClick={() => setActiveTab("assets")}
                className={`pb-2 px-1 border-b-2 transition-all ${
                  activeTab === "assets" ? "border-white text-paper" : "border-transparent text-muted-foreground/60 hover:text-paper"
                }`}
              >
                02_ASSETS_MATRIX
              </button>
              <button
                onClick={() => setActiveTab("relations")}
                className={`pb-2 px-1 border-b-2 transition-all ${
                  activeTab === "relations" ? "border-white text-paper" : "border-transparent text-muted-foreground/60 hover:text-paper"
                }`}
              >
                03_ALLIANCES_SPOILERS
              </button>
              {activeCorp.id === "agrom" && activeCorp.images.cityDay && (
                <button
                  onClick={() => setActiveTab("atlas")}
                  className={`pb-2 px-1 border-b-2 transition-all ${
                    activeTab === "atlas" ? "border-white text-paper" : "border-transparent text-muted-foreground/60 hover:text-paper"
                  }`}
                >
                  04_CITY_ATLAS
                </button>
              )}
            </div>

            {/* TAB CONTENT 1: Overview */}
            {activeTab === "overview" && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <blockquote className="border-l-2 pl-4 italic font-serif text-sm text-paper" style={{ borderColor: activeCorp.accent }}>
                  "{activeCorp.tagline}"
                </blockquote>

                {/* Split profile block */}
                <div className="grid gap-6 md:grid-cols-[1fr_1.5fr] items-start">
                  <div className="relative aspect-square w-full rounded border border-white/5 overflow-hidden bg-black/60">
                    <Image
                      src={activeCorp.images.portrait}
                      alt={activeCorp.leader}
                      fill
                      className="object-cover contrast-105"
                      sizes="300px"
                      priority
                    />
                  </div>
                  <div className="flex flex-col gap-4 font-mono text-xs text-muted-foreground">
                    <div>
                      <span className="text-paper block font-semibold mb-1 uppercase">// COGNITIVE OVERVIEW:</span>
                      <p className="leading-relaxed text-[11px] font-sans">{activeCorp.overview}</p>
                    </div>
                    <div>
                      <span className="text-paper block font-semibold mb-1 uppercase">// SYSTEM ROLE:</span>
                      <p className="leading-relaxed text-[11px] font-sans">{activeCorp.systemRole}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: Assets & Influence matrix */}
            {activeTab === "assets" && (
              <div className="grid gap-8 md:grid-cols-2 animate-fadeIn">
                {/* Assets list */}
                <div>
                  <span className="font-mono text-[9px] tracking-widest text-muted-foreground block mb-4 uppercase">
                    // KEY CONGLOMERATE ASSETS
                  </span>
                  <div className="flex flex-col gap-4">
                    {activeCorp.assets.map((asset, aIdx) => (
                      <div key={aIdx} className="border-l border-white/10 pl-3">
                        <h4 className="font-mono text-xs font-semibold text-paper">◆ {asset.name}</h4>
                        <p className="text-[10px] text-muted-foreground leading-normal mt-1">{asset.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Influence levels */}
                <div>
                  <span className="font-mono text-[9px] tracking-widest text-muted-foreground block mb-4 uppercase">
                    // STRATEGIC INFLUENCE SCORES
                  </span>
                  <div className="flex flex-col gap-3 font-mono text-[9px]">
                    {Object.entries(activeCorp.influence).map(([key, val]) => (
                      <div key={key} className="flex flex-col gap-1">
                        <div className="flex justify-between text-muted-foreground">
                          <span>{key.toUpperCase()}</span>
                          <span style={{ color: activeCorp.accent }}>{val}/10</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${val * 10}%`,
                              backgroundColor: activeCorp.accent
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: Relations and Classified Notes */}
            {activeTab === "relations" && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                {/* Relations details */}
                {activeCorp.relations.length > 0 && (
                  <div>
                    <span className="font-mono text-[9px] tracking-widest text-muted-foreground block mb-3 uppercase">
                      // DIRECT CORPORATE INTERACTIONS
                    </span>
                    <div className="flex flex-col gap-4">
                      {activeCorp.relations.map((rel, rIdx) => (
                        <div key={rIdx} className="border-l-2 pl-3 text-xs" style={{ borderColor: activeCorp.accent }}>
                          <span className="font-mono text-[9px] text-paper block">
                            TO: {rel.target.toUpperCase()} | RELATION TYPE: {rel.type.toUpperCase()}
                          </span>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{rel.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Classification pill cloud */}
                <div>
                  <span className="font-mono text-[9px] tracking-widest text-muted-foreground block mb-2 uppercase">
                    // DATA MATRIX CLASSIFICATION
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeCorp.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="font-mono text-[9px] px-2.5 py-0.5 rounded border border-white/5 bg-white/[0.02] text-muted-foreground uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Restricted Classified spoilers notes */}
                {activeCorp.classifiedNote && (
                  <div className="border-t border-white/5 pt-4 mt-2">
                    <span className="font-mono text-[9px] tracking-widest text-red-500 block mb-2 uppercase">
                      // RESTRICTED INTELLIGENCE BLOCK (SPOILER)
                    </span>
                    <p className="font-mono text-[10px] text-muted-foreground italic bg-red-950/5 border border-red-900/10 p-4 rounded leading-relaxed">
                      <span className="text-red-500 block font-semibold mb-1 uppercase">// ALERT:</span>
                      {activeCorp.classifiedNote}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 4: City Atlas images (Exclusive for Agrom) */}
            {activeTab === "atlas" && activeCorp.id === "agrom" && activeCorp.images.cityDay && (
              <div className="flex flex-col gap-6 animate-fadeIn">
                <span className="font-mono text-[9px] tracking-widest text-muted-foreground block uppercase">
                  // ATMOSPHERIC CITY ARCHIVES
                </span>
                
                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="relative border border-white/5 bg-black/40 rounded p-2 flex flex-col gap-2">
                    <div className="relative w-full aspect-[4/3] rounded bg-black/60 overflow-hidden">
                      <Image
                        src={activeCorp.images.cityDay}
                        alt="Agrom City street"
                        fill
                        className="object-contain p-1"
                        sizes="250px"
                      />
                    </div>
                    <div className="font-mono text-[8px] text-muted-foreground px-1 leading-normal">
                      <span className="text-[#e7c574] block font-semibold mb-0.5">AC_DAY_01</span>
                      Sokak panoraması ve dikey kulelerin gün ışığındaki resmi görünümleri.
                    </div>
                  </div>

                  <div className="relative border border-white/5 bg-black/40 rounded p-2 flex flex-col gap-2">
                    <div className="relative w-full aspect-[4/3] rounded bg-black/60 overflow-hidden">
                      <Image
                        src={activeCorp.images.cityCenter}
                        alt="Agrom City center aerial"
                        fill
                        className="object-contain p-1"
                        sizes="250px"
                      />
                    </div>
                    <div className="font-mono text-[8px] text-muted-foreground px-1 leading-normal">
                      <span className="text-[#e7c574] block font-semibold mb-0.5">AC_AERIAL_02</span>
                      System'in kalbini besleyen ana server istasyonunun havadan plan görünümleri.
                    </div>
                  </div>

                  <div className="relative border border-white/5 bg-black/40 rounded p-2 flex flex-col gap-2">
                    <div className="relative w-full aspect-[4/3] rounded bg-black/60 overflow-hidden">
                      <Image
                        src={activeCorp.images.cityBrochure}
                        alt="Agrom City brochure advertisement"
                        fill
                        className="object-contain p-1"
                        sizes="250px"
                      />
                    </div>
                    <div className="font-mono text-[8px] text-muted-foreground px-1 leading-normal">
                      <span className="text-[#e7c574] block font-semibold mb-0.5">AC_BROCHURE_03</span>
                      "Harmony and technology" - Megacity yaşam entegrasyonu rehber görseli.
                    </div>
                  </div>
                </div>

                {/* System Magazine Cover */}
                {activeCorp.images.magazine && (
                  <div className="border-t border-white/5 pt-6 mt-2 flex flex-col gap-3">
                    <span className="font-mono text-[9px] tracking-widest text-muted-foreground block uppercase">
                      // SYSTEM MAGAZINE ARCHIVE
                    </span>
                    <div className="flex justify-center bg-black/40 p-4 rounded border border-white/10">
                      <div className="relative w-full max-w-[360px] aspect-[1/1.5] bg-black rounded overflow-hidden border border-white/10">
                        <Image
                          src={activeCorp.images.magazine}
                          alt="System Magazine Cover"
                          fill
                          className="object-contain p-2"
                          sizes="(max-width: 768px) 100vw, 360px"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </section>

      </main>

      {/* BooksIndexFooter */}
      <BooksIndexFooter context="encyclopedia" />
    </div>
  );
}
