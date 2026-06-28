"use client";

import { useState } from "react";

type CityPoint = {
  id: string;
  name: string;
  corp: string;
  x: number; // percentage
  y: number; // percentage
  population: string;
  powerUsage: string;
  defenseStatus: string;
  description: string;
  threatLevel: string;
};

const cityPoints: CityPoint[] = [
  {
    id: "agrom-city",
    name: "Agrom City",
    corp: "Agrom Technology",
    x: 48,
    y: 35,
    population: "142.5 Million",
    powerUsage: "9.2 GW / Quantum Core",
    defenseStatus: "SEC_SHIELD_ACTIVE",
    threatLevel: "MODERATE (POST-COLLAPSE)",
    description: "System zihin aktarım sunucularına ev sahipliği yapan birinci quantum megacity. Steve Agrom'un kalesi."
  },
  {
    id: "orion-city",
    name: "Orion City",
    corp: "Nets Oligarchy",
    x: 25,
    y: 55,
    population: "89.2 Million",
    powerUsage: "4.8 GW / Hologram Array",
    defenseStatus: "PERCEPTION_SHIELD_MAX",
    threatLevel: "LOW (PACIFIED)",
    description: "Eğlence endüstrisinin, karnavalların ve Madam Anne'in algı imparatorluğunun merkez mücevheri."
  },
  {
    id: "tencon-city",
    name: "Tencon City",
    corp: "Tencon Games & Defense",
    x: 72,
    y: 28,
    population: "64.0 Million",
    powerUsage: "8.5 GW / Forge Dome",
    defenseStatus: "KOWN_BATTALION_MAX",
    threatLevel: "STABLE / HEAVY SHIELD",
    description: "Yapay zeka dökümhanelerinin, Hack Wars arenalarının ve KOWN üretim bantlarının merkezi."
  },
  {
    id: "hexcity",
    name: "Hexcity",
    corp: "Miner Henry Empire",
    x: 82,
    y: 70,
    population: "105.8 Million",
    powerUsage: "11.2 GW / Cell Grid",
    defenseStatus: "TULA_AI_COMMAND_ACTIVE",
    threatLevel: "HIGH (LABOR RIOTS)",
    description: "Yüz binlerce hexagon hücreden oluşan IOHcoin/Altcoin madencilik havzası ve Henry'nin çöl kalesi."
  },
  {
    id: "aulam",
    name: "Aulam",
    corp: "Social Media Oligarchy",
    x: 35,
    y: 75,
    population: "38.1 Million",
    powerUsage: "3.2 GW / Core Server",
    defenseStatus: "SHIELD_CRITICAL_FAIL",
    threatLevel: "EXTREME (UNDER SIEGE)",
    description: "Sosyal medya ana çekirdek sunucusu. Swos kuvvetleri tarafından kuşatılmış zayıf halka."
  },
  {
    id: "solaris-a",
    name: "Solaris A",
    corp: "Quality Energy",
    x: 58,
    y: 65,
    population: "42.0 Million",
    powerUsage: "14.5 GW / Reactor Output",
    defenseStatus: "REACTOR_FORCE_SHIELD",
    threatLevel: "MODERATE (ENERGY STRIKE)",
    description: "Uzay maden gemilerinin ve plazma reaktörlerinin enerjisini tüm şehirlere dağıtan birinci ana istasyon."
  },
  {
    id: "solaris-b",
    name: "Solaris B",
    corp: "Quality Energy",
    x: 64,
    y: 50,
    population: "28.5 Million",
    powerUsage: "8.2 GW / Sub-Reactor Output",
    defenseStatus: "SUB_REACTOR_STABLE",
    threatLevel: "LOW (SECURE)",
    description: "Solaris A ile koordineli çalışan, System yörüngesel enerji kalkanını besleyen yedek reaktör şehri."
  },
  {
    id: "nexum-city",
    name: "Nexum City",
    corp: "Ubless Transport & Data",
    x: 18,
    y: 22,
    population: "52.7 Million",
    powerUsage: "7.1 GW / Transit Hub",
    defenseStatus: "GRID_TRANSIT_SHIELD",
    threatLevel: "STABLE (LOGISTICS LOG)",
    description: "Manyetik kapsül tünellerinin, okyanus altı kablolarının ve veri yollarının düğüm noktası."
  }
];

