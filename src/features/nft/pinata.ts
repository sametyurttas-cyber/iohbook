import { buildNftMetadata, type NftMetadataInput } from "@/features/nft/metadata";

type PinataPinResponse = {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
};

function getPinataJwt() {
  return process.env.PINATA_JWT;
}

export async function pinNftMetadataToPinata(input: {
  metadata: NftMetadataInput;
  name: string;
}) {
  const jwt = getPinataJwt();

  if (!jwt) {
    throw new Error("PINATA_JWT is required to pin NFT metadata.");
  }

  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    body: JSON.stringify({
      pinataContent: buildNftMetadata(input.metadata),
      pinataMetadata: {
        name: input.name
      }
    }),
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Pinata metadata pin failed: ${response.status}`);
  }

  return (await response.json()) as PinataPinResponse;
}
