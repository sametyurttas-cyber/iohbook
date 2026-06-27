import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { getCurrentProfile, getCurrentUser, getHeaderUserView } from "@/features/auth/queries";
import { getIohPointBalanceForProfile } from "@/features/points/queries";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { listActiveTokenCampaigns, type TokenCampaignWithPackages } from "@/features/token-sale/queries";
import { formatTokenAmount } from "@/features/token-sale/utils";
import styles from "./token-sale-scene.module.css";
import { TokenSaleWebglCoin } from "./token-sale-webgl-coin";
import { PackageCardClient } from "./package-card-client";
import { GenesisCountdown } from "./genesis-countdown";
import { IohSceneHeader } from "@/components/layout/ioh-scene-header";

const usageCards = [
  {
    description: "IOHcoin is the digital backbone of the IOH Universe. From books and communities to collectibles and future metaverse layers, the entire ecosystem is designed to grow on the same foundation. What appears as a point today, may become the common language of tomorrow's universe.",
    number: "01",
    status: "FOUNDATION",
    title: "WHAT IS IOHCOIN?"
  },
  {
    description: "Because Genesis only happens once. IOHcoin allocations are designed for the first generation entering the ecosystem before it becomes public. Some people enter a world after it has already been built. Others become part of those who built it.",
    number: "02",
    status: "GENESIS",
    title: "WHY NOW?"
  },
  {
    description: "Today's IOH Points form the foundation of tomorrow's IOHcoin layer. Once the countdown reaches zero, conversion, transfers and additional ecosystem features are planned to become available in phases. Every allocation secured today becomes part of your future starting point.",
    number: "03",
    status: "TRANSITION",
    title: "POINTS → IOHCOIN"
  },
  {
    description: "IOHcoin is designed not only for today, but for the layers yet to come. Digital collectibles, community systems, exclusive content, metaverse experiences and future access layers will gradually become part of the ecosystem. This is only the beginning.",
    number: "04",
    status: "PLANNED",
    title: "FUTURE LAYERS"
  }
] as const;

function Kicker({ children, id }: { children: ReactNode; id?: string }) {
  return <p className={styles.kicker} id={id}>{children}</p>;
}



function TokenSaleHero() {
  return (
    <section className={styles.hero} id="coin">
      <div className={styles.heroGhost} aria-hidden="true">
        IOHCOIN
      </div>
      <div className={styles.heroGrid} aria-hidden="true" />
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.heroShell}>
        <div className={styles.heroCoin} id="ts-hero-coin">
          <div className={styles.coinGlow} aria-hidden="true" />
          <div className={styles.coinCore}>
            <Image
              alt="IOHcoin digital access layer icon"
              fill
              priority
              sizes="(min-width: 1024px) 240px, (min-width: 760px) 220px, 55vw"
              src="/media/token/iohcoin-token.png"
            />
          </div>
        </div>
        <div className={styles.heroContent}>
          <Kicker id="ts-hero-kicker">IOHCOIN / GENESIS LAUNCH</Kicker>
          <h1 className={styles.heroTitle} id="ts-hero-title" data-split>IOHCOIN</h1>
          <p className={styles.heroLead} id="ts-hero-lead">
            Every great world begins with a small signal.
            <br />
            IOHcoin is more than a digital asset. It is the first fragment of the future IOH civilization,
            the foundation of the metaverse layers yet to be opened,
            the beginning of a new digital economy, and the first piece of a world that does not yet exist.
            <br />
            Most people enter a world only after it has already been built.
            <br />
            Genesis Phase exists for those who were there while the world was still being created.
          </p>
          <div className={styles.heroActions} id="ts-hero-actions">
            <a className={styles.primaryButton} href="#campaigns">
              Explore Packages
            </a>
            <Link className={styles.secondaryButton} href="/books">
              Explore Books
            </Link>
          </div>
        </div>
      </div>
      <div className={styles.heroCoordinates} id="ts-hero-coordinates" aria-hidden="true">
        <span>SYSTEM / SYS GOD GRID</span>
        <span>SECTOR: 02_COIN</span>
        <span>STATUS: GENESIS PHASE</span>
      </div>
    </section>
  );
}

