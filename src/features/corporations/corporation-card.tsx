"use client";

import Image from "next/image";
import { type CompanyProfile } from "./corporations-data";
import styles from "./corporations.module.css";

type CorporationCardProps = {
  company: CompanyProfile;
  index: number;
  onZoom: (src: string) => void;
};

export function CorporationCard({ company, index, onZoom }: CorporationCardProps) {
  const indexStr = String(index + 1).padStart(3, "0");

  return (
    <article
      id={company.id}
      className={styles.card}
      style={{ "--char-accent": company.accent } as React.CSSProperties}
    >
      <div className={styles.cardBorderTop} />

      {/* Card Header */}
      <header className={styles.cardHeader}>
        <div className={styles.headerMain}>
          <h2 className={styles.corpName}>{company.displayName}</h2>
          <span className={styles.corpLeader}>
            LEADER: {company.leader} ({company.leaderTitle})
          </span>
        </div>
        <div className={styles.headerMeta}>
          <div className={styles.statusIndicator}>
            <span className={styles.statusDotPulse} />
            <span>OLIGARCHY ARCHIVE</span>
          </div>
          <div>FILE_REF: CU_0{index + 1}</div>
          <div>SECTOR: {company.cityName}</div>
        </div>
      </header>

      {/* Card Body */}
      <div className={styles.cardBodyGrid}>
        
        {/* Left Side: Portrait */}
        <div className={styles.portraitWrapper}>
          <span className={`${styles.notch} ${styles.notchTL}`} />
          <span className={`${styles.notch} ${styles.notchTR}`} />
          <span className={`${styles.notch} ${styles.notchBL}`} />
          <span className={`${styles.notch} ${styles.notchBR}`} />
          <div 
            className="relative w-full h-full cursor-zoom-in"
            onClick={() => onZoom(company.images.portrait)}
          >
            <Image
              src={company.images.portrait}
              alt={company.leader}
              fill
              className={styles.portraitImage}
              sizes="280px"
              priority={index < 2}
              unoptimized
            />
          </div>
        </div>

        {/* Right Side: Information Column */}
        <div className={styles.infoColumn}>
          <blockquote className={styles.tagline}>"{company.tagline}"</blockquote>
          <p className={styles.overviewText}>{company.overview}</p>

          <div>
            <span className={styles.secLabel}>CORE ASSETS</span>
            <div className={styles.capabilitiesGrid}>
              {company.assets.map((asset, aIdx) => (
                <div key={aIdx} className={styles.assetItem}>
                  <div className={styles.assetTitle}>◆ {asset.name}</div>
                  <div className={styles.assetDesc}>{asset.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Lower Grid: Influence Matrice, Relations and Badges */}
      <div className={styles.lowerGrid}>
        
        {/* Influence metrics list */}
        <div>
          <span className={styles.secLabel}>INFLUENCE MATRIX</span>
          <div className={styles.influenceList}>
            {Object.entries(company.influence).map(([key, val]) => (
              <div key={key} className={styles.influenceRow}>
                <div className={styles.influenceLabelRow}>
                  <span className={styles.influenceLabel}>{key.toUpperCase()}</span>
                  <span className={styles.influenceVal}>{val}/10</span>
                </div>
                <div className={styles.influenceBarBg}>
                  <div
                    className={styles.influenceBarFill}
                    style={{ width: `${val * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic relations & core details */}
        <div>
          <span className={styles.secLabel}>SYSTEM TELEMETRY</span>
          <div className={styles.detailsList}>
            <div className={styles.detailRow}>
              <div className={styles.detailTitle}>MAIN SECTOR / DIVISION</div>
              <div className={styles.detailVal}>{company.coreBusiness}</div>
            </div>
            <div className={styles.detailRow}>
              <div className={styles.detailTitle}>SYSTEM DOMINANCE ROLE</div>
              <div className={styles.detailVal}>{company.systemRole}</div>
            </div>
            {company.relations.length > 0 && (
              <div className={styles.detailRow}>
                <div className={styles.detailTitle}>CORPORATE ALLIANCES / CONFLICTS</div>
                <div className={styles.relationsList}>
                  {company.relations.map((rel, rIdx) => (
                    <div key={rIdx} className={styles.relationRow}>
                      <span className={styles.relationTarget}>
                        TO: {rel.target.toUpperCase()} | RELATION: {rel.type.toUpperCase()}
                      </span>
                      <p className={styles.relationDesc}>{rel.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pill tags cloud */}
        <div>
          <span className={styles.secLabel}>CLASSIFICATION TAGS</span>
          <div className={styles.tagsCloud}>
            {company.tags.map((tag, tIdx) => (
              <span key={tIdx} className={styles.tagBadge}>
                {tag}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Optional City brochure panels (Generic layout for any corporation with cityDay assets) */}
      {company.images.cityDay && (
        <div className="mt-8 pt-8 border-t border-border/10">
          <span className={styles.secLabel}>{company.cityName.toUpperCase()} ATLAS DATABASE</span>
          <div className={`grid gap-6 sm:grid-cols-2 mt-4 ${company.images.cityExtra ? "lg:grid-cols-5" : company.images.citySunset ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
            
            {/* Day city viewport */}
            <div className="relative border border-border/10 bg-black/40 rounded-lg overflow-hidden p-2 flex flex-col gap-2">
              <div 
                className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-black/60 cursor-zoom-in"
                onClick={() => onZoom(company.images.cityDay!)}
              >
                <Image
                  src={company.images.cityDay!}
                  alt={`${company.cityName} street day view`}
                  fill
                  className="object-contain p-1"
                  sizes="(max-width: 768px) 100vw, 320px"
                  unoptimized
                />
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mt-1 px-1">
                <span className="text-[#e7c574] block font-semibold mb-0.5">
                  FILE_REF: {company.id === "agrom" ? "AC_DAY_01" : company.id === "nets" ? "OC_DAY_CANAL_01" : company.id === "tencon" ? "TC_AERIAL_01" : company.id === "qualty" ? "SC_CAPITAL_01" : company.id === "ubless" ? "NC_CENTER_01" : company.id === "social-media" ? "SM_COURTYARD_01" : "HC_STREET_01"}
                </span>
                {company.id === "agrom" && "Agrom City vertical architecture and street panorama. Golden server spires and cyber banners are visible."}
                {company.id === "nets" && "Orion City canal architecture and city center. White marble palaces and glowing cyber banners."}
                {company.id === "tencon" && "Tencon City Sector 17 overview and Synapse Grid quantum reactor network diagram."}
                {company.id === "qualty" && "Solaris A capital district and Qualty Energy central reactor towers majestic panorama under sunset."}
                {company.id === "ubless" && "Nexum City silver towers and central transportation channels majestic panorama under cloudy daylight."}
                {company.id === "social-media" && "Aulam City cyber data server courtyard and administrative buildings at twilight."}
                {company.id === "miner-henry" && "Hexcity deep underground streets. Hundreds of thousands of vertical hexagonal metal living cells and coal-gold shimmer."}
              </div>
            </div>

            {/* Center/Night city viewport */}
            {company.images.cityCenter && (
              <div className="relative border border-border/10 bg-black/40 rounded-lg overflow-hidden p-2 flex flex-col gap-2">
                <div 
                  className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-black/60 cursor-zoom-in"
                  onClick={() => onZoom(company.images.cityCenter!)}
                >
                  <Image
                    src={company.images.cityCenter!}
                    alt={`${company.cityName} center view`}
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 768px) 100vw, 320px"
                    unoptimized
                  />
                </div>
                <div className="font-mono text-[10px] text-muted-foreground mt-1 px-1">
                  <span className="text-[#e7c574] block font-semibold mb-0.5">
                    FILE_REF: {company.id === "agrom" ? "AC_AERIAL_02" : company.id === "nets" ? "OC_NIGHT_CANAL_02" : company.id === "tencon" ? "TC_ARENA_02" : company.id === "qualty" ? "SC_MINING_HUB_02" : company.id === "ubless" ? "NC_AERIAL_02" : company.id === "social-media" ? "SM_TOWER_02" : "HC_HEXAGONAL_02"}
                  </span>
                  {company.id === "agrom" && "General view of the central quantum server tower with its orbital shield ring, captured via satellite channels."}
                  {company.id === "nets" && "Orion City canals and massive holographic billboards at night under purple neon light rivers."}
                  {company.id === "tencon" && "Tencon Arena, the massive domed stadium where cyber sports events and KOWN gladiator combat take place."}
                  {company.id === "qualty" && "Extraction Hub T9, the space mining facility located in the asteroid belt. Quantum reactor plasma fuel shipment."}
                  {company.id === "ubless" && "Nexum City siber highways and central network spire captured at night."}
                  {company.id === "social-media" && "Aulam City lakeside massive cyber tower and data distribution arrays."}
                  {company.id === "miner-henry" && "Hexcity central grid tower and hexagonal mining combs general overview."}
                </div>
              </div>
            )}

            {/* Brochure/Day Palace viewport */}
            {company.images.cityBrochure && (
              <div className="relative border border-border/10 bg-black/40 rounded-lg overflow-hidden p-2 flex flex-col gap-2">
                <div 
                  className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-black/60 cursor-zoom-in"
                  onClick={() => onZoom(company.images.cityBrochure!)}
                >
                  <Image
                    src={company.images.cityBrochure!}
                    alt={`${company.cityName} brochure view`}
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 768px) 100vw, 320px"
                    unoptimized
                  />
                </div>
                <div className="font-mono text-[10px] text-muted-foreground mt-1 px-1">
                  <span className="text-[#e7c574] block font-semibold mb-0.5">
                    FILE_REF: {company.id === "agrom" ? "AC_BROCHURE_03" : company.id === "nets" ? "OC_DAY_PALACE_03" : company.id === "tencon" ? "TC_STREET_03" : company.id === "qualty" ? "SC_MINING_HUD_03" : company.id === "ubless" ? "NC_TRANSPORT_03" : "SM_CANAL_03"}
                  </span>
                  {company.id === "agrom" && "\"The future is here.\" - Corporate Union propaganda brochure and urban living modules directory."}
                  {company.id === "nets" && "Nets Media Oligarchy main administrative palace facade and sky transit channels."}
                  {company.id === "tencon" && "Tencon City Alpha Zone Node 17 main avenues and quantum server towers."}
                  {company.id === "qualty" && "Qualty Energy Asteroid Mining Operation telemetry dashboard. Status logs of extracted minerals and AI drones."}
                  {company.id === "ubless" && "\"We move consciousness.\" - Ubless Quantum Transport maglev capsule train network brochure and cyber transit schematics."}
                  {company.id === "social-media" && "Aulam City cyber streets, water canals, and massive red neon platform billboard ads."}
                </div>
              </div>
            )}

            {/* Sunset Palace viewport */}
            {company.images.citySunset && (
              <div className="relative border border-border/10 bg-black/40 rounded-lg overflow-hidden p-2 flex flex-col gap-2">
                <div 
                  className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-black/60 cursor-zoom-in"
                  onClick={() => onZoom(company.images.citySunset!)}
                >
                  <Image
                    src={company.images.citySunset!}
                    alt={`${company.cityName} sunset view`}
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 768px) 100vw, 320px"
                    unoptimized
                  />
                </div>
                <div className="font-mono text-[10px] text-muted-foreground mt-1 px-1">
                  <span className="text-[#e7c574] block font-semibold mb-0.5">
                    FILE_REF: {company.id === "nets" ? "OC_SUNSET_PALACE_04" : company.id === "tencon" ? "TC_SECTOR_09" : company.id === "qualty" ? "SC_DAY_STREET_04" : "NC_DAY_STREET_04"}
                  </span>
                  {company.id === "nets" && "Orion City sunset and the bridge crossing transit line lit with purple neon integrated with palace walls."}
                  {company.id === "tencon" && "Tencon-controlled Bangkok Sector 09. Cyberpunk streets and neural clinics under dense population pressure."}
                  {company.id === "qualty" && "Solaris clean energy street architecture. Vertical gardens on high-rises and towering energy spires in the background."}
                  {company.id === "ubless" && "Nexum chrome-plated vertical streets and day view of sky transit vehicles."}
                </div>
              </div>
            )}

            {/* Extra City viewport */}
            {company.images.cityExtra && (
              <div className="relative border border-border/10 bg-black/40 rounded-lg overflow-hidden p-2 flex flex-col gap-2">
                <div 
                  className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-black/60 cursor-zoom-in"
                  onClick={() => onZoom(company.images.cityExtra!)}
                >
                  <Image
                    src={company.images.cityExtra!}
                    alt={`${company.cityName} extra view`}
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 768px) 100vw, 320px"
                    unoptimized
                  />
                </div>
                <div className="font-mono text-[10px] text-muted-foreground mt-1 px-1">
                  <span className="text-[#e7c574] block font-semibold mb-0.5">
                    FILE_REF: {company.id === "tencon" ? "TC_SECTOR_08" : company.id === "qualty" ? "SC_NIGHT_STREET_05" : "NC_NIGHT_STREET_05"}
                  </span>
                  {company.id === "tencon" && "Tencon-controlled Hong Kong Sector 08. Massive neon billboard advertisements, cyber marketplaces, and vertical architectures."}
                  {company.id === "qualty" && "Solaris cyber night view featuring artificial lighting canals and bridged highway routes."}
                  {company.id === "ubless" && "Nexum City data channels and siber highways at night under turquoise neon light flows."}
                </div>
              </div>
            )}

            {/* Extra 2 City viewport */}
            {company.images.cityExtra2 && (
              <div className="relative border border-border/10 bg-black/40 rounded-lg overflow-hidden p-2 flex flex-col gap-2">
                <div 
                  className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-black/60 cursor-zoom-in"
                  onClick={() => onZoom(company.images.cityExtra2!)}
                >
                  <Image
                    src={company.images.cityExtra2!}
                    alt={`${company.cityName} extra view 2`}
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 768px) 100vw, 320px"
                    unoptimized
                  />
                </div>
                <div className="font-mono text-[10px] text-muted-foreground mt-1 px-1">
                  <span className="text-[#e7c574] block font-semibold mb-0.5">
                    FILE_REF: TC_ARENA_GATE_06
                  </span>
                  Tencon Arena main entrance gate and cyber security checkpoint. Crowds gathering for the grand tournament.
                </div>
              </div>
            )}

            {/* Extra 3 City viewport */}
            {company.images.cityExtra3 && (
              <div className="relative border border-border/10 bg-black/40 rounded-lg overflow-hidden p-2 flex flex-col gap-2">
                <div 
                  className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-black/60 cursor-zoom-in"
                  onClick={() => onZoom(company.images.cityExtra3!)}
                >
                  <Image
                    src={company.images.cityExtra3!}
                    alt={`${company.cityName} extra view 3`}
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 768px) 100vw, 320px"
                    unoptimized
                  />
                </div>
                <div className="font-mono text-[10px] text-muted-foreground mt-1 px-1">
                  <span className="text-[#e7c574] block font-semibold mb-0.5">
                    FILE_REF: TC_ARENA_OCTAGON_07
                  </span>
                  Tencon Arena cyber octagon combat ring. The final battle stage under red lights and massive holographic displays.
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Expandable magazine cover layout */}
      {company.images.magazine && (
        <details className="mt-6 border-t border-border/10 pt-6 group">
          <summary className={styles.classifiedSummary}>
            <div className={styles.classifiedLabel}>
              <span>📂 ACCESS SYSTEM OFFICIAL MAGAZINE COVER</span>
              <span className={styles.classifiedBadge}>YEAR_2303 / DEC_ARCHIVE</span>
            </div>
            <span className="font-mono text-xs group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="mt-4 flex justify-center bg-black/30 p-4 rounded-lg border border-border/5">
            <div 
              className="relative w-full max-w-[480px] aspect-[1/1.5] rounded-md overflow-hidden border border-border/10 bg-black cursor-zoom-in"
              onClick={() => onZoom(company.images.magazine!)}
            >
              <Image
                src={company.images.magazine}
                alt="System Magazine Cover"
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 100vw, 480px"
                unoptimized
              />
            </div>
          </div>
        </details>
      )}

      {/* Classified notes block */}
      {company.classifiedNote && (
        <details className={styles.classifiedBlock}>
          <summary className={styles.classifiedSummary}>
            <div className={styles.classifiedLabel}>
              <span>📂 ACCESS CLASSIFIED INTELLIGENCE DOSSIER</span>
              <span className={`${styles.classifiedBadge} text-red-500 border-red-500/30`}>
                RESTRICTED / SPOILER_LOCKED
              </span>
            </div>
            <span className="font-mono text-xs group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className={styles.classifiedContent}>
            <span className="text-red-500 font-mono block mb-2">// RESTRICTED INTEL:</span>
            <p className="mb-4">{company.classifiedNote}</p>
            {company.images.destruction && company.images.destruction.length > 0 && (
              <div className="mt-6 border-t border-red-500/10 pt-4">
                <span className="text-red-500 font-mono text-[10px] block mb-3 uppercase">
                  // DESTRUCTION ARCHIVE: {company.cityName.toUpperCase()} DELETION LOG
                </span>
                <div className="grid gap-4 sm:grid-cols-2">
                  {company.images.destruction.map((img, idx) => (
                    <div key={idx} className="relative border border-red-500/20 bg-black/60 rounded p-2 flex flex-col gap-2">
                      <div 
                        className="relative w-full aspect-[4/3] rounded bg-black/80 overflow-hidden cursor-zoom-in"
                        onClick={() => onZoom(img)}
                      >
                        <Image
                          src={img}
                          alt={`${company.cityName} Destruction Stage ${idx + 1}`}
                          fill
                          className="object-contain p-1"
                          sizes="(max-width: 768px) 100vw, 350px"
                          unoptimized
                        />
                      </div>
                      <div className="font-mono text-[9px] text-red-400/80 px-1 leading-normal">
                        <span className="text-red-500 block font-semibold mb-0.5">
                          {idx === 0 && (company.id === "agrom" ? "LOG_STREET_CODE_DISSOLUTION" : company.id === "social-media" ? "LOG_AULAM_OUTER_SIEGE" : company.id === "miner-henry" ? "LOG_OLYMPUS_DIMENSION" : "LOG_ORION_WALL_BREACH")}
                          {idx === 1 && (company.id === "agrom" ? "LOG_METEOR_BOMBARDMENT" : company.id === "social-media" ? "LOG_QUANTUM_BATTLE_HUD" : "LOG_AI_ROBOTS_ASSAULT")}
                          {idx === 2 && (company.id === "agrom" ? "LOG_CORE_GRID_DELETION" : company.id === "social-media" ? "LOG_AULAM_CORE_BREACH" : "LOG_PALACE_GATE_COLLAPSE")}
                          {idx === 3 && (company.id === "agrom" ? "LOG_BINARY_PIXEL_COLLAPSE" : "LOG_SIEGE_SCENE_MATRIX")}
                        </span>
                        {company.id === "agrom" && "Agrom City destruction and System deletion logs. Data integrity compromised."}
                        {company.id === "social-media" && (
                          idx === 0 ? "Besieging of Aulam Core Citadel outer defense boundaries by Swos mecha and armored division units." :
                          idx === 1 ? "Aulam Core siber siege monitoring screen and SWOS Forces data breach/infiltration analysis HUD telemetry." :
                          "Swos military squads disabling the final security AI inside the Aulam Core Citadel data chamber, initiating a data cascade."
                        )}
                        {company.id === "miner-henry" && "Landscape panorama of the Olympus Pocket Dimension refuge, constructed by Miner Henry using limitless resources extracted from underground mining exploitation."}
                        {company.id !== "agrom" && company.id !== "social-media" && company.id !== "miner-henry" && "Orion City siege and defensive units data leak. KOWN robotic invasion."}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </details>
      )}
    </article>
  );
}
