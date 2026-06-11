"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, requireStaff } from "@/features/auth/queries";
import { createOrderNumber } from "@/features/checkout/checkout-utils";
import { commitTokenSalePaymentStart } from "@/features/checkout/persistence";
import { buildShopierPaymentUrl, getShopierConfig, isShopierConfigured } from "@/features/checkout/shopier";
import { validateTokenAllocationUpdate } from "@/features/token-sale/admin-rules";
import { hasAcceptedTokenSaleTerms, validateTokenSaleLimits } from "@/features/token-sale/rules";
import {
  addTokenDecimals,
  calculateBonusAmount,
  calculateTotalTokenAmount,
  multiplyTokenDecimal,
  parseDecimalString,
  parseInteger,
  parseMoneyToMinor
} from "@/features/token-sale/utils";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TokenAllocationStatus, TokenCampaignStatus } from "@/types/database";

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function optionalText(formData: FormData, name: string) {
  const value = text(formData, name);
  return value || null;
}

function buildSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_URL?.replace(/^/, "https://") ??
    "http://localhost:3000"
  );
}

export async function createTokenCampaign(formData: FormData) {
  const staff = await requireStaff(["owner", "admin_ops"]);
  if (!staff) redirect("/unauthorized");

  const title = text(formData, "title");
  const slug = text(formData, "slug") || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const status = String(formData.get("status") ?? "draft") as TokenCampaignStatus;
  const legalApproved = formData.get("legal_approved") === "on";
  const salesEnabled = formData.get("sales_enabled") === "on" && legalApproved;

  if (!title || !slug || !text(formData, "token_symbol")) {
    redirect("/admin/token-campaigns?error=missing-fields");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("token_sale_campaigns").insert({
    bonus_bps: parseInteger(formData.get("bonus_bps"), 0),
    currency: text(formData, "currency") || "USD",
    description: optionalText(formData, "description"),
    ends_at: optionalText(formData, "ends_at"),
    legal_approved_at: legalApproved ? new Date().toISOString() : null,
    per_user_limit: optionalText(formData, "per_user_limit"),
    price_minor: parseMoneyToMinor(formData.get("price")),
    sales_enabled: salesEnabled,
    slug,
    starts_at: optionalText(formData, "starts_at"),
    status,
    title,
    token_symbol: text(formData, "token_symbol").toUpperCase(),
    total_sale_limit: parseDecimalString(formData.get("total_sale_limit"))
  });

  if (error) redirect(`/admin/token-campaigns?error=${encodeURIComponent(error.code ?? "create-failed")}`);
  revalidatePath("/admin/token-campaigns");
  redirect("/admin/token-campaigns?saved=campaign");
}

export async function createTokenPackage(formData: FormData) {
  const staff = await requireStaff(["owner", "admin_ops"]);
  if (!staff) redirect("/unauthorized");

  const campaignId = text(formData, "campaign_id");
  if (!campaignId || !text(formData, "title")) {
    redirect("/admin/token-campaigns?error=missing-package");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("token_sale_packages").insert({
    active: formData.get("active") === "on",
    campaign_id: campaignId,
    currency: text(formData, "currency") || "USD",
    max_quantity_per_order: formData.get("max_quantity_per_order")
      ? parseInteger(formData.get("max_quantity_per_order"), 1)
      : null,
    price_minor: parseMoneyToMinor(formData.get("price")),
    sort_order: parseInteger(formData.get("sort_order"), 0),
    title: text(formData, "title"),
    token_amount: parseDecimalString(formData.get("token_amount"))
  });

  if (error) redirect(`/admin/token-campaigns?error=${encodeURIComponent(error.code ?? "package-create-failed")}`);
  revalidatePath("/admin/token-campaigns");
  redirect("/admin/token-campaigns?saved=package");
}

export async function startTokenSalePayment(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/token-sale");

  const packageId = text(formData, "package_id");
  const quantity = Math.max(1, parseInteger(formData.get("quantity"), 1));
  if (!packageId) redirect("/token-sale?error=missing-package");
  if (!hasAcceptedTokenSaleTerms(formData)) redirect("/token-sale?error=legal-required");
  if (!isShopierConfigured()) redirect("/token-sale?error=shopier-not-configured");

  const supabase = createSupabaseServiceRoleClient();
  const { data: wallet, error: walletError } = await supabase
    .from("user_wallets")
    .select("*")
    .eq("profile_id", user.id)
    .is("revoked_at", null)
    .order("is_primary", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (walletError) throw walletError;
  if (!wallet) redirect("/account/wallets?error=wallet-required-for-token");

  const { data: pkg, error: packageError } = await supabase
    .from("token_sale_packages")
    .select("*, token_sale_campaigns(*)")
    .eq("id", packageId)
    .eq("active", true)
    .single();

  if (packageError || !pkg) redirect("/token-sale?error=package-not-found");

  const campaign = Array.isArray(pkg.token_sale_campaigns)
    ? pkg.token_sale_campaigns[0]
    : pkg.token_sale_campaigns;

  if (!campaign || campaign.status !== "active" || !campaign.sales_enabled) {
    redirect("/token-sale?error=campaign-not-active");
  }

  const tokenAmount = multiplyTokenDecimal(pkg.token_amount, quantity);
  const bonusAmount = calculateBonusAmount(tokenAmount, campaign.bonus_bps);
  const totalTokenAmount = calculateTotalTokenAmount(tokenAmount, campaign.bonus_bps);
  const totalMinor = pkg.price_minor * quantity;
  const [{ data: campaignAllocations, error: campaignAllocationsError }, { data: userAllocations, error: userAllocationsError }] =
    await Promise.all([
      supabase
        .from("token_allocations")
        .select("total_amount")
        .eq("campaign_id", campaign.id)
        .in("status", ["pending", "approved", "sent"]),
      supabase
        .from("token_allocations")
        .select("total_amount")
        .eq("campaign_id", campaign.id)
        .eq("profile_id", user.id)
        .in("status", ["pending", "approved", "sent"])
    ]);

  if (campaignAllocationsError) throw campaignAllocationsError;
  if (userAllocationsError) throw userAllocationsError;

  const campaignAllocated = addTokenDecimals(
    ...(campaignAllocations ?? []).map((allocation) => allocation.total_amount)
  );
  const userAllocated = addTokenDecimals(
    ...(userAllocations ?? []).map((allocation) => allocation.total_amount)
  );
  const limitError = validateTokenSaleLimits({
    campaign,
    campaignAllocated,
    pkg,
    quantity,
    requestedTotal: totalTokenAmount,
    userAllocated
  });

  if (limitError) {
    redirect(`/token-sale?error=${limitError}`);
  }

  const orderId = crypto.randomUUID();
  const orderNumber = createOrderNumber();
  const now = new Date().toISOString();

  const config = getShopierConfig();
  const callbackUrl = `${buildSiteUrl()}/api/payments/shopier/callback`;
  const payment = buildShopierPaymentUrl({
    amountMinor: totalMinor,
    apiKey: config.apiKey,
    callbackUrl,
    currency: pkg.currency,
    email: user.email ?? "",
    merchantId: config.merchantId,
    orderNumber: orderNumber,
    paymentUrl: config.paymentUrl,
    secret: config.secret
  });

  await commitTokenSalePaymentStart(supabase, {
    p_allocation: {
      bonus_amount: String(bonusAmount),
      currency: pkg.currency,
      metadata: {
        source: "token_sale_checkout"
      },
      normalized_address: wallet.normalized_address,
      token_amount: String(tokenAmount),
      total_amount: String(totalTokenAmount),
      total_price_minor: totalMinor,
      unit_price_minor: pkg.price_minor,
      wallet_address: wallet.wallet_address,
      wallet_id: wallet.id
    },
    p_order: {
      currency: pkg.currency,
      customer_email: user.email ?? "",
      customer_name: null,
      discount_minor: 0,
      id: orderId,
      legal_acceptance: {
        token_sale: {
          accepted_at: now,
          campaign_id: campaign.id,
          explicit_checkbox: true,
          wallet_id: wallet.id
        }
      },
      order_number: orderNumber,
      shipping_minor: 0,
      subtotal_minor: totalMinor,
      tax_minor: 0,
      total_minor: totalMinor
    },
    p_order_item: {
      fulfillment_type: "claimable",
      product_snapshot: {
        kind: "token_sale",
        campaign_id: campaign.id,
        title: campaign.title,
        token_symbol: campaign.token_symbol
      },
      quantity,
      total_minor: totalMinor,
      unit_price_minor: pkg.price_minor,
      variant_snapshot: {
        bonus_amount: bonusAmount,
        package_id: pkg.id,
        title: pkg.title,
        token_amount: pkg.token_amount,
        total_token_amount: totalTokenAmount
      }
    },
    p_package_id: pkg.id,
    p_payment_attempt: {
      amount_minor: totalMinor,
      currency: pkg.currency,
      provider: "shopier",
      provider_reference: orderNumber,
      provider_status: "initialized",
      raw_response: { provider: "shopier", redirect_url: payment.url },
      request_payload: payment.requestPayload,
      response_payload: { redirect_url: payment.url },
      status: "pending"
    },
    p_profile_id: user.id,
    p_quantity: quantity
  });

  redirect(payment.url);
}

export async function updateTokenAllocation(formData: FormData) {
  const staff = await requireStaff(["owner", "admin_ops"]);
  if (!staff) redirect("/unauthorized");

  const allocationId = text(formData, "allocation_id");
  const status = String(formData.get("status") ?? "pending") as TokenAllocationStatus;
  const txHash = optionalText(formData, "manual_transfer_tx_hash");

  if (!allocationId || !["pending", "approved", "sent", "cancelled", "refunded"].includes(status)) {
    redirect("/admin/token-sales?error=invalid-allocation");
  }

  const validationError = validateTokenAllocationUpdate({ status, txHash });
  if (validationError) {
    redirect(`/admin/token-sales?error=${validationError}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("token_allocations")
    .update({
      manual_transfer_tx_hash: txHash,
      sent_at: status === "sent" ? new Date().toISOString() : null,
      status
    })
    .eq("id", allocationId);

  if (error) redirect(`/admin/token-sales?error=${encodeURIComponent(error.code ?? "update-failed")}`);

  await supabase.from("audit_logs").insert({
    action: "token.allocation_updated",
    actor_profile_id: staff.user.id,
    entity_id: allocationId,
    entity_type: "token_allocation",
    metadata: { status, txHash }
  });

  revalidatePath("/admin/token-sales");
  redirect("/admin/token-sales?saved=allocation");
}
