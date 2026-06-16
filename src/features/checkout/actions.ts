"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/features/auth/queries";
import { getActiveCartSnapshot } from "@/features/cart/queries";
import { validateCartQuantity } from "@/features/cart/cart-rules";
import { getDeliveryOption } from "@/features/checkout/delivery-options";
import {
  createOrderNumber,
  type CheckoutAddress
} from "@/features/checkout/checkout-utils";
import { getPaymentProvider } from "@/features/checkout/providers";
import { commitCheckoutPaymentStart } from "@/features/checkout/persistence";
import {
  checkoutLegalSummaries,
  LEGAL_DOCUMENT_VERSION,
  optionalCommunicationConsents
} from "@/features/legal/legal-content";
import { sendOrderReceivedEmail } from "@/features/email/events";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { captureError, logInfo } from "@/lib/observability";
import type { FulfillmentType } from "@/types/database";

type CheckoutCurrentVariant = {
  id: string;
  price_minor: number;
  products:
    | {
        published_at: string | null;
        status: string;
      }
    | {
        published_at: string | null;
        status: string;
      }[]
    | null;
};

const checkoutAddressSchema = z.object({
  city: z.string().trim().min(1).max(80),
  companyName: z.string().trim().max(120).nullable(),
  country: z.string().trim().min(2).max(80),
  countryCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/),
  line1: z.string().trim().min(5).max(400),
  line2: z.string().trim().max(400).nullable(),
  postalCode: z.string().trim().min(2).max(24),
  region: z.string().trim().max(120).nullable()
});

const checkoutContactSchema = z.object({
  email: z.string().trim().email(),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\+?[0-9\s\-()]{7,20}$/)
});

function requireText(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function optionalText(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value || null;
}

function buildAddress(formData: FormData, prefix: string): CheckoutAddress {
  return {
    city: requireText(formData, `${prefix}_city`),
    companyName: optionalText(formData, `${prefix}_company_name`),
    country: requireText(formData, `${prefix}_country`),
    countryCode: requireText(formData, `${prefix}_country_code`).toUpperCase(),
    line1: requireText(formData, `${prefix}_line1`),
    line2: optionalText(formData, `${prefix}_line2`),
    postalCode: requireText(formData, `${prefix}_postal_code`),
    region: optionalText(formData, `${prefix}_region`)
  };
}

function buildSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_URL?.replace(/^/, "https://") ??
    "http://localhost:3000"
  );
}

function hasDigitalAccess(fulfillmentType: FulfillmentType) {
  return fulfillmentType === "digital" || fulfillmentType === "hybrid";
}

function requiresWalletDelivery(fulfillmentType: FulfillmentType) {
  return fulfillmentType === "claimable";
}

function validateCheckoutDetails(input: {
  billingAddress: CheckoutAddress;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: CheckoutAddress;
}) {
  const result = z
    .object({
      billingAddress: checkoutAddressSchema,
      contact: checkoutContactSchema,
      shippingAddress: checkoutAddressSchema
    })
    .safeParse({
      billingAddress: input.billingAddress,
      contact: {
        email: input.customerEmail,
        fullName: input.customerName,
        phone: input.customerPhone
      },
      shippingAddress: input.shippingAddress
    });

  if (!result.success) {
    redirect("/checkout?error=invalid-checkout-details");
  }
}

type CheckoutInventory = { on_hand: number; reserved: number; safety_stock: number };

function getFirstInventory(
  inventoryItems: CheckoutInventory | CheckoutInventory[] | null | undefined
) {
  return Array.isArray(inventoryItems) ? inventoryItems[0] : inventoryItems;
}

