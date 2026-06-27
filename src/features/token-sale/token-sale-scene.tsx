import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { getCurrentProfile, getCurrentUser } from "@/features/auth/queries";
import { getIohPointBalanceForProfile } from "@/features/points/queries";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { listActiveTokenCampaigns, type TokenCampaignWithPackages } from "@/features/token-sale/queries";
import { formatTokenAmount } from "@/features/token-sale/utils";
import styles from "./token-sale-scene.module.css";
import { TokenSaleWebglCoin } from "./token-sale-webgl-coin";
import { PackageCardClient } from "./package-card-client";
import { GenesisCountdown } from "./genesis-countdown";

type TokenSaleUser = {
  displayName: string;
  points: number;
} | null;

const usageCards = [
  {
    description: "IOHcoin, IOH Universe ekosisteminin dijital erisim ve topluluk varlik katmanidir. Kitap, koleksiyon, ozel icerikler ve topluluk deneyimlerinin anahtari.",
    number: "01",
    status: "Temel",
    title: "IOHCOIN NEDIR?"
  },
  {
    description: "Genesis phase ile sunulan IOHcoin paketleri, erken katilim (early access) donemidir. Ekosistemin ilk katilimcilari arasinda yer alma firsati sunar.",
    number: "02",
    status: "Genesis",
    title: "NEDEN SIMDI?"
  },
  {
    description: "Bugün elde ettiginiz IOH Puanlarinin, lansman sonrasinda IOHcoin'e donusumu planlanmaktadir. Ecosystem participation bu donusumun temelidir.",
    number: "03",
    status: "Yakin-Tarih",
    title: "PUAN -> IOHCOIN"
  },
  {
    description: "Gelecekte sunulacak dijital koleksiyonlar, kapali topluluk etkinlikleri ve ozel yazar erisim katmanlari. IOHcoin sahipleri bu future utility katmanina ilk erisenler olacaktir.",
    number: "04",
    status: "Planlanan",
    title: "GELECEK KATMANLAR"
  }
] as const;

function Kicker({ children, id }: { children: ReactNode; id?: string }) {
  return <p className={styles.kicker} id={id}>{children}</p>;
}

function TokenSaleHeader({ user }: { user: TokenSaleUser }) {
  return (
    <header className="site-head is-solid">
      <Link className="logo" href="/" data-hover="">
        <b>IOH</b>
        <span>UNIVERSE</span>
      </Link>
      <nav className="site-nav" aria-label="Ana menu">
        <Link href="/">Evren</Link>
        <Link href="/books">Kitaplar</Link>
        <Link href="/token-sale">Iohcoin</Link>
        <Link href="/author">Yazar Hakkinda</Link>
        <Link href="/nft">NFT Galeri</Link>
        <Link href="/journal">Gunluk/Blog</Link>
        <Link href="/cart">Sepet</Link>
        <Link href="/contact">Iletisim</Link>
      </nav>
      <div className="head-actions">
        {user ? (
          <>
            <Link className="head-cta" href="/account" data-hover="" data-magnet="">
              {user.displayName}
            </Link>
            <Link className="head-cta" href="/account/profile" data-hover="" data-magnet="">
              IOH Puan: {user.points}
            </Link>
          </>
        ) : (
          <>
            <Link className="head-cta" href="/sign-in" data-hover="" data-magnet="">
              Giris
            </Link>
            <Link className="head-cta" href="/sign-up" data-hover="" data-magnet="">
              Uye Ol
            </Link>
          </>
        )}
        <Link className="head-cta" href="/collections" data-hover="" data-magnet="">
          Koleksiyona Gir
        </Link>
      </div>
    </header>
  );
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
              alt="IOHcoin dijital erisim katmani gorseli"
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
              Paketleri Incele
            </a>
            <Link className={styles.secondaryButton} href="/books">
              Kitaplari Incele
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
          <Kicker>02 / KULLANIM ALANLARI</Kicker>
          <h2>PUANIN EVRENDEN YOLU.</h2>
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
          <Kicker>03 / PAKETLER</Kicker>
          <h2>IOHCOIN PAKETLERI</h2>
          <p className={styles.campaignsLead}>
            Genesis phase donemi IOHcoin paketleri. Odeme onayindan sonra hesabinizda 
            community allocation olarak gorunur. Satin alma icin wallet baglama zorunlulugu 
            yoktur; ileride manuel gonderim gerekirse cuzdan adresi talep edilebilir.
          </p>
        </div>

        {campaigns.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>IOH</div>
            <h3>Aktif kampanya bulunmuyor</h3>
            <p>
              Admin panelinden aktif ve satisi acik bir IOHcoin kampanyasi
              olusturuldugunda paketler burada gorunur. Su anda satin alma akisi
              kapali durumda.
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
              <Kicker>04 / OPSIYONEL CUZDAN KATMANI</Kicker>
              <h3 className={styles.walletStationTitle}>SISTEM CUZDAN SINYAL ISTASYONU</h3>
              <p className={styles.campaignsLead}>
                Satin alma icin cuzdan baglamak zorunda degilsin. Bu alan IOH
                evrenindeki manuel gonderim ve ilerideki zincir islemleri icin
                opsiyonel bir hazirlik katmani olarak kalir.
              </p>
            </div>
            <div className={styles.walletStationGrid}>
              <div className={styles.walletInputWrapper}>
                <input
                  autoComplete="off"
                  className={styles.walletInput}
                  id="ts-wallet-input"
                  placeholder="Opsiyonel: 0x ile baslayan cuzdan adresi"
                  spellCheck="false"
                  type="text"
                />
              </div>
              <button
                className={styles.walletConnectBtn}
                id="ts-wallet-connect-btn"
                type="button"
              >
                Gorsel Baglantiyi Baslat
              </button>
            </div>
            <div className={styles.walletTelemetry}>
              <span>OPSIYONEL: <strong id="ts-wallet-status-text">SATIN ALMA ICIN GEREKLI DEGIL</strong></span>
              <span>AG: <b>IOH SECURE CHAIN</b></span>
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
        <div className={styles.trustHeader}>05 / GUVEN BILGILERI</div>
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
              Genesis is the era before the world fully opens.
              <br />
              <br />
              Every allocation secured during this stage becomes part of the foundation upon which the future IOH ecosystem will be built.
            </span>
          </li>
        </ul>
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
  const [campaigns, user] = await Promise.all([
    listActiveTokenCampaigns(),
    getCurrentUser()
  ]);

  let userView: TokenSaleUser = null;

  if (user) {
    const [profile, points] = await Promise.all([
      getCurrentProfile(),
      getIohPointBalanceForProfile(user.id)
    ]);
    const displayName = profile?.full_name || profile?.email || user.email || "Hesabim";
    userView = { displayName, points: points?.balance ?? 0 };
  }

  return (
    <div className={styles.page}>
      <IohIndexStyles />
      <TokenSaleWebglCoin />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <TokenSaleHeader user={userView} />
      <main className={styles.main} id="main-content">
        <TokenSaleHero />
        <GenesisCountdown />
        <TokenSaleManifesto />
        <TokenSaleMarquee />
        <TokenSaleUsage />
        <TokenSaleCampaigns campaigns={campaigns} searchParams={searchParams} />
        <TokenSaleTrust />
        <BooksIndexFooter />
      </main>
    </div>
  );
}
