import { NextResponse, type NextRequest } from "next/server";
import { confirmShopierPayment, confirmShopierPaymentByOrderId } from "@/features/checkout/shopier-confirmation";
import { parseShopierCallback, getShopierOrderReference, verifyShopierOsbSignature, getShopierConfig } from "@/features/checkout/shopier";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { captureError } from "@/lib/observability";

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  let payload = parseShopierCallback(formData);
  const supabase = createSupabaseServiceRoleClient();

  const isOsb = Boolean(payload.res && payload.hash);
  if (isOsb) {
    const config = getShopierConfig();
    const merchantId = config.merchantId || "4dc1fa8ec28589b16f8d7c863509661c";
    const osbKey = process.env.SHOPIER_WEBHOOK_TOKEN ?? process.env.SHOPIER_SECRET ?? config.apiKey;

    let isValid = verifyShopierOsbSignature(payload.res, payload.hash, merchantId, osbKey);
    
    // Fallback: If configured merchantId (e.g., store slug "sametyurttas") fails,
    // retry with the default numeric/hex Shopier merchant ID "4dc1fa8ec28589b16f8d7c863509661c".
    if (!isValid && merchantId !== "4dc1fa8ec28589b16f8d7c863509661c") {
      console.log(`OSB Signature verification failed with merchantId "${merchantId}". Retrying with default "4dc1fa8ec28589b16f8d7c863509661c".`);
      isValid = verifyShopierOsbSignature(payload.res, payload.hash, "4dc1fa8ec28589b16f8d7c863509661c", osbKey);
    }

    if (!isValid) {
      console.error(`OSB Signature verification failed! Used merchantId: "${merchantId}", osbKey length: ${osbKey?.length ?? 0}, prefix: "${osbKey ? osbKey.substring(0, 4) : "none"}". Received hash: "${payload.hash}".`);
      throw new Error("Shopier OSB signature is invalid.");
    }

    const decoded = JSON.parse(Buffer.from(payload.res, "base64").toString("utf-8"));
    const currencyMap: Record<string, string> = {
      "0": "TRY",
      "1": "USD",
      "2": "EUR"
    };

    payload = {
      platform_order_id: decoded.customernote ?? "",
      payment_id: decoded.orderid ?? "",
      status: "success",
      total_order_value: String(decoded.price ?? ""),
      currency: currencyMap[String(decoded.currency)] ?? "TRY",
      quantity: String(decoded.productcount ?? "1"),
      product_id: String(decoded.productid ?? ""),
      signature: payload.hash,
      osb_verified: "true"
    };
  }

  const orderReference = getShopierOrderReference(payload);

  let isTokenSale = false;
  if (orderReference) {
    try {
      const { data: attempt } = await supabase
        .from("payment_attempts")
        .select("order_id")
        .eq("provider", "shopier")
        .eq("provider_reference", orderReference)
        .maybeSingle();
      if (attempt) {
        const { data: items } = await supabase
          .from("order_items")
          .select("fulfillment_type")
          .eq("order_id", attempt.order_id);
        isTokenSale = items?.some(item => item.fulfillment_type === "claimable") ?? false;
      }
    } catch {
      // ignore
    }
  }

  try {
    const result = await confirmShopierPayment({
      payload,
      supabase
    });

    if (result.isTokenSale) {
      return redirectTo(
        request,
        result.paid ? "/payment/success" : "/payment/failed"
      );
    }

    return redirectTo(
      request,
      result.paid ? "/checkout/success?provider=shopier" : "/checkout?error=shopier-payment-failed"
    );
  } catch (error) {
    captureError(error, {
      operation: "shopier.callback"
    });

    if (isTokenSale) {
      return redirectTo(request, "/payment/failed");
    }

    return redirectTo(request, "/checkout?error=shopier-callback-failed");
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const orderReference = url.searchParams.get("platform_order_id") ??
                         url.searchParams.get("order_id") ??
                         url.searchParams.get("orderid") ??
                         url.searchParams.get("orderId");
  const transactionId = url.searchParams.get("payment_id") ??
                        url.searchParams.get("paymentId") ??
                        url.searchParams.get("transaction_id") ??
                        url.searchParams.get("transactionId");

  const supabase = createSupabaseServiceRoleClient();
  let isTokenSale = false;

  if (orderReference) {
    try {
      const { data: attempt } = await supabase
        .from("payment_attempts")
        .select("order_id")
        .eq("provider", "shopier")
        .eq("provider_reference", orderReference)
        .maybeSingle();
      if (attempt) {
        const { data: items } = await supabase
          .from("order_items")
          .select("fulfillment_type")
          .eq("order_id", attempt.order_id);
        isTokenSale = items?.some(item => item.fulfillment_type === "claimable") ?? false;
      }
    } catch {
      // ignore
    }
  }

  if (transactionId) {
    try {
      const result = await confirmShopierPaymentByOrderId({
        shopierOrderId: transactionId,
        supabase
      });

      if (result.paid) {
        if (result.isTokenSale) {
          return redirectTo(request, "/payment/success");
        }
        return redirectTo(request, "/checkout/success?provider=shopier");
      }
    } catch (error) {
      captureError(error, {
        operation: "shopier.callback.get_verification"
      });
    }
  }

  // Fallback checking if webhook / parallel callback already marked it paid
  if (orderReference) {
    try {
      const { data: attempt } = await supabase
        .from("payment_attempts")
        .select("status")
        .eq("provider", "shopier")
        .eq("provider_reference", orderReference)
        .maybeSingle();

      if (attempt?.status === "paid") {
        if (isTokenSale) {
          return redirectTo(request, "/payment/success");
        }
        return redirectTo(request, "/checkout/success?provider=shopier");
      }
    } catch {
      // ignore
    }
  }

  if (isTokenSale) {
    return redirectTo(request, "/payment/failed");
  }

  return redirectTo(request, "/checkout?notice=shopier-return-pending");
}
