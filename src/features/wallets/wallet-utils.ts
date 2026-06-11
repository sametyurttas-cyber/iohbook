import {
  buildWalletVerificationMessage,
  createWalletLinkNonce,
  isLikelyEvmAddress,
  normalizeWalletAddress
} from "@/features/web3/signature";
import type { WalletProvider } from "@/types/database";

export { createWalletLinkNonce, isLikelyEvmAddress, normalizeWalletAddress };

export function buildWalletLinkMessage(input: {
  address: string;
  chainId?: number | null;
  domain?: string;
  expiresAt?: string;
  issuedAt: string;
  nonce: string;
  provider: WalletProvider;
}) {
  return buildWalletVerificationMessage({
    address: input.address,
    chainId: input.chainId ?? null,
    domain: input.domain ?? "ioh.local",
    expiresAt: input.expiresAt ?? input.issuedAt,
    issuedAt: input.issuedAt,
    nonce: input.nonce,
    provider: input.provider
  });
}
