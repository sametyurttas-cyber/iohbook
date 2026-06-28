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
                  FILE_REF: {company.id === "agrom" ? "AC_DAY_01" : company.id === "nets" ? "OC_DAY_CANAL_01" : company.id === "tencon" ? "TC_AERIAL_01" : company.id === "qualty" ? "SC_CAPITAL_01" : "NC_CENTER_01"}
                </span>
                {company.id === "agrom" && "Agrom City dikey mimari ve sokak panoraması. Altın işlemeli spayrlar ve siber sancaklar görünür durumdadır."}
                {company.id === "nets" && "Orion City kanal mimarisi ve şehir merkezi. Beyaz mermer saraylar ve parlayan siber sancaklar."}
                {company.id === "tencon" && "Tencon City Sector 17 genel görünümü ve Synapse Grid kuantum reaktör ağı şeması."}
                {company.id === "qualty" && "Solaris A başkent bölgesi ve Qualty Energy merkez reaktör kulelerinin gün batımı altındaki görkemli panoraması."}
                {company.id === "ubless" && "Nexum City gümüş kuleleri ve merkez ulaşım kanallarının bulutlu gün ışığı altındaki görkemli panoraması."}
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
                    FILE_REF: {company.id === "agrom" ? "AC_AERIAL_02" : company.id === "nets" ? "OC_NIGHT_CANAL_02" : company.id === "tencon" ? "TC_ARENA_02" : company.id === "qualty" ? "SC_MINING_HUB_02" : "NC_AERIAL_02"}
                  </span>
                  {company.id === "agrom" && "Merkez quantum sunucu kulesinin yörüngesel kalkan halkasıyla uydu kanallarından çekilmiş genel planı."}
                  {company.id === "nets" && "Orion City kanalları ve devasa holografik reklam panolarının mor ışık seli altındaki gece görünümü."}
                  {company.id === "tencon" && "Siber spor arenalarının ve KOWN robotik gladyatör dövüşlerinin yapıldığı devasa kubbeli Tencon Arena."}
                  {company.id === "qualty" && "Asteroid kuşağındaki uzay madenciliği merkezi Extraction Hub T9. Kuantum reaktör plazma yakıtı sevkiyatı."}
                  {company.id === "ubless" && "Nexum City siber veri yolları ve merkez şebeke kulesinin gece çekilmiş genel planı."}
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
                    FILE_REF: {company.id === "agrom" ? "AC_BROCHURE_03" : company.id === "nets" ? "OC_DAY_PALACE_03" : company.id === "tencon" ? "TC_STREET_03" : company.id === "qualty" ? "SC_MINING_HUD_03" : "NC_TRANSPORT_03"}
                  </span>
                  {company.id === "agrom" && "\"The future is here.\" - Corporate Union propaganda broşürü ve kentsel yaşam modülleri kılavuzu."}
                  {company.id === "nets" && "Nets Media Oligarchy ana yönetim sarayının dış cephesi ve gökyüzü ulaştırma hatları."}
                  {company.id === "tencon" && "Tencon City Alpha Bölgesi Node 17 ana caddeleri ve kuantum sunucu kuleleri."}
                  {company.id === "qualty" && "Qualty Energy Asteroid Mining Operation telemetri paneli. Çıkarılan elementlerin ve AI droneların durum kayıtları."}
                  {company.id === "ubless" && "\"We move consciousness.\" - Ubless Quantum Transport maglev kapsül tren hatları broşürü ve siber aktarım şeması."}
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
                  {company.id === "nets" && "Orion City gün batımı ve köprü geçiş hattının saray surları ile bütünleşen mor neon aydınlatması."}
                  {company.id === "tencon" && "Tencon kontrolündeki Bangkok Sektör 09. Yoğun nüfus baskısı altındaki cyberpunk sokaklar ve neural klinikler."}
                  {company.id === "qualty" && "Solaris temiz enerji sokak mimarisi. Dikey binalar üzerindeki dikey bahçeler ve arka planda yükselen enerji spayrları."}
                  {company.id === "ubless" && "Nexum krom kaplama dikey sokakları ve gökyüzü ulaştırma araçlarının gündüz görünümü."}
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
                  {company.id === "tencon" && "Tencon kontrolündeki Hong Kong Sektör 08. Devasa neon reklam panoları, siber pazar yerleri ve dikey mimari yapıları."}
                  {company.id === "qualty" && "Solaris yapay ışıklandırma kanalları ve köprülü otoyol hatları ile siber gece görünümü."}
                  {company.id === "ubless" && "Nexum City veri hatları ve siber otoyolların turkuaz ışık seli altındaki gece görünümü."}
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
                  Tencon Arena ana giriş kapısı ve siber güvenlik kontrol noktası. Dev turnuva için toplanan kalabalık.
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
                  Tencon Arena siber octagon dövüş alanı. Kırmızı ışıklar ve dev hologram ekranları eşliğinde nihai karşılaşma sahnesi.
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
                          {idx === 0 && (company.id === "agrom" ? "LOG_STREET_CODE_DISSOLUTION" : "LOG_ORION_WALL_BREACH")}
                          {idx === 1 && (company.id === "agrom" ? "LOG_METEOR_BOMBARDMENT" : "LOG_AI_ROBOTS_ASSAULT")}
                          {idx === 2 && (company.id === "agrom" ? "LOG_CORE_GRID_DELETION" : "LOG_PALACE_GATE_COLLAPSE")}
                          {idx === 3 && (company.id === "agrom" ? "LOG_BINARY_PIXEL_COLLAPSE" : "LOG_SIEGE_SCENE_MATRIX")}
                        </span>
                        {company.id === "agrom" 
                          ? "Agrom City yıkım ve System silinme kayıtları. Veri bütünlüğü bozuldu." 
                          : "Orion City kuşatma ve savunma üniteleri veri sızıntısı. KOWN robot istilası."}
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
