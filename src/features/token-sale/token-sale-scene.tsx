import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { getCurrentProfile, getCurrentUser } from "@/features/auth/queries";
import { getIohPointBalanceForProfile } from "@/features/points/queries";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { startTokenSalePayment } from "@/features/token-sale/actions";
import { listActiveTokenCampaigns, type TokenCampaignWithPackages } from "@/features/token-sale/queries";
import { formatMoney } from "@/features/products/product-utils";
import { formatTokenAmount } from "@/features/token-sale/utils";
import styles from "./token-sale-scene.module.css";

type TokenSaleUser = {
  displayName: string;
  points: number;
} | null;

const usageCards = [
  {
    description: "Kitap satin aldiginda hesabina IOH puani tanimlanir. Destekleyen her alim evrene katki olarak doner.",
    number: "01",
    status: "Aktif",
    title: "Kitap Alim Puan"
  },
  {
    description: "Dijital koleksiyon ve ozel yayin erisimleri icin ileride kullanilabilecek katman.",
    number: "02",
    status: "Hazirlanıyor",
    title: "Koleksiyon Erisimi"
  },
  {
    description: "IOH Universe icinde yayinlanacak ozel icerik, arka plan ve yazar notu erisimleri.",
    number: "03",
    status: "Planlanan",
    title: "Ozel IOH Icerik"
  },
  {
    description: "Gelecekte duzenlenecek topluluk etkinlikleri, erkenden erisim ve ayricalik katmani.",
    number: "04",
    status: "Planlanan",
    title: "Topluluk Ayricalik"
  }
] as const;

