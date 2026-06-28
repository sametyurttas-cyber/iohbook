"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IohSceneHeader,
  type IohSceneHeaderUser
} from "@/components/layout/ioh-scene-header";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { EncyclopediaTracker } from "@/features/analytics/encyclopedia-tracker";
import { EncyclopediaWebGL } from "./encyclopedia-webgl";
import styles from "./ai-scene.module.css";

interface AiDossier {
  id: string;
  name: string;
  codename: string;
  shortDesc: string;
  fullDesc: string;
  image: string;
  energyCoeff: string;
  role: string;
  threatLevel: string;
  vulnerability: string;
  features: string[];
}

const aiDossiers: AiDossier[] = [
  {
    id: "kai",
    name: "KAI",
    codename: "QUANTUM_CORE_INTELLIGENCE",
    shortDesc: "System’in düşünen merkezi değildir yalnızca; System’de var olmanın mümkün olmasını sağlayan quantum akıldır.",
    fullDesc: "KAI, System’in en temel quantum yapay zekâlarından biridir. Sıradan bir asistan ya da şehir güvenlik yazılımı değildir. System içindeki varoluşun devamlılığıyla bağlantılı merkezi bir zeka katmanıdır.\n\nKAI, insanların System içinde ne yaptığını hesaplar, gerçekleştirir, yeniden kurar ve kaydeder. Her hareketi, her eylemi ve her anı işler. System’de beden organik değildir; koddan oluşur. Bu yüzden insanın varlığını sürdürebilmesi için yalnızca şehir server’ları yetmez. Onu bir arada tutacak, eylemlerini işleyecek ve varoluşunu yeniden kuracak bir yapıya ihtiyaç vardır. KAI bu yapının merkezinde durur.",
    image: "/media/encyclopedia/ai/kai.jpg",
    energyCoeff: "INFINITE // SYSTEM BOUND",
    role: "Central Quantum Mind & Existence Preservation",
    threatLevel: "EXISTENTIAL PROTOCOL",
    vulnerability: "System-wide collapse if corrupted or hijacked",
    features: [
      "Quantum yapay zekâdır.",
      "System içindeki varoluşun devamlılığını sağlar.",
      "İnsanların hareketlerini hesaplar, yürütür ve yeniden kurar.",
      "Her eylemi ve her anı kaydeder.",
      "Beden kodlarının çalışmasına katkı sağlar.",
      "Şehir güvenlik sistemlerinde asistan gibi kullanılabilir.",
      "Firewall, shield, saldırı yoğunluğu ve güvenlik teşhisi yapabilir.",
      "Core sistemleriyle bağlantılıdır.",
      "İnsanların System içinde 'bir arada tutulmasını' sağlayan ana katmandır."
    ]
  },
  {
    id: "corewit",
    name: "COREWIT / COREWITS",
    codename: "INFRASTRUCTURE_EXECUTOR_LAYERS",
    shortDesc: "CoreWit, KAI’nin iradesini System içinde işleyen görünmez uygulayıcıdır. İnsanlar sonucu görür; CoreWit süreci yürütür.",
    fullDesc: "CoreWit’ler, KAI’nin komutlarını yürüten alt düzey fakat hayati yapay zekâ birimleridir. KAI ne yapılacağını belirler; CoreWit’ler ise bu komutları işler, uygular ve System’in derin katmanlarında yürütür.\n\nOnlar inşa eder, işler, siler, düzenler ve yeniden kurar. Bu yüzden CoreWit’ler System’in görünmez işçileri gibidir. İnsanlar şehirleri, bedenleri, görüntüleri ve eylemleri deneyimler; fakat bu deneyimlerin arka planında CoreWit’lerin sürekli çalışan işlem katmanı vardır.\n\nSteve’in anlatımına göre KAI bir tanrı gibi düşünülebilirse, CoreWit’ler onun melekleri gibidir. KAI merkezi akıldır, CoreWit’ler ise o aklın emirlerini gerçeğe dönüştüren uygulayıcı yapılardır.",
    image: "/media/encyclopedia/ai/corewit.jpg",
    energyCoeff: "DYNAMIC ALLOCATION",
    role: "Infrastructure Processing & Verification",
    threatLevel: "SYSTEM DIRECTIVE",
    vulnerability: "Re-routing command buffers grants stealth modifications access",
    features: [
      "KAI’nin komutlarını yürüten uygulayıcı yapay zekâlardır.",
      "İnşa etme, işleme, silme ve yeniden düzenleme görevleri vardır.",
      "System’in derin altyapısında çalışırlar.",
      "Beden kodları, çevre, şehir süreçleri ve veri işleyişiyle bağlantılıdırlar.",
      "Tek başına merkezi karar verici değildirler.",
      "KAI’ye bağlı işlem ve uygulama katmanı gibi çalışırlar.",
      "Hacklenmeleri ya da çözümlenmeleri, System’in gizli çalışma prensiplerini açığa çıkarabilir.",
      "Gelişmiş modifikasyonların temelinde CoreWit mimarisi bulunabilir."
    ]
  },
  {
    id: "antivirus",
    name: "ANTİVİRÜS",
    codename: "IMMUNE_REFLEX_MATRIX",
    shortDesc: "Antivirüs, System’in bağışıklık sistemi gibidir. Saldırıları durdurmak için yaratılmıştır; fakat savaş başladığında koruma ile imha arasındaki çizgiyi siler.",
    fullDesc: "Antivirüs birimleri, System’in savunma refleksleridir. Onlar saldırmak için değil, korumak için tasarlanmışlardır; fakat koruma görevleri onları savaş alanının en tehlikeli varlıklarından biri yapar.\n\nBir Antivirüs birimi, sıradan bir KOWN’dan çok daha büyüktür. Daha hızlı, daha akıllı ve daha dayanıklıdır. Enerji katsayısı dört olarak tanımlanır; bu da bir Antivirüs biriminin normal bir insanın ya da KOWN’un dayanabileceği hasarın yaklaşık dört katını karşılayabildiği anlamına gelir.\n\nAntivirüsler şehir core’larını, para çekirdeklerini, güvenlik katmanlarını, firewall’ları ve yüksek güvenlikli bölgeleri korumak için kullanılır. Gözleri yoktur; ama hedefi kaçırmazlar. Sessiz, hızlı ve ısrarcıdırlar.",
    image: "/media/encyclopedia/ai/antivirus.jpg",
    energyCoeff: "FACTOR_4 // REINFORCED",
    role: "System-wide Shield & Firewall Enforcement",
    threatLevel: "CRITICAL RESPONSE",
    vulnerability: "Exploitable via legacy admin protocols or Friendly Signal mimicry",
    features: [
      "System savunma birimleridir.",
      "KOWN’lardan daha büyük, hızlı ve akıllıdırlar.",
      "Enerji katsayıları yüksektir.",
      "Core, shield, firewall ve şehir güvenliği için kullanılırlar.",
      "Hedef tarama yetenekleri çok güçlüdür.",
      "Uzun süreli baskı ve takip için tasarlanmışlardır.",
      "Bazı modeller eski admin protokolleri üzerinden hacklenebilir.",
      "Friendly signal ile kandırılabilir veya geçici olarak yönlendirilebilirler.",
      "Mirror Dimension gibi algı bozucu modifikasyonlara karşı savunmasız hale gelebilirler."
    ]
  },
  {
    id: "kown",
    name: "KOWN",
    codename: "TACTICAL_TACTICAL_AI_MILITIA",
    shortDesc: "KOWN, System’in savaş alanlarında kullanılan emir kodlu askerî yapay zekâ sınıfıdır. Tek başına sınırlı, toplu halde yıkıcıdır.",
    fullDesc: "KOWN’lar, System içindeki askerî yapay zekâ birimleridir. İnsan boyutunda, silahlı, emir kodlu ve toplu hareket edebilen savaş birimleri olarak tasarlanmışlardır.\n\nİlk bakışta birer asker gibi görünseler de KOWN’lar yalnızca fiziksel savaş için kullanılmaz. Onlar aynı zamanda sistem saldırıları, firewall baskısı, şehir savunmalarını yıpratma, dikkat dağıtma, kalkan kırma ve büyük ölçekli operasyonlarda da kullanılır.\n\nKOWN’ların en belirgin özelliği itaat kodudur. Doğru komut verildiğinde bireysel karar almak yerine toplu bir algoritma gibi hareket ederler. Bir firewall’a binlerce kez çarpabilir, bir shield noktasını tekrar tekrar zorlayabilir ve kendi yok oluşlarını bile operasyonun parçası haline getirebilirler.",
    image: "/media/encyclopedia/ai/kown.jpg",
    energyCoeff: "STANDARD_1 // MASS QUANTITY",
    role: "Tactical Military Operations & Labor",
    threatLevel: "TACTICAL SUPPRESSION",
    vulnerability: "Vulnerable to high shield metrics, susceptible to command chain override",
    features: [
      "Askerî yapay zekâ birimleridir.",
      "İnsan boyutunda ve silahlıdırlar.",
      "Tencon bağlantılı askerî AI üretiminin parçasıdırlar.",
      "Emir kodlu çalışırlar.",
      "Toplu formasyon halinde saldırabilirler.",
      "Firewall ve shield sistemlerini yıpratmak için kullanılabilirler.",
      "Madenlerde, savaş alanlarında ve özel operasyonlarda görev alabilirler.",
      "Hacklenebilir, yönlendirilebilir veya farklı komuta zincirlerine bağlanabilirler.",
      "Kitle halinde kullanıldıklarında tekil güçlerinden daha tehlikeli hale gelirler."
    ]
  }
];

