"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./characters.module.css";

type TeamFile = {
  id: string;
  label: string;
  title: string;
  image: string;
  description: string;
  metadata: {
    operation: string;
    clearance: string;
    threat: string;
    sector: string;
  };
};

const teamFiles: TeamFile[] = [
  {
    id: "strategy",
    label: "FILE_01 / STRATEGY",
    title: "WAR ROOM COGNITIVE STRATEGY",
    image: "/media/characters/team-strategy.jpg",
    description: "Saha operasyonu öncesi IOH System karargah planları üzerinde taktik koordinasyon analizi.",
    metadata: {
      operation: "NIGHTFALL",
      clearance: "OMEGA",
      threat: "LEVEL_4",
      sector: "MAIN_HQ_GRID"
    }
  },
  {
    id: "dossier",
    label: "FILE_02 / CORE TEAM",
    title: "TEAM INTEGRATION MATRIX",
    image: "/media/characters/team-dossier.jpg",
    description: "Beş zihnin siber ağlardaki uyum, ego senkronizasyonu ve sızma parametrelerinin genel analizi.",
    metadata: {
      operation: "GENESIS_REB",
      clearance: "OMEGA",
      threat: "CRITICAL",
      sector: "INTEGRATION_CORE"
    }
  },
  {
    id: "battle",
    label: "FILE_03 / TELEMETRY",
    title: "FIELD COMBAT RECORDS",
    image: "/media/characters/team-battle.jpg",
    description: "CISA siber birlikleri, ağır mecha savunma üniteleri ve şehir sektörü taarruz kayıtları.",
    metadata: {
      operation: "STREET_SWEEP",
      clearance: "RESTRICTED",
      threat: "EXTREME",
      sector: "SECTOR_09_WAR"
    }
  },
  {
    id: "orbital",
    label: "FILE_04 / ORBITAL",
    title: "ORBITAL DEFENSE SHIELD",
    image: "/media/characters/team-orbital.jpg",
    description: "Uzay istasyonları, orbital lazer savunma uyduları ve küresel siber kalkan veritabanı logları.",
    metadata: {
      operation: "SKY_SHIELD",
      clearance: "OMEGA",
      threat: "EXTREME",
      sector: "IONOSPHERE_GRID"
    }
  }
];

export function TeamConsole() {
  const [activeId, setActiveId] = useState("strategy");
  const activeFile = teamFiles.find((f) => f.id === activeId) || teamFiles[0];

  return (
    <div className="w-full mt-10 rounded-xl border border-border/40 bg-black/60 backdrop-blur-md p-6 lg:p-8">
      {/* High-tech Title header */}
      <div className="flex flex-wrap justify-between items-center border-b border-border/10 pb-4 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e7c574] animate-pulse" />
          <h3 className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            IOH NETWORK / TACTICAL WAR ROOM ARCHIVES
          </h3>
        </div>
        <div className="font-mono text-[10px] text-[#e7c574] tracking-widest">
          STATUS: ONLINE_GRID_DECRYPTED
        </div>
      </div>

      {/* Main Grid: Left Console Sidebar & Right Massive Interactive Viewer */}
      <div className="grid gap-6 lg:grid-cols-[1fr_2.5fr] items-start">
        
        {/* Left Console: Tab toggles */}
        <div className="flex flex-col gap-3">
          {teamFiles.map((file) => {
            const isActive = file.id === activeId;
            return (
              <button
                key={file.id}
                onClick={() => setActiveId(file.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-300 ${
                  isActive
                    ? "border-[#e7c574] bg-[#e7c574]/[0.03] text-paper"
                    : "border-border/10 bg-black/20 hover:border-border/30 text-muted-foreground"
                }`}
              >
                <div className="font-mono text-[10px] tracking-wider text-[#e7c574] mb-1">
                  {file.label}
                </div>
                <div className="font-display font-medium text-sm">
                  {file.title}
                </div>
              </button>
            );
          })}

          {/* Active File details */}
          <div className="mt-4 border-t border-border/10 pt-4 font-mono text-[11px] text-muted-foreground leading-relaxed">
            <span className="text-[#e7c574] block mb-2 uppercase">// DECRYPTED CAPTION:</span>
            {activeFile.description}
          </div>
        </div>

        {/* Right Console: Massive Interactive Viewer */}
        <div className="relative border border-[#e7c574]/20 rounded-lg overflow-hidden bg-[#030407] p-3 flex flex-col gap-4">
          
          {/* Cyberpunk notches */}
          <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#e7c574]" />
          <span className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#e7c574]" />
          <span className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#e7c574]" />
          <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#e7c574]" />

          {/* Active Image stage */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9.5] rounded-md overflow-hidden border border-border/10">
            <Image
              src={activeFile.image}
              alt={activeFile.title}
              fill
              className="object-cover transition-opacity duration-500 ease-in-out"
              sizes="(max-width: 1024px) 100vw, 800px"
              priority
            />
            {/* Grid interface scanline overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-4 left-4 font-mono text-[10px] text-paper/40 bg-black/60 px-2 py-1 rounded border border-border/10">
              RESOLUTION: 3840 x 2400 (4K)
            </div>
          </div>

          {/* Active File Telemetry details footer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-black/30 border border-border/10 p-3 rounded font-mono text-[10px] text-muted-foreground">
            <div>
              <span className="text-[#e7c574] block mb-1">OPERATION:</span>
              <span className="text-paper">{activeFile.metadata.operation}</span>
            </div>
            <div>
              <span className="text-[#e7c574] block mb-1">SEC_LEVEL:</span>
              <span className="text-paper">{activeFile.metadata.clearance}</span>
            </div>
            <div>
              <span className="text-[#e7c574] block mb-1">THREAT_METRIC:</span>
              <span className="text-paper">{activeFile.metadata.threat}</span>
            </div>
            <div>
              <span className="text-[#e7c574] block mb-1">TARGET_SECTOR:</span>
              <span className="text-paper">{activeFile.metadata.sector}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
