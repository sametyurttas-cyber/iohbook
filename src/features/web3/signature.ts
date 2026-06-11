import { verifyMessage } from "viem";
import type { WalletProvider } from "@/types/database";

const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

export type WalletVerificationMessageInput = {
  address: string;
  chainId: number | null;
  domain: string;
  expiresAt: string;
  issuedAt: string;
  nonce: string;
  provider: WalletProvider;
};

export function normalizeWalletAddress(address: string) {
  return address.trim().toLowerCase();
}

export function isLikelyEvmAddress(address: string) {
  return ADDRESS_PATTERN.test(address.trim());
}

export function createWalletLinkNonce() {
  return crypto.randomUUID();
}

export function buildWalletVerificationMessage(input: WalletVerificationMessageInput) {
  return [
    "IOH wallet ownership verification",
    "",
    "This signature links your wallet to your IOH account.",
    "It does not authorize a payment, mint, token transfer, NFT sale, token distribution, or claim.",
    "",
    `Domain: ${input.domain}`,
    `Wallet: ${normalizeWalletAddress(input.address)}`,
    `Provider: ${input.provider}`,
    `Chain ID: ${input.chainId ?? "not-provided"}`,
    `Nonce: ${input.nonce}`,
    `Issued At: ${input.issuedAt}`,
    `Expires At: ${input.expiresAt}`
  ].join("\n");
}

export async function verifyWalletOwnershipSignature(input: {
  address: string;
  message: string;
  signature: string;
}) {
  if (!isLikelyEvmAddress(input.address) || !input.signature.startsWith("0x")) {
    return false;
  }

  return verifyMessage({
    address: normalizeWalletAddress(input.address) as `0x${string}`,
    message: input.message,
    signature: input.signature as `0x${string}`
  });
}

export function isWalletLinkExpired(expiresAt?: string | null, now = new Date()) {
  if (!expiresAt) return false;

  return new Date(expiresAt).getTime() <= now.getTime();
}
