"use client";

type CityPoint = {
  id: string;      // company ID
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
    id: "agrom",
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
    id: "nets",
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
    id: "tencon",
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
    id: "miner-henry",
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
    id: "social-media",
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
    id: "qualty",
    name: "Solaris A",
    corp: "Quality Energy",
    x: 58,
    y: 65,
    population: "42.0 Million",
    powerUsage: "14.5 GW / Reactor Output",
    defenseStatus: "REACTOR_FORCE_SHIELD",
    threatLevel: "MODERATE (ENERGY STRIKE)",
    description: "Uzay maden gemilerinin ve plazma reaktörlerinin enerjisini tüm şehirlere dağıtan birinci ana istasyon."
  }
];

type CorporateMapProps = {
  activeId: string;
  onSelect: (id: string) => void;
};

export function CorporateMap({ activeId, onSelect }: CorporateMapProps) {
  const activeCity = cityPoints.find((c) => c.id === activeId) || cityPoints[0];

  return (
    <div className="w-full rounded-xl border border-border/10 bg-[#05060a]/50 backdrop-blur-md p-5 sm:p-6 mb-8">
      {/* HUD Header */}
      <div className="flex justify-between items-center border-b border-border/10 pb-3 mb-4 select-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase">
            GEOGRAPHIC CORE PATHWAY MAP
          </span>
        </div>
        <span className="font-mono text-[9px] text-[#e7c574]">GRID_SYNC_ACTIVE</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] items-center">
        
        {/* Left Side: Cyber Map Vector Grid */}
        <div className="relative aspect-[16/9.5] w-full rounded border border-border/5 bg-[#030407] overflow-hidden">
          
          {/* Cyberpunk corner notches */}
          <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-white/10" />
          <span className="absolute top-2 right-2 w-3 h-3 border-t border-r border-white/10" />
          <span className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-white/10" />
          <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/10" />

          {/* Grid Pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          {/* Vector Network Graph */}
          <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none">
            {cityPoints.map((city, idx) => 
              cityPoints.slice(idx + 1).map((nextCity, nIdx) => (
                <line
                  key={`${idx}-${nIdx}`}
                  x1={`${city.x}%`}
                  y1={`${city.y}%`}
                  x2={`${nextCity.x}%`}
                  y2={`${nextCity.y}%`}
                  stroke="rgba(242,239,232,0.1)"
                  strokeWidth="0.75"
                  strokeDasharray="3,3"
                />
              ))
            )}
          </svg>

          {/* Coordinate Nodes */}
          {cityPoints.map((city) => {
            const isSelected = city.id === activeId;
            return (
              <button
                key={city.id}
                onClick={() => onSelect(city.id)}
                style={{ left: `${city.x}%`, top: `${city.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center z-20"
              >
                <span className={`w-2.5 h-2.5 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  isSelected 
                    ? "bg-[#e7c574] border-[#e7c574] scale-125 shadow-[0_0_8px_#e7c574]" 
                    : "bg-black border-white/20 hover:border-white/40"
                }`}>
                  <span className="w-1 h-1 rounded-full bg-black" />
                </span>
                <span className={`absolute top-4 font-mono text-[8px] px-1 py-0.5 rounded border transition-all duration-300 ${
                  isSelected
                    ? "bg-[#e7c574] text-black border-[#e7c574]"
                    : "bg-black/95 text-muted-foreground border-white/5 group-hover:text-paper"
                }`}>
                  {city.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Selected City Live Telemetry Info */}
        <div className="relative rounded border border-border/10 bg-black/40 p-4 flex flex-col gap-3">
          <div className="border-b border-white/5 pb-2">
            <h4 className="font-display font-medium text-sm text-paper tracking-wider">
              {activeCity.name.toUpperCase()}
            </h4>
            <span className="font-mono text-[9px] text-muted-foreground block mt-0.5">
              SECTOR: {activeCity.corp.toUpperCase()}
            </span>
          </div>

          <div className="flex flex-col gap-2 font-mono text-[10px]">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-muted-foreground/60">POPULATION:</span>
              <span className="text-paper">{activeCity.population}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-muted-foreground/60">ABSORPTION:</span>
              <span className="text-paper">{activeCity.powerUsage}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-muted-foreground/60">SECURITY:</span>
              <span className="text-paper" style={{ color: "#e7c574" }}>{activeCity.defenseStatus}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-muted-foreground/60">THREAT:</span>
              <span className={`font-semibold ${
                activeCity.threatLevel.includes("EXTREME") 
                  ? "text-red-500" 
                  : activeCity.threatLevel.includes("HIGH") 
                  ? "text-amber-500" 
                  : "text-emerald-500"
              }`}>
                {activeCity.threatLevel}
              </span>
            </div>
          </div>

          <p className="font-mono text-[10px] text-muted-foreground leading-normal border-t border-white/5 pt-2">
            {activeCity.description}
          </p>
        </div>

      </div>
    </div>
  );
}
