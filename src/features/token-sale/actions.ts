"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentUser, requireStaff } from "@/features/auth/queries";
import { createOrderNumber } from "@/features/checkout/checkout-utils";
import { commitTokenSalePaymentStart } from "@/features/checkout/persistence";
import {
  buildShopierProductUrl,
  isShopierConfigured,
  getShopierConfig
} from "@/features/checkout/shopier";
import {
  validateTokenAllocationUpdate,
  validateTokenPackageDuplicate
} from "@/features/token-sale/admin-rules";
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



function revalidateTokenSaleAdmin() {
  revalidateTag("token-sale", "max");
  revalidatePath("/admin/token-campaigns");
  revalidatePath("/token-sale");
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
  revalidateTokenSaleAdmin();
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
  const title = text(formData, "title");
  const currency = text(formData, "currency") || "USD";
  const priceMinor = parseMoneyToMinor(formData.get("price"));
  const tokenAmount = parseDecimalString(formData.get("token_amount"));
  const { data: existingPackages, error: existingPackagesError } = await supabase
    .from("token_sale_packages")
    .select("currency, price_minor, title, token_amount")
    .eq("campaign_id", campaignId)
    .limit(500);

  if (existingPackagesError) {
    redirect(`/admin/token-campaigns?error=${encodeURIComponent(existingPackagesError.code ?? "duplicate-check-failed")}`);
  }

  const duplicateError = validateTokenPackageDuplicate({
    currency,
    existing: existingPackages ?? [],
    priceMinor,
    title,
    tokenAmount
  });

  if (duplicateError) {
    redirect(`/admin/token-campaigns?error=${duplicateError}`);
  }

  const { error } = await supabase.from("token_sale_packages").insert({
    active: formData.get("active") === "on",
    campaign_id: campaignId,
    currency,
    max_quantity_per_order: formData.get("max_quantity_per_order")
      ? parseInteger(formData.get("max_quantity_per_order"), 1)
      : null,
    price_minor: priceMinor,
    sort_order: parseInteger(formData.get("sort_order"), 0),
    title,
    token_amount: tokenAmount
  });

  if (error) redirect(`/admin/token-campaigns?error=${encodeURIComponent(error.code ?? "package-create-failed")}`);
  revalidateTokenSaleAdmin();
  redirect("/admin/token-campaigns?saved=package");
}

export async function deleteTokenPackage(formData: FormData) {
  const staff = await requireStaff(["owner", "admin_ops"]);
  if (!staff) redirect("/unauthorized");

  const packageId = text(formData, "package_id");
  if (!packageId) {
    redirect("/admin/token-campaigns?error=missing-package");
  }

  const supabase = await createSupabaseServerClient();
  const { data: allocation, error: allocationError } = await supabase
    .from("token_allocations")
    .select("id")
    .eq("package_id", packageId)
    .limit(1)
    .maybeSingle();

  if (allocationError) {
    redirect(`/admin/token-campaigns?error=${encodeURIComponent(allocationError.code ?? "package-check-failed")}`);
  }

  if (allocation) {
    redirect("/admin/token-campaigns?error=package-has-sales");
  }

  const { error } = await supabase
    .from("token_sale_packages")
    .delete()
    .eq("id", packageId);

  if (error) {
    redirect(`/admin/token-campaigns?error=${encodeURIComponent(error.code ?? "package-delete-failed")}`);
  }

  revalidateTokenSaleAdmin();
  redirect("/admin/token-campaigns?saved=package-deleted");
}

export async function deleteTokenCampaign(formData: FormData) {
  const staff = await requireStaff(["owner", "admin_ops"]);
  if (!staff) redirect("/unauthorized");

  const campaignId = text(formData, "campaign_id");
  if (!campaignId) {
    redirect("/admin/token-campaigns?error=missing-campaign");
  }

  const supabase = await createSupabaseServerClient();
  const { data: allocation, error: allocationError } = await supabase
    .from("token_allocations")
    .select("id")
    .eq("campaign_id", campaignId)
    .limit(1)
    .maybeSingle();

  if (allocationError) {
    redirect(`/admin/token-campaigns?error=${encodeURIComponent(allocationError.code ?? "campaign-check-failed")}`);
  }

  if (allocation) {
    redirect("/admin/token-campaigns?error=campaign-has-sales");
  }

  const { error } = await supabase
    .from("token_sale_campaigns")
    .delete()
    .eq("id", campaignId);

  if (error) {
    redirect(`/admin/token-campaigns?error=${encodeURIComponent(error.code ?? "campaign-delete-failed")}`);
  }

  revalidateTokenSaleAdmin();
  redirect("/admin/token-campaigns?saved=campaign-deleted");
}

