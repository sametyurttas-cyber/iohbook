import { NextResponse, type NextRequest } from "next/server";
import { confirmShopierOrderCreatedWebhook } from "@/features/checkout/shopier-confirmation";
import { captureError } from "@/lib/observability";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
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
  } catch (error) {
    captureError(error, {
      operation: "shopier.webhook"
    });

    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
