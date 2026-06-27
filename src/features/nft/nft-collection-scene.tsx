import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { getHeaderUserView } from "@/features/auth/queries";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import {
  getNftCollectionBySlug,
  getNftImageUrl,
  type NftGalleryCollection,
  type NftGalleryItem
} from "@/features/nft/queries";
import styles from "./nft-gallery-scene.module.css";
import { IohSceneHeader } from "@/components/layout/ioh-scene-header";

function Kicker({ children }: { children: ReactNode }) {
  return <p className={styles.kicker}>{children}</p>;
}



function ghostTextFromTitle(title: string) {
  const upper = title.toUpperCase().replace(/[^A-Z0-9 ]/g, "");
  const words = upper.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0];
  return words.slice(-1)[0] ?? "GENESIS";
}

function NftDetailHero({ collection }: { collection: NftGalleryCollection }) {
  const ghost = ghostTextFromTitle(collection.title);

  return (
    <section className={styles.detailHero}>
      <div className={styles.detailGhost} aria-hidden="true">{ghost}</div>
      <div className={styles.detailGlow} aria-hidden="true" />
      <div className={styles.heroGrid} aria-hidden="true" />
      <div className={styles.detailShell}>
        <Kicker>IOH / NFT-READY COLLECTION</Kicker>
        <h1 className={styles.detailTitle}>{collection.title}</h1>
        <p className={styles.detailLead}>
          {collection.description ??
            "IOH Universe icin dijital koleksiyon hazirligi. Bu galeri mint, satis veya zincir islemi baslatmaz; yalnizca on izleme alanidir."}
        </p>
        <div className={styles.legalGate}>
          Mint/Satis <b>{collection.mint_enabled ? "hukuk onayli" : "kapali"}</b>
          {" "}/ Bu ekranda zincir islemi baslatilmaz
        </div>
      </div>
    </section>
  );
}

function ArtifactCard({
  item,
  index
}: {
  item: NftGalleryItem;
  index: number;
}) {
  const imageUrl = getNftImageUrl(item);
  const traits = (item.attributes ?? [])
    .map((attr) => ({
      trait_type: String(attr.trait_type ?? "Trait"),
      value: String(attr.value ?? "")
    }))
    .slice(0, 4);

  return (
    <article className={styles.artifactCard} key={item.id}>
      <div className={styles.artifactVisual}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={item.title} src={imageUrl} />
        ) : (
          <div className={styles.artifactPlaceholder}>
            <span>IOH</span>
          </div>
        )}
      </div>
      <div className={styles.artifactTop}>
        <span className={styles.artifactNumber}>/ {String(index + 1).padStart(2, "0")}</span>
        <span className={styles.artifactBadge}>{item.status}</span>
      </div>
      <div>
        <h3 className={styles.artifactTitle}>{item.title}</h3>
        <p className={styles.artifactDesc}>
          {item.description ?? "IOH evreninden dijital eser hazirligi."}
        </p>
      </div>
      {traits.length > 0 ? (
        <details className={styles.artifactDetails}>
          <summary>Artifact details</summary>
          <div className={styles.artifactTraits}>
            {traits.map((trait) => (
              <div className={styles.artifactTrait} key={trait.trait_type}>
                <span className={styles.artifactTraitLabel}>{trait.trait_type}</span>
                <span className={styles.artifactTraitValue}>{trait.value}</span>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </article>
  );
}

function NftArtifacts({ collection }: { collection: NftGalleryCollection }) {
  return (
    <section className={styles.artifacts}>
      <div className={styles.shell}>
        <div className={styles.artifactsHeader}>
          <Kicker>02 / DIJITAL ESERLER</Kicker>
          <h2>KOLEKSIYON ON IZLEMESI</h2>
        </div>
        <div className={styles.artifactGrid}>
          {collection.nft_items.map((item, index) => (
            <ArtifactCard item={item} index={index} key={item.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

function NftDetailTrust() {
  return (
    <section className={styles.trust}>
      <div className={styles.trustInner}>
        <div className={styles.trustHeader}>03 / GUVEN BILGILERI</div>
        <p className={styles.trustText}>
          <strong>Bu koleksiyon hazirlik asamasindadir.</strong> Gosterilen
          eserler metadata ve gorsel on izlemesidir; mint, satis, token transferi
          veya zincir uzerinde claim islemi baslatilmaz. Canli yayin icin ayri bir
          hukuk onayi gereklidir.
        </p>
      </div>
    </section>
  );
}

export async function NftCollectionScene({ slug }: { slug: string }) {
  let collection: NftGalleryCollection;

  try {
    collection = await getNftCollectionBySlug(slug);
  } catch {
    notFound();
  }

  const userView = await getHeaderUserView();

  return (
    <div className={styles.page}>
      <IohIndexStyles />
      <style dangerouslySetInnerHTML={{ __html: "body{cursor:auto!important}a,button,[data-hover],[data-magnet]{cursor:pointer!important}" }} />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <IohSceneHeader user={userView} />
      <main className={styles.main} id="main-content">
        <NftDetailHero collection={collection} />
        <NftArtifacts collection={collection} />
        <NftDetailTrust />
        <BooksIndexFooter />
      </main>
    </div>
  );
}