export function CorporateMap() {
  const [selectedCity, setSelectedCity] = useState<CityPoint>(cityPoints[0]);

  return (
    <div className="w-full rounded-xl border border-border/40 bg-black/60 backdrop-blur-md p-6 lg:p-8 mt-10">
      
      {/* HUD Header */}
      <div className="flex justify-between items-center border-b border-border/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          <h3 className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            CORPORATE UNION GLOBAL GIS MAP / LIVE TELEMETRY
          </h3>
        </div>
        <span className="font-mono text-[10px] text-[#e7c574]">COORD_GRID_STABLE: 99.8%</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start">
        
        {/* Left Side: Cyber Map Vector Container */}
        <div className="relative aspect-[16/10] w-full rounded-lg border border-border/10 bg-[#04060b] overflow-hidden p-2">
          
          {/* Cyberpunk corner notches */}
          <span className="absolute top-2 left-2 w-3.5 h-3.5 border-t border-l border-border/20" />
          <span className="absolute top-2 right-2 w-3.5 h-3.5 border-t border-r border-border/20" />
          <span className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b border-l border-border/20" />
          <span className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b border-r border-border/20" />

          {/* Grid Pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(242,239,232,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(242,239,232,0.015)_1px,transparent_1px)] bg-[size:25px_25px] pointer-events-none" />

          {/* Vector Network Graph */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
            {/* Draw connection pathways between corporate cities */}
            {cityPoints.map((city, idx) => 
              cityPoints.slice(idx + 1).map((nextCity, nIdx) => (
                <line
                  key={`${idx}-${nIdx}`}
                  x1={`${city.x}%`}
                  y1={`${city.y}%`}
                  x2={`${nextCity.x}%`}
                  y2={`${nextCity.y}%`}
                  stroke="rgba(242,239,232,0.12)"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              ))
            )}
          </svg>

          {/* Interactive Coordinate Nodes */}
          {cityPoints.map((city) => {
            const isSelected = city.id === selectedCity.id;
            return (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city)}
                style={{ left: `${city.x}%`, top: `${city.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center z-20"
              >
                {/* Visual Node */}
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  isSelected 
                    ? "bg-[#e7c574] border-[#e7c574] scale-125 shadow-[0_0_12px_#e7c574]" 
                    : "bg-black border-muted-foreground/30 hover:border-[#e7c574]/60 group-hover:scale-110"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-black" />
                </span>
                {/* Node name popover */}
                <span className={`absolute top-5 font-mono text-[9px] px-1.5 py-0.5 rounded border transition-all duration-300 ${
                  isSelected
                    ? "bg-[#e7c574] text-black border-[#e7c574]"
                    : "bg-black/90 text-muted-foreground border-border/10 group-hover:text-paper"
                }`}>
                  {city.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Selected City Live Telemetry Info */}
        <div className="relative border border-[#e7c574]/20 rounded-lg overflow-hidden bg-[#030407] p-5 flex flex-col gap-4">
          
          <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#e7c574]" />
          <span className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#e7c574]" />
          <span className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#e7c574]" />
          <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#e7c574]" />

          {/* City details header */}
          <div className="border-b border-border/10 pb-3">
            <span className="font-mono text-[9px] text-[#e7c574] block uppercase">
              // TELEMETRY ACTIVE NODE
            </span>
            <h4 className="font-display font-medium text-lg text-paper mt-0.5">
              {selectedCity.name.toUpperCase()}
            </h4>
            <span className="font-mono text-[10px] text-muted-foreground uppercase">
              CONTROL AUTHORITY: {selectedCity.corp}
            </span>
          </div>

          {/* Telemetry data rows */}
          <div className="flex flex-col gap-3 font-mono text-xs">
            <div className="flex justify-between border-b border-border/5 py-1">
              <span className="text-muted-foreground">TOTAL POPULATION:</span>
              <span className="text-paper">{selectedCity.population}</span>
            </div>
            <div className="flex justify-between border-b border-border/5 py-1">
              <span className="text-muted-foreground">ENERGY ABSORPTION:</span>
              <span className="text-paper">{selectedCity.powerUsage}</span>
            </div>
            <div className="flex justify-between border-b border-border/5 py-1">
              <span className="text-muted-foreground">DEFENSE SYSTEMS:</span>
              <span className="text-paper text-[#e7c574]">{selectedCity.defenseStatus}</span>
            </div>
            <div className="flex justify-between border-b border-border/5 py-1">
              <span className="text-muted-foreground">THREAT CLASSIFICATION:</span>
              <span className={`font-semibold ${
                selectedCity.threatLevel.includes("EXTREME") 
                  ? "text-red-500" 
                  : selectedCity.threatLevel.includes("HIGH") 
                  ? "text-amber-500" 
                  : "text-emerald-500"
              }`}>
                {selectedCity.threatLevel}
              </span>
            </div>
          </div>

          {/* City narrative overview */}
          <div className="mt-2 border-t border-border/10 pt-4 font-mono text-[11px] text-muted-foreground leading-relaxed">
            <span className="text-[#e7c574] block mb-1 uppercase">// GEOGRAPHIC DESCRIPTION:</span>
            {selectedCity.description}
          </div>
        </div>

      </div>
    </div>
  );
}
