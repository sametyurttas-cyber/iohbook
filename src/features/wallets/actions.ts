"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccountUser } from "@/features/account/queries";
import { getWalletSignatureTtlMinutes, isSupportedWalletChain } from "@/features/web3/config";
import { isWalletLinkExpired, verifyWalletOwnershipSignature } from "@/features/web3/signature";
import {
  buildWalletLinkMessage,
  createWalletLinkNonce,
  isLikelyEvmAddress,
  normalizeWalletAddress
} from "@/features/wallets/wallet-utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { WalletProvider } from "@/types/database";

function readProvider(value: FormDataEntryValue | null): WalletProvider {
  return value === "walletconnect" ? "walletconnect" : "metamask";
}

function getSignatureDomain() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export async function prepareWalletLink(formData: FormData) {
  const user = await requireAccountUser();
  const walletAddress = String(formData.get("wallet_address") ?? "").trim();
  const provider = readProvider(formData.get("provider"));
  const chainIdRaw = String(formData.get("chain_id") ?? "").trim();
  const chainId = chainIdRaw ? Number.parseInt(chainIdRaw, 10) : null;

  if (!isLikelyEvmAddress(walletAddress)) {
    redirect("/account/wallets?error=invalid-address");
  }

  if (!isSupportedWalletChain(chainId)) {
    redirect("/account/wallets?error=unsupported-chain");
  }

  const normalizedAddress = normalizeWalletAddress(walletAddress);
  const nonce = createWalletLinkNonce();
  const issuedAtDate = new Date();
  const issuedAt = issuedAtDate.toISOString();
  const expiresAt = addMinutes(issuedAtDate, getWalletSignatureTtlMinutes()).toISOString();
  const message = buildWalletLinkMessage({
    address: walletAddress,
    chainId,
    domain: getSignatureDomain(),
    expiresAt,
    issuedAt,
    nonce,
    provider
  });
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("wallet_links").insert({
    chain_id: Number.isFinite(chainId) ? chainId : null,
    expires_at: expiresAt,
    message,
    metadata: {
      domain: getSignatureDomain(),
      issued_at: issuedAt,
      live_features: {
        claim: false,
        mint: false,
        payment: false,
        sale: false,
        token_distribution: false,
        transfer: false
      }
    },
    nonce,
    normalized_address: normalizedAddress,
    profile_id: user.id,
    provider,
    status: "pending",
    wallet_address: walletAddress
  });

  if (error) {
    redirect(`/account/wallets?error=${encodeURIComponent(error.code ?? "wallet-prepare-failed")}`);
  }

  revalidatePath("/account/wallets");
  redirect(`/account/wallets?sign=${encodeURIComponent(normalizedAddress)}`);
}

export async function completeWalletLink(formData: FormData) {
  const user = await requireAccountUser();
  const walletLinkId = String(formData.get("wallet_link_id") ?? "");
  const signature = String(formData.get("signature") ?? "").trim();

  if (!walletLinkId || !signature) {
    redirect("/account/wallets?error=missing-signature");
  }

  const supabase = await createSupabaseServerClient();
  const { data: walletLink, error } = await supabase
    .from("wallet_links")
    .select("*")
    .eq("id", walletLinkId)
    .eq("profile_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (error || !walletLink) {
    redirect("/account/wallets?error=wallet-link-not-found");
  }

  if (isWalletLinkExpired(walletLink.expires_at)) {
    await supabase
      .from("wallet_links")
      .update({ status: "revoked", revoked_at: new Date().toISOString() })
      .eq("id", walletLink.id);
    redirect("/account/wallets?error=signature-expired");
  }

  const valid = await verifyWalletOwnershipSignature({
    address: walletLink.normalized_address,
    message: walletLink.message,
    signature
  });

  if (!valid) {
    redirect("/account/wallets?error=signature-invalid");
  }

  const { data: primaryWallet } = await supabase
    .from("user_wallets")
    .select("id")
    .eq("profile_id", user.id)
    .is("revoked_at", null)
    .eq("is_primary", true)
    .maybeSingle();

  const { data: existingWallet } = await supabase
    .from("user_wallets")
    .select("*")
    .eq("profile_id", user.id)
    .eq("normalized_address", walletLink.normalized_address)
    .is("revoked_at", null)
    .maybeSingle();

  const verifiedAt = new Date().toISOString();
  const walletPayload = {
    chain_id: walletLink.chain_id,
    last_seen_at: verifiedAt,
    last_verified_wallet_link_id: walletLink.id,
    metadata: {
      live_features: {
        claim_enabled: false,
        sale_enabled: false,
        token_distribution_enabled: false,
        transfer_enabled: false
      },
      verification_provider: walletLink.provider
    },
    provider: walletLink.provider,
    wallet_address: walletLink.wallet_address
  };

  const walletResult = existingWallet
    ? await supabase
        .from("user_wallets")
        .update(walletPayload)
        .eq("id", existingWallet.id)
        .select("id")
        .single()
    : await supabase
        .from("user_wallets")
        .insert({
          ...walletPayload,
          first_verified_wallet_link_id: walletLink.id,
          is_primary: !primaryWallet,
          normalized_address: walletLink.normalized_address,
          profile_id: user.id,
          verified_at: verifiedAt
        })
        .select("id")
        .single();

  if (walletResult.error || !walletResult.data) {
    redirect(`/account/wallets?error=${encodeURIComponent(walletResult.error?.code ?? "wallet-ownership-failed")}`);
  }

  const { error: updateError } = await supabase
    .from("wallet_links")
    .update({
      signature,
      status: "verified",
      user_wallet_id: walletResult.data.id,
      verified_at: new Date().toISOString()
    })
    .eq("id", walletLink.id);

  if (updateError) {
    redirect(`/account/wallets?error=${encodeURIComponent(updateError.code ?? "wallet-link-failed")}`);
  }

  await supabase.from("audit_logs").insert({
    action: "wallet.verified",
    actor_profile_id: user.id,
    entity_id: walletLink.id,
    entity_type: "wallet_link",
    metadata: {
      provider: walletLink.provider,
      user_wallet_id: walletResult.data.id,
      wallet_address: walletLink.normalized_address
    }
  });

  revalidatePath("/account/wallets");
  redirect("/account/wallets?saved=wallet-linked");
}

export async function revokeWalletLink(formData: FormData) {
  const user = await requireAccountUser();
  const walletId = String(formData.get("wallet_id") ?? "");

  if (!walletId) {
    redirect("/account/wallets?error=missing-wallet");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("user_wallets")
    .update({
      revoked_at: new Date().toISOString(),
      is_primary: false
    })
    .eq("id", walletId)
    .eq("profile_id", user.id);

  if (error) {
    redirect(`/account/wallets?error=${encodeURIComponent(error.code ?? "wallet-revoke-failed")}`);
  }

  await supabase.from("audit_logs").insert({
    action: "wallet.revoked",
    actor_profile_id: user.id,
    entity_id: walletId,
    entity_type: "user_wallet"
  });

  revalidatePath("/account/wallets");
  redirect("/account/wallets?saved=wallet-revoked");
}
