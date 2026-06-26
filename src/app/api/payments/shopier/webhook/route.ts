import { NextResponse, type NextRequest } from "next/server";
import { confirmShopierOrderCreatedWebhook } from "@/features/checkout/shopier-confirmation";
import { verifyShopierOsbSignature, getShopierConfig } from "@/features/checkout/shopier";
import { captureError } from "@/lib/observability";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  let payload: Record<string, any> = {};
  let rawBody = "";

  if (contentType.includes("form") || contentType.includes("urlencoded")) {
    const formData = await request.formData();
    rawBody = new URLSearchParams(formData as any).toString();
    for (const [key, value] of formData.entries()) {
      payload[key] = value;
    }
  } else {
    rawBody = await request.text();
    if (!rawBody || rawBody.trim() === "") {
      return NextResponse.json({ ok: true, message: "ping" });
    }
    try {
      payload = JSON.parse(rawBody);
    } catch {
      // ignore
    }
  }

  const supabase = createSupabaseServiceRoleClient();

  let isOsbVerified = false;
  try {
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

      isOsbVerified = true;
      const decoded = JSON.parse(Buffer.from(payload.res, "base64").toString("utf-8"));
      const currencyMap: Record<string, string> = {
        "0": "TRY",
        "1": "USD",
        "2": "EUR"
      };

      // Map OSB fields to standard webhook payload format:
      payload = {
        id: decoded.orderid ?? "",
        event: "order.created",
        note: decoded.customernote ?? "",
        total_amount: String(decoded.price ?? ""),
        currency: currencyMap[String(decoded.currency)] ?? "TRY",
        quantity: decoded.productcount ?? 1,
        lineItems: [
          {
            productId: String(decoded.productid ?? ""),
            quantity: decoded.productcount ?? 1
          }
        ]
      };
    }

    const payloadEvent =
      typeof payload.event === "string"
        ? payload.event
        : typeof payload.type === "string"
          ? payload.type
          : null;

    await confirmShopierOrderCreatedWebhook({
      event: isOsbVerified ? "order.created" : (
        request.headers.get("shopier-event") ??
        request.headers.get("x-shopier-event") ??
        payloadEvent
      ),
      payload,
      rawBody,
      signature: isOsbVerified ? payload.hash : (
        request.headers.get("shopier-signature") ?? request.headers.get("x-shopier-signature")
      ),
      supabase,
      isOsbVerified
    });

    if (isOsbVerified) {
      return new Response("success");
    }
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    captureError(error, {
      operation: "shopier.webhook"
    });

    if (isOsbVerified) {
      return new Response("success");
    }

    const isValidationError =
      error.message?.includes("signature") ||
      error.message?.includes("not found") ||
      error.message?.includes("JSON") ||
      error.message?.includes("missing");

    return NextResponse.json(
      { ok: false, error: error.message },
      { status: isValidationError ? 200 : 400 }
    );
  }
}

