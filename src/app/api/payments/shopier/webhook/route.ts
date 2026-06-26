import { NextResponse, type NextRequest } from "next/server";
import { confirmShopierOrderCreatedWebhook } from "@/features/checkout/shopier-confirmation";
import { captureError } from "@/lib/observability";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!rawBody || rawBody.trim() === "") {
    return NextResponse.json({ ok: true, message: "ping" });
  }

  const supabase = createSupabaseServiceRoleClient();

  try {
    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    const payloadEvent =
      typeof payload.event === "string"
        ? payload.event
        : typeof payload.type === "string"
          ? payload.type
          : null;

    await confirmShopierOrderCreatedWebhook({
      event:
        request.headers.get("shopier-event") ??
        request.headers.get("x-shopier-event") ??
        payloadEvent,
      payload,
      rawBody,
      signature:
        request.headers.get("shopier-signature") ?? request.headers.get("x-shopier-signature"),
      supabase
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    captureError(error, {
      operation: "shopier.webhook"
    });

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