function Kicker({ children }: { children: ReactNode }) {
  return <p className={styles.kicker}>{children}</p>;
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
        <div className={styles.heroCoin}>
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
          <Kicker>IOHCOIN / DIGITAL ACCESS LAYER</Kicker>
          <h1 className={styles.heroTitle}>IOHCOIN</h1>
          <p className={styles.heroLead}>
            IOHcoin, IOH Universe okurlari icin olusturulan dijital puan ve
            erisim katmanidir. Kitap satin alan kullanicilar hesaplarinda IOH
            puani kazanir; bu puanlar ileride ozel icerikler, koleksiyonlar ve
            topluluk ayricaliklari icin kullanilabilecek sekilde tasarlanir.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#campaigns">
              Paketleri Incele
            </a>
            <Link className={styles.secondaryButton} href="/books">
              Kitaplari Incele
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function TokenSaleManifesto() {
  return (
    <section className={styles.manifesto}>
      <div className={styles.manifestoInner}>
        <p>
          IOHcoin, IOH Universe okurlari icin olusturulan <em>dijital puan</em> ve
          evren erisim katmanidir.
        </p>
        <p className={styles.manifestoNote}>
          Kitap satin alan kullanicilar hesaplarinda IOH puani kazanabilir. Bu puan
          ileride ozel icerikler, koleksiyonlar, etkinlikler ve dijital deneyimler
          icin kullanilabilecek sekilde tasarlanir. Bu sayfa yatirim tavsiyesi,
          kripto para vaadi veya finansal getiri sunmaz.
        </p>
      </div>
    </section>
  );
}

function TokenSaleMarquee() {
  return (
    <div className={styles.marquee} aria-hidden="true">
      <div>
        <span>IOHCOIN / DIGITAL ACCESS / IOH UNIVERSE / TOPLULUK PUANI /</span>
        <span>IOHCOIN / DIGITAL ACCESS / IOH UNIVERSE / TOPLULUK PUANI /</span>
      </div>
    </div>
  );
}

function TokenSaleUsage() {
  return (
    <section className={styles.usage}>
      <div className={styles.shell}>
        <div className={styles.usageHeader}>
          <Kicker>02 / KULLANIM ALANLARI</Kicker>
          <h2>PUANIN EVRENDEN YOLU.</h2>
        </div>
        <div className={styles.usageGrid}>
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

function PackageCard({
  campaign,
  index,
  pkg
}: {
  campaign: TokenCampaignWithPackages;
  index: number;
  pkg: TokenCampaignWithPackages["token_sale_packages"][number];
}) {
  return (
    <form action={startTokenSalePayment} className={styles.packageCard}>
      <input name="package_id" type="hidden" value={pkg.id} />
      <div className={styles.packageTop}>
        <span className={styles.packageNumber}>/ {String(index + 1).padStart(2, "0")}</span>
        <span className={styles.packageAmount}>
          {formatTokenAmount(pkg.token_amount)} {campaign.token_symbol}
        </span>
      </div>
      <h3 className={styles.packageTitle}>{pkg.title}</h3>
      <p className={styles.packagePrice}>
        {formatMoney(pkg.price_minor, pkg.currency)}
      </p>
      <input
        className={styles.quantityInput}
        defaultValue={1}
        max={pkg.max_quantity_per_order ?? undefined}
        min={1}
        name="quantity"
        type="number"
      />
      <label className={styles.termsLabel}>
        <input
          className={styles.termsCheckbox}
          name="token_sale_terms"
          required
          type="checkbox"
        />
        <span>
          Token haklarinin odeme sonrasi allocation olarak acilacagini, otomatik
          transfer yapilmayacagini ve manuel gonderim icin dogrulanmis wallet
          gerektigini kabul ediyorum.
        </span>
      </label>
      <button className={styles.submitButton} type="submit">
        Shopier ile odeme yap
      </button>
    </form>
  );
}

function TokenSaleCampaigns({ campaigns }: { campaigns: TokenCampaignWithPackages[] }) {
  return (
    <section className={styles.campaigns} id="campaigns">
      <div className={styles.shell}>
        <div className={styles.campaignsHeader}>
          <Kicker>03 / PAKETLER</Kicker>
          <h2>IOHCOIN PAKETLERI</h2>
          <p className={styles.campaignsLead}>
            IOHcoin paketleri, odeme onayindan sonra hesabinda allocation olarak
            gorunur. Otomatik blockchain transferi yapilmaz; manuel gonderim icin
            dogrulanmis wallet gereklidir.
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
                <PackageCard
                  campaign={campaign}
                  index={index}
                  key={pkg.id}
                  pkg={pkg}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TokenSaleTrust() {
  return (
    <section className={styles.trust}>
      <div className={styles.trustInner}>
        <div className={styles.trustHeader}>04 / GUVEN BILGILERI</div>
        <ul className={styles.trustList}>
          <li className={styles.trustItem}>
            <span className={styles.trustNumber}>01</span>
            <span>
              IOHcoin bu asamada IOHBOOK hesabi icinde gorunen dijital puan ve
              erisim hakki olarak sunulur. Gercek bir kripto para, borsa araci veya
              finansal enstruman degildir.
            </span>
          </li>
          <li className={styles.trustItem}>
            <span className={styles.trustNumber}>02</span>
            <span>
              Otomatik blockchain transferi, zincir uzerinde dagitim veya yatirim
              getirisi vaadi yoktur. Manuel gonderim, dogrulanmis wallet ve admin
              onayi ile sinirlidir.
            </span>
          </li>
          <li className={styles.trustItem}>
            <span className={styles.trustNumber}>03</span>
            <span>
              Kullanim kosullari, uygunluklar ve erisim katmanlari ileride
              IOHBOOK tarafindan guncellenebilir. Mevcut puanlar hesabinda guvenle
              saklanir.
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}

export async function TokenSaleScene() {
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
      <style dangerouslySetInnerHTML={{ __html: "body{cursor:auto!important}a,button,[data-hover],[data-magnet]{cursor:pointer!important}" }} />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <TokenSaleHeader user={userView} />
      <main className={styles.main} id="main-content">
        <TokenSaleHero />
        <TokenSaleManifesto />
        <TokenSaleMarquee />
        <TokenSaleUsage />
        <TokenSaleCampaigns campaigns={campaigns} />
        <TokenSaleTrust />
        <BooksIndexFooter />
      </main>
    </div>
  );
}
