"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IohSceneHeader } from "@/components/layout/ioh-scene-header";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { swosData } from "./swos-data";
import { SwosWebGL } from "./swos-webgl";
import styles from "./swos.module.css";

interface SwosSceneProps {
  user?: any;
}

export default function SwosScene({ user }: SwosSceneProps) {
  const [isLeaked, setIsLeaked] = useState(false);
  const [activeNode, setActiveNode] = useState(0);
  const [openCrisis, setOpenCrisis] = useState<string | null>(null);
  const [activeLightbox, setActiveLightbox] = useState<string | null>(null);

  const centriumNodes = [
    { name: "Tax Cores", ref: "HC_TAX_01", x: "32%", y: "45%", desc: "Tüm bağlı dünyalardan vergi ve kaynak kesintisi yapan veri çekirdeği.", leak: "Bağımsız madencilerin kazandığı tokenların %34'üne otomatik olarak el koyan gizli kod parçacıkları barındırır." },
    { name: "Ministries", ref: "HC_MIN_02", x: "48%", y: "30%", desc: "Ekonomi, savunma ve teknoloji politikalarını koordine eden federal meclis binaları.", leak: "Şirketler Birliği temsilcileriyle arka kapıda yapılan gizli anlaşmaların asıl onay merciidir." },
    { name: "Military Command Grid", ref: "HC_MIL_03", x: "65%", y: "55%", desc: "Yörünge uyduları, savunma kalkanları ve drone orduları komuta şebekesi.", leak: "Sivil isyanlarda şehirleri yok etmek üzere programlanmış acil durum lazer protokollerini yönetir." },
    { name: "Technology Hub", ref: "HC_TECH_04", x: "25%", y: "65%", desc: "System'in teknolojik sürekliliğini ve kalkan yapısını koruyan geliştirme merkezleri.", leak: "Vatandaşların zihinsel loglarını ve dijital hareket geçmişlerini analiz eden yapay zeka takip algoritmaları geliştirilir." },
    { name: "Iohcoin Core", ref: "HC_IOH_05", x: "50%", y: "60%", desc: "System içi para damarı ve kuantum veri tabanı.", leak: "SWOS'un ekonomiyi kontrol etmek ve vatandaşları borç döngüsünde tutmak için kullandığı ana enstrüman." },
    { name: "World Currency Core", ref: "HC_WCC_06", x: "78%", y: "35%", desc: "Eski dünyada yaşayan insanların para kayıtları ve siber aktarımları.", leak: "Quantum entanglement kullanarak her satın alma hareketini izler ve loglar." }
  ];

  const handleToggle = () => {
    setIsLeaked(prev => !prev);
  };

  return (
    <div className={styles.swosContainer}>
      <IohIndexStyles />
      <IohSceneHeader user={user} />
      <SwosWebGL />
      
      {/* 02. Resmî Üst Navigasyon */}
      <header className={styles.stateNav}>
        <div className="flex items-center gap-6">
          <Link href="/swos" className={styles.stateLogo}>
            SWOS.GOV // SYSTEM
          </Link>
          <div className={styles.stateLinks}>
            <a href="#state">STATE</a>
            <a href="#capital">CAPITAL</a>
            <a href="#defense">DEFENSE</a>
            <a href="#currency">CURRENCY</a>
            <a href="#citizenship">CITIZENSHIP</a>
            <a href="#crisis">CRISIS ARCHIVE</a>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className={styles.stateStatus}>
            <span className="text-[#8b949e] font-mono text-[10px] uppercase">
              PRESIDENT: MATT // STATUS: EMERGENCY
            </span>
            <span className={styles.statusIndicator} />
          </div>
        </div>
      </header>

      <main className={styles.shell}>
        
        {/* 01. HERO — Resmî Devlet Giriş Ekranı */}
        <section className={styles.hero}>
          <div className={styles.heroKicker}>
            <span className={styles.kickerDot} />
            <span>SWOS OFFICIAL STATE PORTAL</span>
          </div>
          <h1 className={styles.heroTitle}>SWOS</h1>
          <p className={styles.heroSubtitle}>SYSTEM WORLD STATES UNION</p>
          <p className={styles.heroSlogan}>
            {isLeaked ? "CONTROL BEYOND RESISTANCE." : "ORDER BEYOND DEATH."}
          </p>
          <p className="max-width-[580px] mx-auto text-sm text-[#8b949e] leading-relaxed mb-8">
            {isLeaked 
              ? "Sistem genelinde genişleyen askeri polis devriyesi ve kuantum takip mekanizmalarıyla sarmalanmış federal kontrol aygıtı." 
              : "System ve bağlı dünyaların güvenlik, düzen ve sürekliliğini koruyan en üst düzey federal otorite."
            }
          </p>
          <div className={styles.heroActions}>
            <a href="#state" className={`${styles.btnState} ${styles.btnPrimary}`}>
              {isLeaked ? "ENTER DOSSIERS" : "ENTER STATE ARCHIVE"}
            </a>
            <a href="#capital" className={styles.btnState}>
              VIEW CENTRIUM
            </a>
          </div>
        </section>

        {/* 03. “State Identity” Bölümü */}
        <section id="state" className={styles.stateIdentity}>
          <div className={styles.panelGrid}>
            <div>
              <span className={styles.sectionKicker}>STATE PROFILE</span>
              <h2 className={styles.sectionTitle}>State Identity</h2>
              
              <p className={styles.stateText}>
                SWOS, Great Collapse sonrası eski ulusların kalıntılarından doğan federal yönetim mekanizmasıdır. System’i, kuantum şehirlerini ve hâlâ eski dünyaya bağlı ekonomik damarları tek merkezden yönetir.
              </p>

              {isLeaked ? (
                <div className={styles.leakedBox}>
                  <h4>// LEAKED INTEL ANALYSIS</h4>
                  <p>
                    Dünya, Great Collapse sonrası ikiye ayrılmıştır: Bir tarafta Corporate Union, diğer tarafta States Union yani SWOS. SWOS, güvenlik vaadiyle insanları sürekli gözetim ve zorunlu ölüm sonrası dijital kayıt altında tutan merkeziyetçi bir diktatörlüktür.
                  </p>
                </div>
              ) : (
                <div className={styles.officialBox}>
                  <h4>// OFFICIAL STATE PROMISE</h4>
                  <p>
                    Tüm System vatandaşları için kaos ve anarşiye karşı sürekli koruma, ekonomik istikrar ve ölümün ötesinde güvenceye alınmış süreklilik.
                  </p>
                </div>
              )}
            </div>

            <div className={styles.sealContainer}>
              <div 
                className="relative w-full aspect-square max-w-[220px] cursor-zoom-in"
                onClick={() => setActiveLightbox("/media/corporations/swos-logo.jpg")}
              >
                <Image
                  src="/media/corporations/swos-logo.jpg"
                  alt="SWOS Official Seal"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              
              <div className={styles.stateProfileList}>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>OFFICIAL NAME</span>
                  <span className={styles.profileValue}>{swosData.officialName}</span>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>EXECUTIVE AUTHORITY</span>
                  <span className={styles.profileValue}>{swosData.leader}</span>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>CAPITAL CITY</span>
                  <span className={styles.profileValue}>{swosData.capital}</span>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>SYSTEM TYPE</span>
                  <span className={styles.profileValue}>{swosData.governmentType}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 04. Centrium Bölümü — “Capital of Control” */}
        <section id="capital" className={styles.centriumSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>FEDERAL SECTOR</span>
            <h2 className={styles.sectionTitle}>Centrium // Capital of Swos</h2>
            <p className={styles.sectionSlogan}>"A city built not to inspire, but to contain."</p>
          </div>

          <div className={styles.atlasGrid}>
            <div className={styles.atlasMapContainer}>
              <Image
                src="/media/corporations/centrium-plaza.jpg"
                alt="Centrium Plaza overview"
                fill
                className="object-cover opacity-70"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              
              <div className={styles.atlasOverlay} />
              
              {/* Render Target Nodes on Grid Map */}
              {centriumNodes.map((node, index) => (
                <div
                  key={node.ref}
                  className={`${styles.atlasTargetNode} ${activeNode === index ? styles.atlasTargetNodeActive : ""}`}
                  style={{ left: node.x, top: node.y }}
                  onClick={() => setActiveNode(index)}
                  title={node.name}
                />
              ))}

              <div className="absolute bottom-4 left-4 font-mono text-[9px] text-[#8b949e] flex flex-col gap-0.5">
                <span>SECTOR: 01_CENTRIUM_GRID</span>
                <span>STATUS: OPERATIONAL</span>
              </div>
            </div>

            <div className={styles.atlasInfoPanel}>
              <span className={styles.atlasNodeRef}>
                REF: {centriumNodes[activeNode].ref}
              </span>
              <h3 className={styles.atlasNodeTitle}>
                {centriumNodes[activeNode].name}
              </h3>
              <p className={styles.atlasNodeDesc}>
                {centriumNodes[activeNode].desc}
              </p>

              <div className={`mt-4 border-t border-border/10 pt-4 ${isLeaked ? "border-red-500/10" : "border-blue-500/10"}`}>
                <span className={`font-mono text-[9px] block mb-1 uppercase ${isLeaked ? "text-red-500" : "text-[#7aa7ff]"}`}>
                  {isLeaked ? "// LEAKED INTERNAL REPORT" : "// OFFICIAL LOGISTICS ARCHIVE"}
                </span>
                <p className="text-xs italic text-[#8b949e] leading-relaxed">
                  {isLeaked ? centriumNodes[activeNode].leak : "Mekansal veri bütünlüğü kontrol edildi. Herhangi bir siber tehdit veya sızıntı tespit edilmedi."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 05. “Federal Structure” Bölümü */}
        <section className={styles.structureSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>GOVERNMENT STRUCTURE</span>
            <h2 className={styles.sectionTitle}>Federal Command Structure</h2>
            <p className={styles.sectionSlogan}>
              {isLeaked 
                ? "SWOS does not govern through persuasion. It governs through continuity, currency, and command."
                : "Continuous security. Seamless coordination. Unbroken chain of command."
              }
            </p>
          </div>

          <div className={styles.structureDiagram}>
            <div className={styles.diagramRow}>
              <div className={styles.diagramNode} style={{ borderColor: isLeaked ? "#ff3b3b" : "#7aa7ff" }}>
                <span className={styles.nodeTitle}>PRESIDENT</span>
                <span className={styles.nodeValue}>Matt</span>
                <span className={styles.nodeLeader}>Supreme Command</span>
                <div className={styles.diagramLineVertical} />
              </div>
            </div>

            <div className={styles.diagramRow}>
              <div className={styles.diagramNode}>
                <span className={styles.nodeTitle}>COUNCIL</span>
                <span className={styles.nodeValue}>Ministers Council</span>
                <span className={styles.nodeLeader}>Coordinators</span>
                <div className={styles.diagramLineVertical} />
              </div>
              <div className={styles.diagramNode}>
                <span className={styles.nodeTitle}>SECURITY</span>
                <span className={styles.nodeValue}>General Security</span>
                <span className={styles.nodeLeader}>Alice & John</span>
                <div className={styles.diagramLineVertical} />
              </div>
              <div className={styles.diagramNode}>
                <span className={styles.nodeTitle}>MINISTRIES</span>
                <span className={styles.nodeValue}>State Bureaus</span>
                <span className={styles.nodeLeader}>Samuel Fox & Sergei</span>
                <div className={styles.diagramLineVertical} />
              </div>
            </div>

            <div className={styles.diagramRow}>
              <div className={styles.diagramNode}>
                <span className={styles.nodeTitle}>ECONOMY</span>
                <span className={styles.nodeValue}>Minister Sergei</span>
              </div>
              <div className={styles.diagramNode}>
                <span className={styles.nodeTitle}>MILITARY</span>
                <span className={styles.nodeValue}>Samuel Fox</span>
              </div>
              <div className={styles.diagramNode}>
                <span className={styles.nodeTitle}>CORE SYSTEMS</span>
                <span className={styles.nodeValue}>Tech Core AI</span>
              </div>
            </div>
          </div>
        </section>

        {/* 06. Başkanlık Bölümü — “President Matt” */}
        <section className={styles.presidentSection}>
          <div className={styles.presidentProfileCard}>
            <div className={styles.presidentBody}>
              <div 
                className="relative w-full aspect-[1/1.35] border border-border/10 bg-black cursor-zoom-in"
                onClick={() => setActiveLightbox("/media/corporations/president-matt.jpg")}
              >
                <Image
                  src="/media/corporations/president-matt.jpg"
                  alt="President Matt Supreme Executive Portrait"
                  fill
                  className="object-cover"
                  sizes="280px"
                  unoptimized
                />
              </div>
              <div className={styles.presidentTextContainer}>
                <span className={styles.presidentSub}>SUPREME EXECUTIVE AUTHORITY</span>
                <h3 className={styles.presidentTitle}>President Matt</h3>
                <p className={styles.presidentDesc}>
                  Matt, SWOS’un yalnızca başkanı değil; yapının demir iradesidir. Onun yönetiminde devlet, seçimle değişen bir kurum olmaktan çıkar; üç yüzyıllık bir süreklilik makinesine dönüşür.
                </p>
                <div className="font-mono text-xs text-muted-foreground flex gap-4 mt-2">
                  <span>OFFICE: SWOS HQ</span>
                  <span>STATUS: GOVERNING</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 07. “Swos Headquarters” Bölümü */}
        <section className={styles.hqSection}>
          <div className={styles.hqGrid}>
            <div>
              <span className={styles.sectionKicker}>POWER CENTER</span>
              <h2 className={styles.sectionTitle}>Swos Headquarters</h2>
              <p className={styles.sectionSlogan}>"Where the capital obeys."</p>
              
              <p className="text-sm text-[#8b949e] leading-relaxed mt-4">
                Centrium kağıt üzerinde federal başkenttir; fakat gerçek güç, kriz yönetim toplantılarının yapıldığı, en üst düzey yöneticiler ve bakanlar kurulunun acil kodla toplandığı Swos Headquarters'tadır.
              </p>
            </div>

            <div 
              className={`${styles.hqImageWrapper} cursor-zoom-in`}
              onClick={() => setActiveLightbox("/media/corporations/centrium-street.jpg")}
            >
              <Image
                src="/media/corporations/centrium-street.jpg"
                alt="Centrium rainy siber-street view"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
          </div>
        </section>

        {/* 08. “Currency & Core Authority” Bölümü */}
        <section id="currency" className={styles.currencySection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>INFRASTRUCTURE</span>
            <h2 className={styles.sectionTitle}>Currency & Core Authority</h2>
            <p className={styles.sectionSlogan}>"All transactions. All accounts. All worlds. One center."</p>
          </div>

          <div className={styles.currencyGrid}>
            <div className={styles.currencyCoreCard}>
              <div className={styles.coreHeader}>
                <h3 className={styles.coreTitle}>Iohcoin Core</h3>
                <span className={styles.coreRef}>CORE_SYS_01</span>
              </div>
              <p className={styles.coreDesc}>
                System içi para damarı ve ana işlem kayıt altyapısı. İşlem geçmişini tamamen siber veri tabanında saklar.
              </p>
            </div>

            <div className={styles.currencyCoreCard}>
              <div className={styles.coreHeader}>
                <h3 className={styles.coreTitle}>World-Currency Core</h3>
                <span className={styles.coreRef}>CORE_SYS_02</span>
              </div>
              <p className={styles.coreDesc}>
                Hâlâ eski dünyada yaşayan insanların para kayıtları ve kuantum dolanıklık yardımıyla yapılan siber aktarımları.
              </p>
            </div>
          </div>
        </section>

        {/* 09. “Security State” Bölümü */}
        <section id="defense" className={styles.securitySection}>
          <div className={styles.securityGrid}>
            <div>
              <span className={styles.sectionKicker}>SECURITY CONTROL</span>
              <h2 className={styles.sectionTitle}>Security State</h2>
              <p className={styles.sectionSlogan}>"Protection is the language of control."</p>
              
              <div className={styles.securityList}>
                <div className={styles.securityItem}>
                  <span className={styles.securityItemName}>Military Grids</span>
                  <span className={styles.securityItemDesc}>Yörüngesel kalkanlar ve füze bataryaları kontrolü.</span>
                </div>
                <div className={styles.securityItem}>
                  <span className={styles.securityItemName}>Security Divisions</span>
                  <span className={styles.securityItemDesc}>Siber asayiş ekipleri ve devriye ağları.</span>
                </div>
                <div className={styles.securityItem}>
                  <span className={styles.securityItemName}>Drone Enforcement</span>
                  <span className={styles.securityItemDesc}>Merkez bölgelerin otonom dronlarca izlenmesi.</span>
                </div>
                <div className={styles.securityItem}>
                  <span className={styles.securityItemName}>Antivirus Units</span>
                  <span className={styles.securityItemDesc}>Siber güvenlik ve virüs temizleme ekipleri.</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div 
                className="relative w-full aspect-[16/10] border border-border/10 rounded-lg overflow-hidden bg-black/40 cursor-zoom-in"
                onClick={() => setActiveLightbox("/media/corporations/centrium-parade.jpg")}
              >
                <Image
                  src="/media/corporations/centrium-parade.jpg"
                  alt="Centrium Military Parade"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-2 left-3 font-mono text-[9px] text-[#ff3b3b] font-bold">
                  // FORCES DIRECTORY // PARADE_GRID_2303
                </div>
              </div>

              <div className={styles.securityTelemetry}>
                <div className={styles.telemetryHeader}>
                  <span>// SWOS FORCES TELEMETRY</span>
                  <span className="blink">EMERGENCY STATE ACTIVE</span>
                </div>
                <div className={styles.telemetryBody}>
                  <div className={styles.telemetryRow}>
                    <span className={styles.telemetryLabel}>DEFENSE PROTOCOL</span>
                    <span className={styles.telemetryValue}>D-9 ACTIVE</span>
                  </div>
                  <div className={styles.telemetryRow}>
                    <span className={styles.telemetryLabel}>THREAT FACTOR</span>
                    <span className={styles.telemetryValue}>SWOS FORCES ENGAGED</span>
                  </div>
                  <div className={styles.telemetryRow}>
                    <span className={styles.telemetryLabel}>CORE INTEGRITY</span>
                    <span className={styles.telemetryValue} style={{ color: "#ff3b3b" }}>34.2% (UNDER ATTACK)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. “Citizenship After Death” Bölümü */}
        <section id="citizenship" className={styles.citizenshipSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>SYSTEM LOGIC</span>
            <h2 className={styles.sectionTitle}>Citizenship After Death</h2>
            <p className={styles.sectionSlogan}>"Death is not an end. It is a transfer of jurisdiction."</p>
          </div>

          <div className={styles.flowContainer}>
            <div className={styles.flowStep}>
              <div className={styles.flowStepCircle}>01</div>
              <span className={styles.flowStepName}>DEATH</span>
              <span className={styles.flowStepDesc}>Fiziksel bedenin son bulması.</span>
            </div>
            <div className={styles.flowConnector}>→</div>
            <div className={styles.flowStep}>
              <div className={styles.flowStepCircle}>02</div>
              <span className={styles.flowStepName}>TRANSFER</span>
              <span className={styles.flowStepDesc}>Enerji kimliğinin kuantum bilgisayara aktarılması.</span>
            </div>
            <div className={styles.flowConnector}>→</div>
            <div className={styles.flowStep}>
              <div className={styles.flowStepCircle}>03</div>
              <span className={styles.flowStepName}>REGISTRATION</span>
              <span className={styles.flowStepDesc}>System sunucularında kayıt açılması.</span>
            </div>
            <div className={styles.flowConnector}>→</div>
            <div className={styles.flowStep}>
              <div className={styles.flowStepCircle}>04</div>
              <span className={styles.flowStepName}>EGO ACCESS</span>
              <span className={styles.flowStepDesc}>Hafıza ve kimlik yetkilendirmesi.</span>
            </div>
            <div className={styles.flowConnector}>→</div>
            <div className={styles.flowStep}>
              <div className={styles.flowStepCircle}>05</div>
              <span className={styles.flowStepName}>RECORD</span>
              <span className={styles.flowStepDesc}>SWOS resmî veri kütüğüne işlenme.</span>
            </div>
          </div>
        </section>

        {/* 11. “Public Order Broadcast” Bölümü */}
        <section className={styles.broadcastSection}>
          <div className={styles.tickerContainer}>
            <span className={styles.tickerLabel}>ALERT NOTICE</span>
            <div className={styles.tickerTrack}>
              <span>EMERGENCY CODE ACTIVE ✦ REPORT UNAUTHORIZED PORTAL ACTIVITY ✦ ALL CITIZENS STAY INDOORS DURING MATRIX FLUSH ✦ THREAT ACTORS DETECTED IN CENTRIUM ✦</span>
            </div>
          </div>

          <div className={styles.broadcastGrid}>
            <div className={styles.broadcastMonitor}>
              <div className={styles.monitorHeader}>
                <span className={styles.monitorDot} />
                <span className={styles.monitorTitle}>OFFICIAL DIRECTIVE</span>
              </div>
              <p className={styles.monitorContent}>
                System genel güvenliğini tehdit eden bozucu unsurlar tespit edilmiştir. Portal ağlarındaki yetkisiz hareketleri anında <span className={styles.monitorHighlight}>Emniyet Birimlerine</span> bildirin.
              </p>
            </div>

            <div className={styles.broadcastMonitor} style={{ borderColor: "#ff3b3b" }}>
              <div className={styles.monitorHeader}>
                <span className={styles.monitorDot} style={{ backgroundColor: "#ff3b3b", boxShadow: "0 0 6px #ff3b3b" }} />
                <span className={styles.monitorTitle} style={{ color: "#ff3b3b" }}>WANTED ANNOUNCEMENT</span>
              </div>
              <p className={styles.monitorContent}>
                Algus, Kevin, Mike ve Mina. Şirketler Birliği ile iş birliği yaparak Core sistemine sızma girişiminde bulunmuşlardır. Yerlerini bildirenlere büyük <span className={styles.monitorHighlight} style={{ color: "#ff3b3b" }}>Iohcoin ödülü</span> verilecektir.
              </p>
            </div>
          </div>
        </section>

        {/* 12. “Swos vs Corporate Union” Bölümü */}
        <section className={styles.dividedSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>GLOBAL CONFLICT</span>
            <h2 className={styles.sectionTitle}>The Divided World</h2>
            <p className={styles.sectionSlogan}>States Union vs Corporate Union</p>
          </div>

          <div className={styles.dividedGrid}>
            <div className={styles.dividedCol}>
              <h3 className={styles.dividedTitle}>SWOS (States Union)</h3>
              <p className={styles.dividedDesc}>
                Eski ulusların federal mirasını kuantum dünyasında sürdüren, sınırları devlet disiplini, veri kalkanları ve para çekirdekleriyle kontrol eden merkeziyetçi mekanizma.
              </p>
            </div>

            <div className={styles.dividedSplitter} />

            <div className={`${styles.dividedCol} ${styles.dividedColRight}`}>
              <h3 className={styles.dividedTitleRight}>Corporate Union</h3>
              <p className={styles.dividedDesc}>
                Şehirleri, veri sunucularını ve siber lojistik ağlarını satın alan, geleceği parayla pazarlayan beş büyük oligarşik holdingin gevşek iş birliği yapısı.
              </p>
            </div>
          </div>
        </section>

        {/* 13. “Crisis Archive” Bölümü */}
        <section id="crisis" className={styles.crisisSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>CLASSIFIED INTEL</span>
            <h2 className={styles.sectionTitle}>Crisis Archive</h2>
            <p className={styles.sectionSlogan}>
              {isLeaked ? "// SYSTEM FAILURE CHRONOLOGICAL FILES" : "// OFFICIAL INCIDENT RESOLUTION LOGS"}
            </p>
          </div>

          <div className={styles.crisisList}>
            {swosData.crisisArchive.map((item) => (
              <div key={item.id} className={styles.crisisItem}>
                <div 
                  className={styles.crisisItemSummary}
                  onClick={() => setOpenCrisis(openCrisis === item.id ? null : item.id)}
                >
                  <div className={styles.crisisMeta}>
                    <span className={styles.crisisId}>{item.id}</span>
                    <span className={styles.crisisTitleText}>{item.title}</span>
                  </div>
                  <span className={`${styles.crisisSeverityBadge} ${item.severity === "critical" ? styles.severityCritical : styles.severityHigh}`}>
                    {item.severity}
                  </span>
                </div>
                
                {openCrisis === item.id && (
                  <div className={styles.crisisItemContent}>
                    <div className={styles.crisisColumn}>
                      <h5 className="text-[#7aa7ff]">// OFFICIAL STATE LOG</h5>
                      <p className="text-xs text-[#8b949e]">{item.publicVersion}</p>
                    </div>
                    <div className={styles.crisisColumn} style={{ borderLeft: "1px solid rgba(48, 54, 61, 0.4)", paddingLeft: "2rem" }}>
                      <h5 className="text-[#ff3b3b]">// LEAKED SYSTEM REALITY</h5>
                      <p className="text-xs text-red-400/80">{item.classifiedVersion}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 14. En Alt: “SWOS nedir?” - Manifesto */}
        <section className={styles.finalSection}>
          <div className={styles.finalContent}>
            <h2 className={styles.finalTitle}>SWOS Nedir?</h2>
            
            <p className={styles.finalParagraph}>
              SWOS — System World States Union — Great Collapse sonrası eski ulusların mirasını yutarak doğan federal yönetim mekanizmasıdır.
            </p>
            
            <p className={styles.finalParagraph}>
              Kendisini düzenin, güvenliğin ve sürekliliğin temsilcisi olarak tanımlar. System içindeki kuantum şehirleri, eski dünyaya bağlı ekonomik kayıtları, para çekirdeklerini, bakanlık ağlarını ve askerî komuta gridlerini tek merkezden yönetir.
            </p>

            <p className={styles.finalHighlight}>
              "Şirketler Birliği dünyayı satın aldıysa, SWOS dünyayı kayıt altına aldı. Biri geleceği pazarlar, diğeri geleceğe izin verir."
            </p>

            <p className={styles.finalParagraph}>
              SWOS’un vaadi basittir: Kaosun geri dönmesini engellemek. Fakat bu vaadin bedeli ağırdır. Çünkü SWOS için güvenlik yalnızca koruma değildir; izleme, sınırlama ve gerektiğinde bastırma hakkıdır. Ölümden sonra bile insan, onun kayıt sisteminden çıkamaz. Beden değişir, şehir değişir, varoluş biçimi değişir; fakat otorite değişmez.
            </p>

            <p className={styles.finalSlogan}>
              THE STATE DID NOT SURVIVE THE COLLAPSE. IT BECAME THE COLLAPSE.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <BooksIndexFooter context="encyclopedia" />

      {/* Global Lightbox Modal viewport */}
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
              alt="State Document Telemetry Viewport Zoomed"
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