function TokenSaleManifesto() {
  return (
    <section className={styles.manifesto}>
      <div className={styles.manifestoInner} id="ts-manifesto">
        <p>
          IOHcoin is the <em>digital civilization</em> layer that forms the foundation of the IOH Universe.
        </p>
        <p className={styles.manifestoNote}>
          The books were only the beginning.
          <br />
          <br />
          IOHcoin is the common language of the future economy, the communities yet to be formed, digital collectibles, and the metaverse layers still waiting to be opened.
          <br />
          <br />
          Genesis Phase exists for those who choose to help build the world, rather than simply arrive after it is finished.
        </p>
      </div>
    </section>
  );
}

function TokenSaleMarquee() {
  return (
    <div className={styles.marquee} aria-hidden="true">
      <div>
        <span>IOHCOIN / GENESIS LAUNCH / IOH UNIVERSE / EARLY ACCESS / COMMUNITY ALLOCATION /</span>
        <span>IOHCOIN / GENESIS LAUNCH / IOH UNIVERSE / EARLY ACCESS / COMMUNITY ALLOCATION /</span>
      </div>
    </div>
  );
}

function TokenSaleUsage() {
  return (
    <section className={styles.usage}>
      <div className={styles.shell}>
        <div className={styles.usageHeader} id="ts-usage-header">
          <Kicker>02 / ECOSYSTEM UTILITY</Kicker>
          <h2>THE ROAD TO THE UNIVERSE.</h2>
        </div>
        <div className={styles.usageGrid} id="ts-usage-grid">
          {usageCards.map((card) => (
            <article className={styles.usageCard} key={card.number}>
              <div className={styles.usageCardTop}>
                <span className={styles.usageCardNumber}>/ {card.number}</span>
                <span className={styles.usageCardStatus}>{card.status}</span>
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TokenSaleCampaigns({
  campaigns,
  searchParams
}: {
  campaigns: TokenCampaignWithPackages[];
  searchParams?: {
    package_id?: string;
    quantity?: string;
  };
}) {
  return (
    <section className={styles.campaigns} id="campaigns">
      <div className={styles.shell}>
        <div className={styles.campaignsHeader} id="ts-campaigns-header">
          <Kicker>03 / PACKAGES</Kicker>
          <h2>IOHCOIN PACKAGES</h2>
          <p className={styles.campaignsLead}>
            Allocations acquired during the Genesis Phase secure your place among the first generation of the IOH Universe.
            <br />
            <br />
            Once payment is confirmed, your allocations are securely recorded within your account. Wallet connectivity is not required during this phase, while additional utility and transfer layers are expected to become available throughout future ecosystem stages.
          </p>
        </div>

        {campaigns.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>IOH</div>
            <h3>No active campaigns found</h3>
            <p>
              Packages will appear here once an active campaign is created. The purchase flow is currently closed.
            </p>
          </div>
        ) : null}

        {campaigns.map((campaign) => (
          <article className={styles.campaignCard} key={campaign.id}>
            <div className={styles.campaignHead}>
              <div>
                <span className={styles.campaignSymbol}>{campaign.token_symbol}</span>
                <h2 className={styles.campaignTitle}>{campaign.title}</h2>
                <p className={styles.campaignDesc}>{campaign.description}</p>
              </div>
              <div className={styles.campaignMeta}>
                <span>Bonus <b>%{campaign.bonus_bps / 100}</b></span>
                <span>Limit <b>{formatTokenAmount(campaign.total_sale_limit)}</b></span>
              </div>
            </div>
            <div className={styles.packageGrid}>
              {campaign.token_sale_packages.map((pkg, index) => (
                <PackageCardClient
                  campaign={campaign}
                  index={index}
                  key={pkg.id}
                  pkg={pkg}
                  defaultQuantity={
                    searchParams?.package_id === pkg.id && searchParams?.quantity
                      ? parseInt(searchParams.quantity, 10)
                      : 1
                  }
                />
              ))}
            </div>
          </article>
        ))}

        {campaigns.length > 0 ? (
          <div className={styles.walletStation} id="ts-wallet-station">
            <div className={styles.walletStationHeader}>
              <Kicker>04 / OPTIONAL WALLET LAYER</Kicker>
              <h3 className={styles.walletStationTitle}>SYSTEM WALLET SIGNAL STATION</h3>
              <p className={styles.campaignsLead}>
                Wallet connectivity is not required for purchases. This section remains as an optional layer for future ecosystem interactions.
              </p>
            </div>
            <div className={styles.walletStationGrid}>
              <div className={styles.walletInputWrapper}>
                <input
                  autoComplete="off"
                  className={styles.walletInput}
                  id="ts-wallet-input"
                  placeholder="Optional: Wallet address starting with 0x"
                  spellCheck="false"
                  type="text"
                />
              </div>
              <button
                className={styles.walletConnectBtn}
                id="ts-wallet-connect-btn"
                type="button"
              >
                Initialize Connection
              </button>
            </div>
            <div className={styles.walletTelemetry}>
              <span>OPTIONAL: <strong id="ts-wallet-status-text">NOT REQUIRED FOR PURCHASE</strong></span>
              <span>NETWORK: <b>IOH SECURE CHAIN</b></span>
            </div>
          </div>
        ) : null}

      </div>
    </section>
  );
}

function TokenSaleTrust() {
  return (
    <section className={styles.trust}>
      <div className={styles.trustInner}>
        <div className={styles.trustHeader}>05 / TRUST INFORMATION</div>
        <ul className={styles.trustList} id="ts-trust-list">
          <li className={styles.trustItem}>
            <span className={styles.trustNumber}>01</span>
            <span>
              IOHcoin is being built as the future digital currency of the IOH Universe. During the Genesis Phase, all acquired allocations remain protected inside your account as IOH Points until the ecosystem enters its next stage.
            </span>
          </li>
          <li className={styles.trustItem}>
            <span className={styles.trustNumber}>02</span>
            <span>
              When the countdown reaches zero, IOH Points are planned to transition into IOHcoin, unlocking wallet connectivity, transfers and broader ecosystem interactions over time. Public market participation belongs to later phases of the roadmap.
            </span>
          </li>
          <li className={styles.trustItem}>
            <span className={styles.trustNumber}>03</span>
            <span>
              Genesis is the era before the world fully opens. Every allocation secured during this stage becomes part of the foundation upon which the future IOH ecosystem will be built.
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}

function TokenSaleRoadmap() {
  const phases = [
    {
      number: "I",
      name: "GENESIS",
      status: "COMPLETED",
      accent: styles.phaseGenesis,
      items: [
        { done: true, label: "Books Published" },
        { done: true, label: "Community Created" },
        { done: true, label: "Genesis Allocations Active" },
        { done: true, label: "IOH Ecosystem Launch" }
      ]
    },
    {
      number: "II",
      name: "ACTIVATION",
      status: "PLANNED",
      accent: styles.phaseActivation,
      items: [
        { done: false, label: "IOH Points → IOHcoin Conversion" },
        { done: false, label: "Wallet Connectivity" },
        { done: false, label: "Transfer Activation" },
        { done: false, label: "User-to-User Trading" }
      ]
    },
    {
      number: "III",
      name: "EXPANSION",
      status: "PLANNED",
      accent: styles.phaseExpansion,
      items: [
        { done: false, label: "Global Community Growth" },
        { done: false, label: "Creator Economy" },
        { done: false, label: "Ecosystem Partnerships" },
        { done: false, label: "Cross-Platform Integrations" }
      ]
    },
    {
      number: "IV",
      name: "METAVERSE",
      status: "PLANNED",
      accent: styles.phaseMetaverse,
      items: [
        { done: false, label: "Digital Cities" },
        { done: false, label: "Persistent Worlds" },
        { done: false, label: "Identity Systems" },
        { done: false, label: "Interactive IOH Experiences" }
      ]
    }
  ];

  return (
    <section className={styles.roadmap} id="roadmap">
      <div className={styles.shell}>
        <div className={styles.roadmapHeader} id="ts-roadmap-header">
          <Kicker>06 / ECOSYSTEM ROADMAP</Kicker>
          <h2>THE EVOLUTION OF IOH</h2>
        </div>
        <div className={styles.roadmapGrid} id="ts-roadmap-grid">
          {phases.map((phase) => (
            <div key={phase.number} className={`${styles.roadmapCard} ${phase.accent}`}>
              <div className={styles.roadmapCardTop}>
                <span className={styles.roadmapPhaseNumber}>PHASE {phase.number}</span>
                <span className={styles.roadmapPhaseStatus}>{phase.status}</span>
              </div>
              <h3 className={styles.roadmapPhaseName}>{phase.name}</h3>
              <ul className={styles.roadmapList}>
                {phase.items.map((item, idx) => (
                  <li key={idx} className={item.done ? styles.roadmapItemDone : styles.roadmapItemTodo}>
                    <span className={styles.roadmapItemIcon}>
                      {item.done ? "✓" : "○"}
                    </span>
                    <span className={styles.roadmapItemLabel}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TokenSaleCommunity() {
  return (
    <section className={styles.community} id="community">
      <div className={styles.shell}>
        <div className={styles.communityInner} id="ts-community-inner">
          <div className={styles.communityGlow} aria-hidden="true" />
          <Kicker>07 / COMMUNITY ALLIANCE</Kicker>
          <h2 className={styles.communityTitle}>JOIN THE CIVILIZATION</h2>
          <p className={styles.communityLead}>
            Genesis is only the first brick. Connect with other creators, developers, and readers to shape the future of the IOH Universe. Join the alliance today.
          </p>
          <div className={styles.communityLinks} id="ts-community-links">
            <a href="https://t.me/iohbook" target="_blank" rel="noopener noreferrer" className={styles.communityLinkCard} data-hover data-magnet>
              <span className={styles.communityPlatformSymbol}>TG</span>
              <span className={styles.communityPlatformLabel}>Telegram</span>
              <span className={styles.communityPlatformStatus}>Join Chat</span>
            </a>
            <a href="https://instagram.com/iohbook" target="_blank" rel="noopener noreferrer" className={styles.communityLinkCard} data-hover data-magnet>
              <span className={styles.communityPlatformSymbol}>IG</span>
              <span className={styles.communityPlatformLabel}>Instagram</span>
              <span className={styles.communityPlatformStatus}>Follow Us</span>
            </a>
            <a href="https://x.com/iohbook" target="_blank" rel="noopener noreferrer" className={styles.communityLinkCard} data-hover data-magnet>
              <span className={styles.communityPlatformSymbol}>𝕏</span>
              <span className={styles.communityPlatformLabel}>X / Twitter</span>
              <span className={styles.communityPlatformStatus}>Get Updates</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export async function TokenSaleScene({
  searchParams
}: {
  searchParams?: {
    package_id?: string;
    quantity?: string;
  };
}) {
  const [campaigns, userView] = await Promise.all([
    listActiveTokenCampaigns(),
    getHeaderUserView()
  ]);

  return (
    <div className={styles.page}>
      <IohIndexStyles />
      <TokenSaleWebglCoin />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <IohSceneHeader user={userView} />
      <main className={styles.main} id="main-content">
        <TokenSaleHero />
        <GenesisCountdown />
        <TokenSaleManifesto />
        <TokenSaleMarquee />
        <TokenSaleUsage />
        <TokenSaleCampaigns campaigns={campaigns} searchParams={searchParams} />
        <TokenSaleTrust />
        <TokenSaleRoadmap />
        <TokenSaleCommunity />
        <BooksIndexFooter />
      </main>
    </div>
  );
}