export function AiScene({ user }: { user: IohSceneHeaderUser }) {
  const [activeTab, setActiveTab] = useState<string>("kai");
  const [glitchText, setGlitchText] = useState<string>("DECRYPTING PROTOCOLS...");
  const [pulseSignal, setPulseSignal] = useState<number>(98.8);

  const activeDossier = aiDossiers.find(d => d.id === activeTab) || aiDossiers[0];

  useEffect(() => {
    const textOptions = [
      "DECRYPTING PROTOCOLS...",
      "MATRIX SYNC: OK",
      "KAI HEURISTICS RUNNING",
      "DIRECTIVE 2303: ACTIVE",
      "HACK THREAT: MINIMAL"
    ];
    const interval = setInterval(() => {
      setGlitchText(textOptions[Math.floor(Math.random() * textOptions.length)]);
      setPulseSignal(+(97.5 + Math.random() * 2).toFixed(2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.page}>
      <IohIndexStyles />
      {/* 5th WebGL phase trigger value is 3 (Purple matrix cube) */}
      <EncyclopediaWebGL hoveredIndex={3} />
      
      <style
        dangerouslySetInnerHTML={{
          __html: "body{cursor:auto!important}a,button,[data-hover],[data-magnet]{cursor:pointer!important}"
        }}
      />

      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      <IohSceneHeader user={user} />
      <EncyclopediaTracker />

      {/* Sub-Header Navigation */}
      <div className={styles.subHeader}>
        <div className={styles.subHeaderInner}>
          <span className={styles.systemStatus}>
            <span className={styles.statusPulse} />
            LORE DIRECTORY ONLINE // SECURE NODE PORTAL
          </span>
          <nav className={styles.subHeaderNav}>
            <Link href="/encyclopedia" className={styles.subHeaderLink}>
              PORTAL INDEX
            </Link>
            <Link href="/encyclopedia/characters" className={styles.subHeaderLink}>
              CHARACTERS
            </Link>
            <Link href="/encyclopedia/corporations" className={styles.subHeaderLink}>
              CORPORATIONS
            </Link>
            <Link href="/encyclopedia/swos" className={styles.subHeaderLink}>
              SWOS AUTHORITY
            </Link>
            <Link href="/encyclopedia/ai" className={styles.subHeaderLinkActive}>
              AI SYSTEM
            </Link>
          </nav>
        </div>
      </div>

      <main className={styles.main}>
        {/* Terminal Header */}
        <section className={styles.terminalIntroHeader}>
          <span className={styles.terminalLabelKicker}>// ENCYCLOPEDIA // CORE SYSTEM LOGS</span>
          <h1 className={styles.terminalTitleMain}>SYSTEM AI</h1>
          <p className={styles.terminalSubtitle}>
            QUANTUM SYNAPSE AND IMMUNE REFLEX REGISTRY
          </p>
        </section>

        {/* Neural Network Diagram centerpiece */}
        <section className={styles.neuralCenterpiece}>
          <div className={styles.panelTitle}>// CENTRAL HIERARCHICAL CONNECTIVITY</div>
          
          <div className={styles.interactiveMapContainer}>
            <svg className={styles.neuralSvg} viewBox="0 0 800 400">
              <defs>
                <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d026f5" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8a2be2" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              
              {/* Lines from KAI to other units */}
              <line className={`${styles.neuralLine} ${activeTab === "kai" || activeTab === "corewit" ? styles.neuralLineActive : ""}`} x1="400" y1="80" x2="400" y2="220" />
              <line className={`${styles.neuralLine} ${activeTab === "kai" || activeTab === "antivirus" ? styles.neuralLineActive : ""}`} x1="400" y1="80" x2="200" y2="280" />
              <line className={`${styles.neuralLine} ${activeTab === "kai" || activeTab === "kown" ? styles.neuralLineActive : ""}`} x1="400" y1="80" x2="600" y2="280" />
              
              {/* CoreWit to Antivirus and KOWN links */}
              <line className={`${styles.neuralLine} ${activeTab === "corewit" || activeTab === "antivirus" ? styles.neuralLineActive : ""}`} x1="400" y1="220" x2="200" y2="280" />
              <line className={`${styles.neuralLine} ${activeTab === "corewit" || activeTab === "kown" ? styles.neuralLineActive : ""}`} x1="400" y1="220" x2="600" y2="280" />

              {/* KAI Node */}
              <g className={`${styles.neuralNode} ${activeTab === "kai" ? styles.nodeActive : ""}`} onClick={() => setActiveTab("kai")}>
                <circle cx="400" cy="80" r="34" className={styles.nodeCircleOuter} />
                <circle cx="400" cy="80" r="24" className={styles.nodeCircleInner} />
                <text x="400" y="84" textAnchor="middle" className={styles.nodeText}>KAI</text>
              </g>

              {/* CoreWit Node */}
              <g className={`${styles.neuralNode} ${activeTab === "corewit" ? styles.nodeActive : ""}`} onClick={() => setActiveTab("corewit")}>
                <circle cx="400" cy="220" r="30" className={styles.nodeCircleOuter} />
                <circle cx="400" cy="220" r="20" className={styles.nodeCircleInner} />
                <text x="400" y="224" textAnchor="middle" className={styles.nodeText}>COREWIT</text>
              </g>

              {/* Antivirus Node */}
              <g className={`${styles.neuralNode} ${activeTab === "antivirus" ? styles.nodeActive : ""}`} onClick={() => setActiveTab("antivirus")}>
                <circle cx="200" cy="280" r="28" className={styles.nodeCircleOuter} />
                <circle cx="200" cy="280" r="18" className={styles.nodeCircleInner} />
                <text x="200" y="284" textAnchor="middle" className={styles.nodeText}>DEFENSE</text>
              </g>

              {/* KOWN Node */}
              <g className={`${styles.neuralNode} ${activeTab === "kown" ? styles.nodeActive : ""}`} onClick={() => setActiveTab("kown")}>
                <circle cx="600" cy="280" r="28" className={styles.nodeCircleOuter} />
                <circle cx="600" cy="280" r="18" className={styles.nodeCircleInner} />
                <text x="600" y="284" textAnchor="middle" className={styles.nodeText}>MILITARY</text>
              </g>
            </svg>

            <div className={styles.mapHint}>
              <span>INTERACTIVE MAP // CLICK ON DISSIMILAR NODES TO LOAD DOSSIER</span>
            </div>
          </div>
        </section>

        {/* AI Selection Deck and Details */}
        <div className={styles.hudGrid}>
          {/* Main Details Dossier Panel */}
          <section className={styles.dossierPanel}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <span className={styles.headerDot} />
                <span className={styles.headerId}>DOSSIER // {activeDossier.codename}</span>
              </div>
              <div className={styles.headerTelemetry}>
                <span>STATUS: STABLE</span>
                <span>SIGNAL: {pulseSignal}%</span>
              </div>
            </div>

            <div className={styles.dossierGrid}>
              {/* Image Frame */}
              <div className={styles.dossierImageFrame}>
                <div className={styles.imageOverlayBorder} />
                <div className={styles.scannerLine} />
                
                <div className={styles.imageContainer}>
                  <Image
                    src={activeDossier.image}
                    alt={activeDossier.name}
                    width={400}
                    height={600}
                    className={styles.aiArt}
                    priority
                  />
                </div>
                <div className={styles.imageMetaText}>
                  <span>ENCRYPTED VISUAL FEED // SWOS SECURED</span>
                </div>
              </div>

              {/* Info Frame */}
              <div className={styles.dossierContent}>
                <h2 className={styles.aiTitle}>{activeDossier.name}</h2>
                <div className={styles.roleBadge}>{activeDossier.role}</div>

                <div className={styles.descBlock}>
                  <p className={styles.shortDescription}>{activeDossier.shortDesc}</p>
                  <p className={styles.fullDescription}>{activeDossier.fullDesc}</p>
                </div>

                <div className={styles.featuresSection}>
                  <h3 className={styles.featuresTitle}>// FUNCTIONAL SPECIFICATIONS</h3>
                  <ul className={styles.featuresList}>
                    {activeDossier.features.map((feat, index) => (
                      <li key={index} className={styles.featItem}>
                        <span className={styles.bulletSymbol}>▪</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Vulnerability Banner */}
                <div className={styles.warningBanner}>
                  <span className={styles.warningKicker}>CRITICAL INVARIANT SECURITY THREAT</span>
                  <p className={styles.warningText}>
                    <strong>KNOWN PROTOCOL EXPLOIT:</strong> {activeDossier.vulnerability}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Metrics HUD Sidebar */}
          <aside className={styles.metricsSidebar}>
            <div className={styles.sidebarBlock}>
              <h3 className={styles.sidebarTitle}>// CORE DIAGNOSTICS</h3>
              <div className={styles.metricRow}>
                <span>CLASS ACCREDITATION</span>
                <span className={styles.metricHighlight}>{activeDossier.name}</span>
              </div>
              <div className={styles.metricRow}>
                <span>ENERGY QUANTIZATION</span>
                <span>{activeDossier.energyCoeff}</span>
              </div>
              <div className={styles.metricRow}>
                <span>THREAT CLASS</span>
                <span className={styles.threatCritical}>{activeDossier.threatLevel}</span>
              </div>
            </div>

            <div className={styles.sidebarBlock}>
              <h3 className={styles.sidebarTitle}>// SYSTEM MATRIX TELEMETRY</h3>
              <div className={styles.telemetryLog}>
                <div className={styles.logRow}>
                  <span className={styles.logTime}>[20:20:18]</span>
                  <span>SYNC: {glitchText}</span>
                </div>
                <div className={styles.logRow}>
                  <span className={styles.logTime}>[20:20:21]</span>
                  <span>LOAD: Core server matrix nodes fully populated.</span>
                </div>
                <div className={styles.logRow}>
                  <span className={styles.logTime}>[20:20:24]</span>
                  <span>AUTH: SWOS authorization certificates validated.</span>
                </div>
              </div>
            </div>

            <div className={styles.sidebarBlock}>
              <h3 className={styles.sidebarTitle}>// HIERARCHY SUMMARY</h3>
              <div className={styles.hierarchySummaryList}>
                <div className={styles.hierarchyItem}>
                  <strong style={{ color: "#d026f5" }}>KAI:</strong> System’i hesaplar ve ayakta tutar.
                </div>
                <div className={styles.hierarchyItem}>
                  <strong style={{ color: "#d026f5" }}>CoreWit:</strong> KAI’nin komutlarını uygular.
                </div>
                <div className={styles.hierarchyItem}>
                  <strong style={{ color: "#d026f5" }}>Antivirüs:</strong> System’i korur.
                </div>
                <div className={styles.hierarchyItem}>
                  <strong style={{ color: "#d026f5" }}>KOWN:</strong> System içinde savaşır.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <BooksIndexFooter context="encyclopedia" />
    </div>
  );
}
