export type NftAttribute = {
  trait_type: string;
  value: string | number;
};

export type NftMetadataInput = {
  animationUrl?: string | null;
  attributes?: NftAttribute[];
  description?: string | null;
  externalUrl?: string | null;
  image?: string | null;
  name: string;
};

export function buildNftMetadata(input: NftMetadataInput) {
  return {
    animation_url: input.animationUrl || undefined,
    attributes: input.attributes ?? [],
    description: input.description ?? "",
    external_url: input.externalUrl || undefined,
    image: input.image || undefined,
    name: input.name
  };
}

export function ipfsUri(cid: string, path?: string) {
  const cleanCid = cid.replace(/^ipfs:\/\//, "").replace(/^\/+/, "");
  const cleanPath = path?.replace(/^\/+/, "");

  return `ipfs://${cleanCid}${cleanPath ? `/${cleanPath}` : ""}`;
}
