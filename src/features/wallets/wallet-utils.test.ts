import { describe, expect, it } from "vitest";
import { WEB3_LIVE_FEATURES, isSupportedWalletChain } from "@/features/web3/config";
import {
  isWalletLinkExpired,
  isLikelyEvmAddress,
  normalizeWalletAddress
} from "@/features/web3/signature";
import { buildWalletLinkMessage } from "@/features/wallets/wallet-utils";

describe("wallet link helpers", () => {
  it("normalizes and validates EVM addresses", () => {
    expect(normalizeWalletAddress(" 0xABCDEFabcdefABCDEFabcdefABCDEFabcdefABCD ")).toBe(
      "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
    );
    expect(isLikelyEvmAddress("0xabcdefabcdefabcdefabcdefabcdefabcdefabcd")).toBe(true);
    expect(isLikelyEvmAddress("0xnot-a-wallet")).toBe(false);
  });

  it("states that wallet signature does not authorize minting or payment", () => {
    const message = buildWalletLinkMessage({
      address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      chainId: 11155111,
      domain: "https://ioh.example",
      expiresAt: "2026-06-11T00:10:00.000Z",
      issuedAt: "2026-06-11T00:00:00.000Z",
      nonce: "nonce",
      provider: "metamask"
    });

    expect(message).toContain("does not authorize a payment, mint, token transfer");
    expect(message).toContain("Domain: https://ioh.example");
    expect(message).toContain("Chain ID: 11155111");
    expect(message).toContain("Expires At: 2026-06-11T00:10:00.000Z");
  });

  it("keeps live Web3 commerce features disabled in foundation config", () => {
    expect(WEB3_LIVE_FEATURES).toEqual({
      nftClaim: false,
      nftSales: false,
      tokenDistribution: false,
      tokenTransfer: false
    });
  });

  it("accepts configured EVM chains and rejects unknown chains", () => {
    expect(isSupportedWalletChain(1)).toBe(true);
    expect(isSupportedWalletChain(11155111)).toBe(true);
    expect(isSupportedWalletChain(999999)).toBe(false);
  });

  it("detects expired wallet verification requests", () => {
    expect(
      isWalletLinkExpired("2026-06-11T00:00:00.000Z", new Date("2026-06-11T00:00:01.000Z"))
    ).toBe(true);
    expect(
      isWalletLinkExpired("2026-06-11T00:00:02.000Z", new Date("2026-06-11T00:00:01.000Z"))
    ).toBe(false);
  });
});
