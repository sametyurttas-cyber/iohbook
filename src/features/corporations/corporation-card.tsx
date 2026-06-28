"use client";

import { useState } from "react";
import Image from "next/image";
import { type CompanyProfile } from "./corporations-data";
import styles from "./corporations.module.css";

type CorporationCardProps = {
  company: CompanyProfile;
  index: number;
};

export function CorporationCard({ company, index }: CorporationCardProps) {
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const indexStr = String(index + 1).padStart(2, "0");

  // Determine the primary background image for the cinematic panel
  const backgroundImage = company.id === "agrom" && company.images.cityCenter
    ? company.images.cityCenter
    : company.images.portrait;

  return (
    <article
      id={company.id}
      className="relative flex flex-col w-full rounded-xl border border-border/10 overflow-hidden bg-[#07090f]/80 backdrop-blur-lg transition-all duration-500 hover:border-border/30"
      style={{ "--char-accent": company.accent } as React.CSSProperties}
    >
      {/* 4px top border color matching accent */}
      <div className="absolute top-0 left-0 w-full h-[3px]" style={{ backgroundColor: company.accent }} />

      {/* 1. Cinematic Background Image Panel */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/8] lg:aspect-[16/7] overflow-hidden flex flex-col justify-end p-6 sm:p-10 group">
        
        {/* Cinematic Image container */}
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
          <Image
            src={backgroundImage}
            alt={company.displayName}
            fill
            className="object-cover opacity-60 mix-blend-lighten contrast-125 filter grayscale-[20%]"
            priority={index < 2}
          />
        </div>

        {/* Ambient Dark/Color Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-[#05070a]/40 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070a]/80 via-transparent to-transparent z-10 pointer-events-none" />

        {/* Overlay Content */}
        <div className="relative z-20 flex flex-col gap-2 max-w-xl">
          <div className="font-mono text-xs tracking-widest uppercase" style={{ color: company.accent }}>
            {indexStr} / {company.name.split("/")[0].trim()}
          </div>
          <h2 className="font-display font-medium text-2xl sm:text-3xl text-paper tracking-tight uppercase">
            {company.leader}
          </h2>
          <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
            {company.coreBusiness}
          </div>
          <blockquote className="mt-2 text-xs sm:text-sm font-serif italic text-paper/90 border-l-2 pl-3" style={{ borderColor: company.accent }}>
            "{company.tagline}"
          </blockquote>

          {/* Interactive Button */}
          <div className="mt-4">
            <button
              onClick={() => setIsDossierOpen(!isDossierOpen)}
              className="font-mono text-[10px] tracking-widest uppercase border px-4 py-2 rounded transition-all duration-300 hover:bg-white/5 active:scale-95"
              style={{
                borderColor: company.accent,
                color: company.accent
              }}
            >
              {isDossierOpen ? "✕ CLOSE DOSSIER" : "📂 OPEN DOSSIER"}
            </button>
          </div>
        </div>

        {/* Cinematic frame corners */}
        <span className="absolute top-4 left-4 w-3.5 h-3.5 border-t border-l border-white/10" />
        <span className="absolute top-4 right-4 w-3.5 h-3.5 border-t border-r border-white/10" />
      </div>

      {/* 2. Under-Image Telemetry Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-border/10 bg-black/40 px-6 py-4 font-mono text-[10px] text-muted-foreground select-none">
        <div>
          <span className="block text-muted-foreground/50 text-[9px] mb-0.5">PRIMARY CITY</span>
          <span className="text-paper uppercase">{company.cityName}</span>
        </div>
        <div>
          <span className="block text-muted-foreground/50 text-[9px] mb-0.5">SECTOR DOMAIN</span>
          <span className="text-paper uppercase">{company.tags[2] || company.tags[0]}</span>
        </div>
        <div>
          <span className="block text-muted-foreground/50 text-[9px] mb-0.5">UNION STATUS</span>
          <span className="text-paper uppercase" style={{ color: company.accent }}>
            {company.id === "agrom" ? "FOUNDING CORE" : "OLIGARCH UNIT"}
          </span>
        </div>
        <div>
          <span className="block text-muted-foreground/50 text-[9px] mb-0.5">THREAT LEVEL</span>
          <span className={`font-semibold uppercase ${
            company.id === "social-media" ? "text-red-500 animate-pulse" : "text-[#e7c574]"
          }`}>
            {company.id === "social-media" ? "CRITICAL (SIEGED)" : "HIGH SECURITY"}
          </span>
        </div>
      </div>

      {/* 3. Interactive Slide-down/Fade Drawer for Details */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isDossierOpen ? "max-h-[2000px] border-t border-border/10 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 sm:p-10 bg-black/60 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Column 1: Core Assets */}
          <div>
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground/60 block mb-4 uppercase">
              // CORE SYSTEM ASSETS
            </span>
            <div className="flex flex-col gap-4">
              {company.assets.map((asset, aIdx) => (
                <div key={aIdx} className="border-l border-white/10 pl-3">
                  <h4 className="font-mono text-xs font-semibold text-paper">◆ {asset.name}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{asset.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Influence metrics & Alliances */}
          <div>
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground/60 block mb-4 uppercase">
              // INFLUENCE METRICS
            </span>
            <div className="flex flex-col gap-3">
              {Object.entries(company.influence).map(([key, val]) => (
                <div key={key} className="flex flex-col gap-1 font-mono text-[10px]">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{key.toUpperCase()}</span>
                    <span style={{ color: company.accent }}>{val}/10</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: isDossierOpen ? `${val * 10}%` : "0%",
                        backgroundColor: company.accent
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Relations */}
            {company.relations.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <span className="font-mono text-[10px] tracking-widest text-muted-foreground/60 block mb-3 uppercase">
                  // ALLIANCES & HOSTILITIES
                </span>
                <div className="flex flex-col gap-3">
                  {company.relations.map((rel, rIdx) => (
                    <div key={rIdx} className="border-l-2 pl-3 text-[11px]" style={{ borderColor: company.accent }}>
                      <span className="font-mono text-[10px] text-paper block">
                        TO: {rel.target.toUpperCase()} ({rel.type.toUpperCase()})
                      </span>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">{rel.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Corporate Summary / Leader Info */}
          <div className="flex flex-col gap-4">
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground/60 block uppercase">
              // PROFILE ANALYSIS
            </span>
            <div className="relative aspect-video w-full rounded border border-border/10 overflow-hidden bg-black">
              <Image
                src={company.images.portrait}
                alt={company.leader}
                fill
                className="object-cover"
                sizes="350px"
              />
            </div>
            <div className="font-mono text-[10px] text-muted-foreground leading-relaxed">
              <span className="text-paper block font-semibold mb-1 uppercase">// SYSTEM ROLE:</span>
              {company.systemRole}
            </div>

            {/* Tags badging */}
            <div className="flex flex-wrap gap-2 mt-2">
              {company.tags.map((tag, tIdx) => (
                <span key={tIdx} className="font-mono text-[9px] px-2 py-0.5 rounded border border-white/5 bg-white/[0.02] text-muted-foreground uppercase">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Core photo atlas grid for Agrom */}
          {company.id === "agrom" && company.images.cityDay && (
            <div className="md:col-span-2 lg:col-span-3 mt-4 pt-6 border-t border-white/5">
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground/60 block mb-4 uppercase">
                // AGROM CITY SECTOR PHOTOGRAPHY
              </span>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="relative border border-border/10 bg-black/40 rounded p-2 flex flex-col gap-2">
                  <div className="relative w-full aspect-[4/3] rounded bg-black/60 overflow-hidden">
                    <Image
                      src={company.images.cityDay}
                      alt="Agrom City street day view"
                      fill
                      className="object-contain p-1"
                      sizes="300px"
                    />
                  </div>
                  <div className="font-mono text-[9px] text-muted-foreground px-1">
                    <span className="text-[#e7c574] block font-semibold mb-0.5">AC_DAY_01</span>
                    Dikey mimari ve sokak panoraması. Altın işlemeli spayrlar ve siber sancaklar görünür durumdadır.
                  </div>
                </div>

                <div className="relative border border-border/10 bg-black/40 rounded p-2 flex flex-col gap-2">
                  <div className="relative w-full aspect-[4/3] rounded bg-black/60 overflow-hidden">
                    <Image
                      src={company.images.cityCenter}
                      alt="Agrom City center aerial"
                      fill
                      className="object-contain p-1"
                      sizes="300px"
                    />
                  </div>
                  <div className="font-mono text-[9px] text-muted-foreground px-1">
                    <span className="text-[#e7c574] block font-semibold mb-0.5">AC_AERIAL_02</span>
                    Merkez sunucu kulesinin yörüngesel kalkan halkasıyla çekilmiş genel telemetri planı.
                  </div>
                </div>

                <div className="relative border border-border/10 bg-black/40 rounded p-2 flex flex-col gap-2">
                  <div className="relative w-full aspect-[4/3] rounded bg-black/60 overflow-hidden">
                    <Image
                      src={company.images.cityBrochure}
                      alt="Agrom City brochure ad"
                      fill
                      className="object-contain p-1"
                      sizes="300px"
                    />
                  </div>
                  <div className="font-mono text-[9px] text-muted-foreground px-1">
                    <span className="text-[#e7c574] block font-semibold mb-0.5">AC_BROCHURE_03</span>
                    "The future is here." - Corporate Union propaganda broşürü ve kentsel yaşam modülleri.
                  </div>
                </div>
              </div>

              {/* Magazine cover detail */}
              {company.images.magazine && (
                <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-3">
                  <span className="font-mono text-[10px] tracking-widest text-muted-foreground/60 block uppercase">
                    // SYSTEM MAGAZINE ARCHIVE
                  </span>
                  <div className="flex justify-center bg-black/40 p-4 rounded border border-border/10">
                    <div className="relative w-full max-w-[420px] aspect-[1/1.5] bg-black rounded overflow-hidden border border-border/10">
                      <Image
                        src={company.images.magazine}
                        alt="System Magazine Cover"
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 100vw, 420px"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Classified Spoilers Notes */}
          {company.classifiedNote && (
            <div className="md:col-span-2 lg:col-span-3 mt-4 pt-6 border-t border-white/5">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none font-mono text-[10px] tracking-widest text-red-400 select-none">
                  <div className="flex items-center gap-2">
                    <span>📂 ACCESS CLASSIFIED INTELLIGENCE DOSSIER</span>
                    <span className="text-[8px] border border-red-500/40 px-1 rounded bg-black">
                      RESTRICTED / SPOILER_LOCKED
                    </span>
                  </div>
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-3 font-mono text-xs italic leading-relaxed text-muted-foreground bg-red-950/10 border border-red-900/10 p-4 rounded">
                  <span className="text-red-500 font-semibold block mb-1">// RESTRICTED DATABASE ENTRY:</span>
                  {company.classifiedNote}
                </div>
              </details>
            </div>
          )}

        </div>
      </div>
    </article>
  );
}
