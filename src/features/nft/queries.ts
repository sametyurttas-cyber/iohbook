import { unstable_cache } from "next/cache";
import { getPublicMediaUrlFromPath } from "@/features/media/public-url";
import { buildNftMetadata } from "@/features/nft/metadata";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { NftCollection, NftItem } from "@/types/database";

export type NftGalleryItem = NftItem;
export type NftGalleryCollection = NftCollection & {
  nft_items: NftGalleryItem[];
};

const fallbackCollection: NftGalleryCollection = {
  chain_id: null,
  contract_address: null,
  contract_standard: "ERC721",
  cover_bucket: null,
  cover_path: null,
  created_at: new Date().toISOString(),
  description:
    "IOH evreni icin NFT-ready koleksiyon hazirligi. Bu galeri mint, satis veya token transferi baslatmaz.",
  id: "preview-nft-ioh-genesis",
  ipfs_metadata_cid: null,
  legal_approved_at: null,
  metadata: {},
  mint_enabled: false,
  nft_items: [
    {
      attributes: [
        { trait_type: "Line", value: "Code" },
        { trait_type: "Status", value: "Metadata draft" }
      ],
      collection_id: "preview-nft-ioh-genesis",
      created_at: new Date().toISOString(),
      description: "CODE GOD evreninden metadata hazirlik karti.",
      id: "preview-nft-code-god",
      fulfillment_status: "manual_pending",
      image_bucket: null,
      image_ipfs_uri: null,
      image_path: null,
      metadata_ipfs_uri: null,
      product_id: null,
      sort_order: 0,
      status: "published",
      title: "CODE GOD Genesis",
      token_id: null,
      variant_id: null,
      updated_at: new Date().toISOString()
    },
    {
      attributes: [
        { trait_type: "Line", value: "System" },
        { trait_type: "Status", value: "Metadata draft" }
      ],
      collection_id: "preview-nft-ioh-genesis",
      created_at: new Date().toISOString(),
      description: "SYS GOD evreninden metadata hazirlik karti.",
      id: "preview-nft-sys-god",
      fulfillment_status: "manual_pending",
      image_bucket: null,
      image_ipfs_uri: null,
      image_path: null,
      metadata_ipfs_uri: null,
      product_id: null,
      sort_order: 1,
      status: "published",
      title: "SYS GOD Signal",
      token_id: null,
      variant_id: null,
      updated_at: new Date().toISOString()
    }
  ],
  pinata_group_id: null,
  product_id: null,
  slug: "ioh-genesis",
  status: "published",
  title: "IOH Genesis",
  updated_at: new Date().toISOString()
};

export function getNftImageUrl(item: Pick<NftItem, "image_bucket" | "image_ipfs_uri" | "image_path">) {
  if (item.image_ipfs_uri) {
    return item.image_ipfs_uri.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  if (item.image_bucket === "public-media" && item.image_path) {
    return getPublicMediaUrlFromPath(item.image_path);
  }

  return null;
}

async function fetchNftCollections() {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("nft_collections")
      .select("*, nft_items(*)")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .order("sort_order", { referencedTable: "nft_items", ascending: true });

    if (error) {
      throw error;
    }

    return (data?.length ? data : [fallbackCollection]) as unknown as NftGalleryCollection[];
  } catch {
    return [fallbackCollection];
  }
}

async function fetchNftCollectionBySlug(slug: string) {
  const collections = await fetchNftCollections();
  const collection = collections.find((item) => item.slug === slug);

  if (!collection) {
    throw new Error("NFT collection not found");
  }

  return collection;
}

export const listNftCollections = unstable_cache(fetchNftCollections, ["nft-collections"], {
  revalidate: 300,
  tags: ["nft", "nft-collections"]
});

export function getNftCollectionBySlug(slug: string) {
  return unstable_cache(() => fetchNftCollectionBySlug(slug), ["nft-collection", slug], {
    revalidate: 300,
    tags: ["nft", `nft:${slug}`]
  })();
}

export function buildItemMetadataPreview(collection: NftGalleryCollection, item: NftGalleryItem) {
  return buildNftMetadata({
    attributes: item.attributes.map((attribute) => ({
      trait_type: String(attribute.trait_type ?? "Trait"),
      value: String(attribute.value ?? "")
    })),
    description: item.description,
    externalUrl: `/nft/${collection.slug}`,
    image: item.image_ipfs_uri,
    name: item.title
  });
}
