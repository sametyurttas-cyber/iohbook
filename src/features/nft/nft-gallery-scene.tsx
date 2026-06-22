import Link from "next/link";
import type { ReactNode } from "react";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { getCurrentProfile, getCurrentUser } from "@/features/auth/queries";
import { getIohPointBalanceForProfile } from "@/features/points/queries";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { listNftCollections, type NftGalleryCollection } from "@/features/nft/queries";
import styles from "./nft-gallery-scene.module.css";

type NftSceneUser = {
  displayName: string;
  points: number;
} | null;

function Kicker({ children }: { children: ReactNode }) {
  return <p className={styles.kicker}>{children}</p>;
}

function NftHeader({ user }: { user: NftSceneUser }) {
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

function NftHero() {
  return (
    <section className={styles.hero} id="gallery">
      <div className={styles.heroGhost} aria-hidden="true">GALLERY</div>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.heroGrid} aria-hidden="true" />
      <div className={styles.heroShell}>
        <Kicker>IOH / DIGITAL COLLECTION PREVIEW</Kicker>
        <h1 className={styles.heroTitle}>IOH Digital Gallery</h1>
        <p className={styles.heroLead}>
          IOH Universe icin hazirlanan dijital koleksiyon alani. Bu galeri su
          asamada mint, satis veya zincir islemi baslatmaz; yalnizca gelecekteki
          dijital koleksiyon yapisinin on izleme alanidir.
        </p>
        <div className={styles.heroActions}>
          <a className={styles.primaryButton} href="#collections">
            Koleksiyonlara In
          </a>
          <Link className={styles.secondaryButton} href="/books">
            Kitaplari Incele
          </Link>
        </div>
      </div>
      <div className={styles.scrollHint} aria-hidden="true">
        <span>SCROLL</span>
        <i />
      </div>
    </section>
  );
}

function NftManifesto() {
  return (
    <section className={styles.manifesto}>
      <div className={styles.manifestoInner}>
        <p>
          Dijital eserler, IOH evreninin <em>gorunur katmani</em> icin hazirlanir.
        </p>
        <p className={styles.manifestoNote}>
          Her koleksiyon, kitap hatlarindan tureyen metadata ve gorsel ipuclari
          tasiyan bir on izleme alanidir. Mint, satis, claim veya zincir islemi
          icin ayri bir hukuk onayi gereklidir; su anda bu ekranda aktif bir
          islem baslatilmaz.
        </p>
      </div>
    </section>
  );
}

function NftMarquee() {
  return (
    <div className={styles.marquee} aria-hidden="true">
      <div>
        <span>IOH DIGITAL GALLERY / NFT-READY / ON IZLEME / KOLEKSIYON HAZIRLIGI /</span>
        <span>IOH DIGITAL GALLERY / NFT-READY / ON IZLEME / KOLEKSIYON HAZIRLIGI /</span>
      </div>
    </div>
  );
}

function CollectionCard({
  collection,
  index
}: {
  collection: NftGalleryCollection;
  index: number;
}) {
  const statusLabel = collection.mint_enabled ? "AKTIF" : "MINT KAPALI";
  const isLive = collection.mint_enabled;

  return (
    <Link
      className={styles.collectionCard}
      href={`/nft/${collection.slug}`}
      key={collection.id}
    >
      <div className={styles.collectionCardTop}>
        <span className={styles.collectionNumber}>/ {String(index + 1).padStart(2, "0")}</span>
        <span className={`${styles.collectionStatus} ${isLive ? styles.collectionStatusLive : ""}`}>
          {statusLabel}
        </span>
      </div>
      <h2 className={styles.collectionTitle}>{collection.title}</h2>
      <p className={styles.collectionDesc}>
        {collection.description ?? "IOH Universe icin dijital koleksiyon hazirligi."}
      </p>
      <div className={styles.collectionFooter}>
        <div className={styles.collectionMeta}>
          <span>Eser <b>{collection.nft_items.length}</b></span>
          <span>Standart <b>{collection.contract_standard}</b></span>
        </div>
        <span className={styles.collectionCta}>
          Galeriyi Ac <span aria-hidden="true">-&gt;</span>
        </span>
      </div>
    </Link>
  );
}

function NftCollections({ collections }: { collections: NftGalleryCollection[] }) {
  return (
    <section className={styles.collections} id="collections">
      <div className={styles.shell}>
        <div className={styles.collectionsHeader}>
          <Kicker>02 / KOLEKSIYONLAR</Kicker>
          <div>
            <h2>DIJITAL KOLEKSIYON KAPILARI</h2>
            <p className={styles.collectionsLead}>
              Her koleksiyon, IOH evreninin bir hatkindan tureyen dijital eser
              hazirligini tasiyor. Galeriyi acarak on izleme alanina gir.
            </p>
          </div>
        </div>
        <div className={styles.collectionGrid}>
          {collections.map((collection, index) => (
            <CollectionCard collection={collection} index={index} key={collection.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

function NftTrust() {
  return (
    <section className={styles.trust}>
      <div className={styles.trustInner}>
        <div className={styles.trustHeader}>03 / GUVEN BILGILERI</div>
        <p className={styles.trustText}>
          <strong>Bu alan yalnizca on izleme icindir.</strong> Mint, satis, token
          transferi veya zincir uzerinde claim islemi baslatilmaz. Koleksiyonlarin
          canliyasmasi icin hukuki onay ve ayri bir yayin karari gereklidir.
          Mevcut durumda metadata, gorsel ve koleksiyon yapisinin tanitimina
          yonelik hazirlik sunulur.
        </p>
      </div>
    </section>
  );
}

export async function NftGalleryScene() {
  const [collections, user] = await Promise.all([
    listNftCollections(),
    getCurrentUser()
  ]);

  let userView: NftSceneUser = null;

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
      <NftHeader user={userView} />
      <main className={styles.main} id="main-content">
        <NftHero />
        <NftManifesto />
        <NftMarquee />
        <NftCollections collections={collections} />
        <NftTrust />
        <BooksIndexFooter />
      </main>
    </div>
  );
}
