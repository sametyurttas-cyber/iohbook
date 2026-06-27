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
          <p className={styles.heroLead} id="ts-hero-lead" style={{ maxWidth: "600px" }}>
            Every great world begins with a small signal.
            <br />
            <br />
            IOHcoin is more than a digital asset.
            <br />
            <br />
            It is the first fragment of the future IOH civilization,
            <br />
            the foundation of the metaverse layers yet to be opened,
            <br />
            the beginning of a new digital economy,
            <br />
            and the first piece of a world that does not yet exist.
            <br />
            <br />
            Most people enter a world only after it has already been built.
            <br />
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
          IOHcoin, IOH Universe'un temeli olan <em>dijital erisim</em> ve
          topluluk varlik katmanidir.
        </p>
        <p className={styles.manifestoNote}>
          Kitap satin alan kullanicilar hesaplarinda IOH Puan kazanabilir. Genesis phase 
          surecinde sunulan IOHcoin paketleri, erken katilim (early access) katmanidir. 
          Bu sayfa yatirim tavsiyesi, finansal getiri vaadi veya kripto para vaadi 
          sunmaz; IOHcoin uygulama ici dijital erisim hakkidir.
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
              IOHcoin, IOH Universe ekosisteminde dijital erisim ve topluluk hakki 
              olarak sunulur. Uygulama ici puan ve varlik katmanidir; gercek bir kripto 
              para, borsa araci, menkul kiymet veya finansal enstruman degildir.
            </span>
          </li>
          <li className={styles.trustItem}>
            <span className={styles.trustNumber}>02</span>
            <span>
              Lansman sonrasi IOH Puanlarinin IOHcoin'e donusumu planlanmaktadir. 
              Finansal kazanc veya yatirim getirisi vaadi yoktur. Satin alim hesabiniza 
              community allocation olarak islenir; manuel gonderimler icin cuzdan 
              bilgisi ayrica talep edilebilir.
            </span>
          </li>
          <li className={styles.trustItem}>
            <span className={styles.trustNumber}>03</span>
            <span>
              Kullanim kosullari, future utility entegrasyonu ve erisim katmanlari 
              ileride IOHBOOK tarafindan guncellenebilir. Mevcut puanlariniz ve 
              allocation haklariniz hesabinizda guvenle saklanir.
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
