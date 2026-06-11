import { describe, expect, it } from "vitest";
import { buildNftMetadata, ipfsUri } from "@/features/nft/metadata";

describe("NFT metadata helpers", () => {
  it("builds ERC721-compatible metadata without mint side effects", () => {
    expect(
      buildNftMetadata({
        attributes: [{ trait_type: "Line", value: "Code" }],
        description: "Preview item",
        image: "ipfs://cid/image.png",
        name: "CODE GOD Genesis"
      })
    ).toEqual({
      animation_url: undefined,
      attributes: [{ trait_type: "Line", value: "Code" }],
      description: "Preview item",
      external_url: undefined,
      image: "ipfs://cid/image.png",
      name: "CODE GOD Genesis"
    });
  });

  it("formats IPFS URIs consistently", () => {
    expect(ipfsUri("ipfs://bafy123", "/metadata/1.json")).toBe(
      "ipfs://bafy123/metadata/1.json"
    );
  });
});