export async function startCheckoutPayment(formData: FormData) {
  logInfo("checkout.payment_start.requested");
  const requiredLegalAccepted = checkoutLegalSummaries.every(
    (summary) => formData.get(summary.inputName) === "on"
  );

  if (!requiredLegalAccepted) {
    redirect("/checkout?error=legal-required");
  }

  const cart = await getActiveCartSnapshot();

  if (!cart.cart || cart.lines.length === 0) {
    logInfo("checkout.payment_start.empty_cart");
    redirect("/cart?error=empty-cart");
  }

  const supabase = createSupabaseServiceRoleClient();

  for (const line of cart.lines) {
    const inventory = getFirstInventory(line.product_variants.inventory_items);
    const validation = validateCartQuantity({
      maxPerOrder: line.product_variants.max_per_order,
      onHand: inventory?.on_hand,
      requestedQuantity: line.quantity,
      reserved: inventory?.reserved,
      safetyStock: inventory?.safety_stock,
      stockPolicy: line.product_variants.stock_policy
    });

    if (!validation.ok) {
      redirect(`/cart?error=${encodeURIComponent(validation.reason)}`);
    }
  }

  const variantIds = cart.lines.map((line) => line.variant_id);
  const { data: currentVariants, error: currentVariantsError } = await supabase
    .from("product_variants")
    .select("id, price_minor, products(status, published_at)")
    .in("id", variantIds);

  if (currentVariantsError) {
    throw currentVariantsError;
  }

  const currentVariantById = new Map(
    ((currentVariants ?? []) as unknown as CheckoutCurrentVariant[]).map((variant) => [
      variant.id,
      variant
    ])
  );

  for (const line of cart.lines) {
    const variant = currentVariantById.get(line.variant_id);
    const product = Array.isArray(variant?.products)
      ? variant?.products[0]
      : variant?.products;

    if (!variant || !product || product.status !== "active" || !product.published_at) {
      redirect("/cart?error=product-unavailable");
    }

    if (variant.price_minor !== line.unit_price_minor) {
      redirect("/cart?error=price-changed");
    }
  }

  const delivery = getDeliveryOption(formData.get("delivery_option"));
  const customerName = requireText(formData, "customer_name");
  const customerEmail = requireText(formData, "customer_email");
  const customerPhone = requireText(formData, "customer_phone");
  const shippingAddress = buildAddress(formData, "shipping");
  const billingSameAsShipping = formData.get("billing_same_as_shipping") === "on";
  const billingAddress = billingSameAsShipping
    ? shippingAddress
    : buildAddress(formData, "billing");
  validateCheckoutDetails({
    billingAddress,
    customerEmail,
    customerName,
    customerPhone,
    shippingAddress
  });
  const provider = getPaymentProvider(formData.get("payment_provider"));
  const providerAvailability = provider.availability();
  const acceptedAt = new Date().toISOString();
  const noticeAcknowledgements = checkoutLegalSummaries
    .filter((summary) => summary.eventKind === "notice_acknowledgement")
    .map((summary) => ({
      accepted_at: acceptedAt,
      document_slug: summary.documentSlug,
      document_version: LEGAL_DOCUMENT_VERSION,
      purpose: summary.purpose
    }));
  const contractualAcceptances = checkoutLegalSummaries
    .filter((summary) => summary.eventKind === "explicit_consent")
    .map((summary) => ({
      accepted_at: acceptedAt,
      document_slug: summary.documentSlug,
      document_version: LEGAL_DOCUMENT_VERSION,
      purpose: summary.purpose
    }));
  const explicitCommunicationConsents = optionalCommunicationConsents.map((consent) => ({
    document_slug: consent.documentSlug,
    document_version: LEGAL_DOCUMENT_VERSION,
    granted: formData.get(consent.inputName) === "on",
    granted_at: formData.get(consent.inputName) === "on" ? acceptedAt : null,
    purpose: consent.purpose
  }));

  if (!providerAvailability.enabled) {
    logInfo("checkout.payment_start.provider_disabled", {
      provider: provider.id
    });
    redirect(`/checkout?error=${encodeURIComponent(providerAvailability.reason ?? "payment-provider-disabled")}`);
  }

  const user = await getCurrentUser();

  const hasDigitalOrClaimable = cart.lines.some(
    (line) =>
      hasDigitalAccess(line.product_variants.fulfillment_type) ||
      requiresWalletDelivery(line.product_variants.fulfillment_type)
  );
  const hasClaimable = cart.lines.some((line) =>
    requiresWalletDelivery(line.product_variants.fulfillment_type)
  );

  if (hasDigitalOrClaimable && !user) {
    redirect("/sign-in?next=/checkout&error=account-required-for-digital");
  }

  if (hasClaimable && user?.id) {
    const { data: wallet, error: walletError } = await supabase
      .from("user_wallets")
      .select("id")
      .eq("profile_id", user.id)
      .is("revoked_at", null)
      .limit(1)
      .maybeSingle();

    if (walletError) {
      throw walletError;
    }

    if (!wallet) {
      redirect("/account/wallets?error=wallet-required-for-nft");
    }
  }

  const totalMinor = cart.subtotalMinor + delivery.priceMinor;
  const orderId = crypto.randomUUID();
  const orderNumber = createOrderNumber();
  const order = {
    currency: cart.cart.currency,
    id: orderId,
    order_number: orderNumber,
    shipping_minor: delivery.priceMinor,
    subtotal_minor: cart.subtotalMinor,
    total_minor: totalMinor
  };

  const consentEvents = [
    ...checkoutLegalSummaries.map((summary) => ({
      document_slug: summary.documentSlug,
      document_version: LEGAL_DOCUMENT_VERSION,
      email: customerEmail,
      event_kind: summary.eventKind,
      granted: true,
      metadata: {
        checkout_field: summary.inputName,
        order_number: order.order_number
      },
      order_id: order.id,
      profile_id: user?.id ?? null,
      purpose: summary.purpose
    })),
    ...optionalCommunicationConsents.map((consent) => ({
      document_slug: consent.documentSlug,
      document_version: LEGAL_DOCUMENT_VERSION,
      email: customerEmail,
      event_kind: "explicit_consent" as const,
      granted: formData.get(consent.inputName) === "on",
      metadata: {
        checkout_field: consent.inputName,
        order_number: order.order_number
      },
      order_id: order.id,
      profile_id: user?.id ?? null,
      purpose: consent.purpose
    }))
  ];

  const { error: consentError } = await supabase.from("consent_events").insert(consentEvents);

  if (consentError) {
    captureError(consentError, {
      operation: "checkout.consent_log",
      order_id: order.id
    });
    throw consentError;
  }

  const orderItems = cart.lines.map((line) => ({
    fulfillment_type: line.product_variants.fulfillment_type,
    product_snapshot: {
      id: line.product_variants.products.id,
      slug: line.product_variants.products.slug,
      title: line.product_variants.products.title
    },
    quantity: line.quantity,
    total_minor: line.quantity * line.unit_price_minor,
    unit_price_minor: line.unit_price_minor,
    variant_id: line.variant_id,
    variant_snapshot: {
      format: line.product_variants.format,
      fulfillment_type: line.product_variants.fulfillment_type,
      id: line.product_variants.id,
      metadata: line.product_variants.metadata,
      sku: line.product_variants.sku,
      title: line.product_variants.title,
      digital_delivery_bucket: line.product_variants.digital_delivery_bucket,
      digital_delivery_path: line.product_variants.digital_delivery_path,
      digital_download_limit: line.product_variants.digital_download_limit
    }
  }));

  const callbackUrl =
    provider.id === "iyzico"
      ? `${buildSiteUrl()}/api/iyzico/callback`
      : `${buildSiteUrl()}/api/payments/${provider.id}/callback`;
  const paymentResult = await provider.startPayment({
    billingAddress,
    buyerId: user?.id ?? cart.cart.anonymous_id ?? cart.cart.id,
    callbackUrl,
    cartLines: cart.lines,
    conversationId: order.id,
    customerEmail,
    customerName,
    customerPhone,
    order,
    shippingAddress
  });

  if (paymentResult.status === "failed") {
    redirect("/checkout?error=payment-start-failed");
  }

  try {
    await commitCheckoutPaymentStart(supabase, {
      p_consent_events: consentEvents,
      p_order: {
        billing_address: billingAddress,
        cart_id: cart.cart.id,
        currency: cart.cart.currency,
        customer_email: customerEmail,
        customer_name: customerName,
        discount_minor: 0,
        id: orderId,
        legal_acceptance: {
          contractual_acceptances: contractualAcceptances,
          explicit_consents: explicitCommunicationConsents,
          notice_acknowledgements: noticeAcknowledgements,
          recorded_at: acceptedAt
        },
        order_number: orderNumber,
        profile_id: user?.id ?? null,
        shipping_address: {
          ...shippingAddress,
          delivery_option: delivery
        },
        shipping_minor: delivery.priceMinor,
        subtotal_minor: cart.subtotalMinor,
        tax_minor: 0,
        total_minor: totalMinor
      },
      p_order_items: orderItems,
      p_payment_attempt: {
        amount_minor: totalMinor,
        currency: order.currency,
        failure_message: paymentResult.failureReason ?? null,
        failure_reason: paymentResult.failureReason ?? null,
        provider: provider.id,
        provider_reference: paymentResult.providerReference ?? null,
        provider_status: paymentResult.providerStatus ?? null,
        provider_token: provider.id === "iyzico" ? paymentResult.providerReference ?? null : null,
        raw_response: paymentResult.rawResponse,
        request_payload: paymentResult.requestPayload,
        response_payload: paymentResult.rawResponse,
        status: paymentResult.normalizedStatus
      },
      p_profile_marketing: user?.id
        ? {
            marketing_email_opt_in: formData.get("email_marketing_consent") === "on",
            marketing_sms_opt_in: formData.get("sms_marketing_consent") === "on"
          }
        : {}
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("insufficient_stock")) {
      redirect("/cart?error=out-of-stock");
    }

    captureError(error, {
      operation: "checkout.atomic_payment_start",
      order_id: order.id,
      provider: provider.id
    });
    throw error;
  }
  logInfo("checkout.payment_attempt_created", {
    order_id: order.id,
    provider: provider.id,
    status: paymentResult.normalizedStatus
  });

  await sendOrderReceivedEmail(order.id);

  if (paymentResult.status === "manual") {
    redirect("/checkout/success?manual=1");
  }

  if (!paymentResult.redirectUrl) {
    redirect("/checkout?error=payment-start-failed");
  }

  redirect(paymentResult.redirectUrl);
}