export async function startTokenSalePayment(formData: FormData) {
  const packageId = text(formData, "package_id");
  if (!packageId) redirect("/token-sale?error=missing-package");
  if (!hasAcceptedTokenSaleTerms(formData)) redirect("/token-sale?error=legal-required");
  if (!isShopierConfigured()) redirect("/token-sale?error=shopier-not-configured");

  const config = getShopierConfig();
  const shopierProductUrl = config.tokenSaleProductUrl;
  if (!shopierProductUrl) {
    console.error("SHOPIER_TOKEN_SALE_PRODUCT_URL is not set.");
    redirect("/token-sale?error=payment-not-configured");
  }

  const rawQty = formData.get("quantity");
  const parsedQty = rawQty ? parseInt(String(rawQty), 10) : NaN;
  const quantityVal = isNaN(parsedQty) || parsedQty < 1 ? 1 : parsedQty;

  const user = await getCurrentUser();
  if (!user) {
    const target = `/token-sale?package_id=${encodeURIComponent(packageId)}&quantity=${quantityVal}`;
    redirect(`/sign-in?next=${encodeURIComponent(target)}`);
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data: pkg, error: packageError } = await supabase
    .from("token_sale_packages")
    .select("*, token_sale_campaigns(*)")
    .eq("id", packageId)
    .eq("active", true)
    .single();

  if (packageError || !pkg) redirect("/token-sale?error=package-not-found");

  // Robust server-side quantity validation
  const maxLimit = pkg.max_quantity_per_order ?? 30;
  if (isNaN(parsedQty) || parsedQty < 1 || parsedQty > maxLimit) {
    redirect(`/token-sale?error=invalid-quantity`);
  }
  const quantity = parsedQty;

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
        .select("total_amount, status, created_at")
        .eq("campaign_id", campaign.id)
        .in("status", ["pending", "approved", "sent"]),
      supabase
        .from("token_allocations")
        .select("total_amount, status, created_at")
        .eq("campaign_id", campaign.id)
        .eq("profile_id", user.id)
        .in("status", ["pending", "approved", "sent"])
    ]);

  if (campaignAllocationsError) throw campaignAllocationsError;
  if (userAllocationsError) throw userAllocationsError;

  const nowTime = Date.now();
  const limitThresholdMs = 24 * 60 * 60 * 1000; // 24 hours

  const campaignAllocated = addTokenDecimals(
    ...(campaignAllocations ?? [])
      .filter((allocation) => {
        if (allocation.status !== "pending") return true;
        const age = nowTime - new Date(allocation.created_at).getTime();
        return age <= limitThresholdMs;
      })
      .map((allocation) => allocation.total_amount)
  );
  const userAllocated = addTokenDecimals(
    ...(userAllocations ?? [])
      .filter((allocation) => {
        if (allocation.status !== "pending") return true;
        const age = nowTime - new Date(allocation.created_at).getTime();
        return age <= limitThresholdMs;
      })
      .map((allocation) => allocation.total_amount)
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

  const headersList = await headers();
  const host = headersList.get("host") ?? "www.iohcoin.com";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const siteUrl = `${protocol}://${host}`;

  const paymentUrl = buildShopierProductUrl({
    callbackUrl: `${siteUrl}/api/payments/shopier/callback`,
    note: orderNumber,
    productUrl: shopierProductUrl,
    quantity: quantity,
    successUrl: `${siteUrl}/payment/success`
  });

  await commitTokenSalePaymentStart(supabase, {
    p_allocation: {
      bonus_amount: String(bonusAmount),
      currency: pkg.currency,
      metadata: {
        source: "token_sale_checkout",
        wallet_required_at_purchase: false
      },
      normalized_address: null,
      token_amount: String(tokenAmount),
      total_amount: String(totalTokenAmount),
      total_price_minor: totalMinor,
      unit_price_minor: pkg.price_minor,
      wallet_address: null,
      wallet_id: null
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
          wallet_required_at_purchase: false
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
      raw_response: { provider: "shopier", redirect_url: paymentUrl },
      request_payload: { quantity, note: orderNumber, order_id: orderId },
      response_payload: { redirect_url: paymentUrl },
      status: "pending"
    },
    p_profile_id: user.id,
    p_quantity: quantity
  });

  redirect(paymentUrl);
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
