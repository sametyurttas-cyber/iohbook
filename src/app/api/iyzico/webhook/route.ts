import { NextResponse, type NextRequest } from "next/server";
import {
  getIyzicoWebhookPaymentId,
  isIyzicoWebhookSuccess,
  type IyzicoWebhookPayload,
  verifyIyzicoWebhookSignatureV3
} from "@/features/checkout/iyzico-webhook";
import { confirmIyzicoCheckoutPayment } from "@/features/checkout/payment-confirmation";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as IyzicoWebhookPayload;
  const signature = request.headers.get("x-iyz-signature-v3");
  const secretKey = process.env.IYZICO_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json({ error: "iyzico-secret-missing" }, { status: 500 });
  }

  const signatureOk = verifyIyzicoWebhookSignatureV3({
    payload,
    secretKey,
    signature
  });

  if (!signatureOk) {
    return NextResponse.json({ error: "invalid-signature" }, { status: 401 });
  }

  if (!payload.token) {
    return NextResponse.json({ error: "missing-token" }, { status: 400 });
  }

  if (!isIyzicoWebhookSuccess(payload)) {
    return NextResponse.json({ received: true, status: "ignored-non-success" });
  }

  try {
    const result = await confirmIyzicoCheckoutPayment({
      source: "webhook",
      supabase: createSupabaseServiceRoleClient(),
      token: payload.token,
      webhookPaymentId: getIyzicoWebhookPaymentId(payload)
    });

    return NextResponse.json({
      idempotent: result.idempotent,
      orderId: result.orderId,
      paid: result.paid,
      received: true
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "webhook-confirmation-failed"
      },
      { status: 500 }
    );
  }
}
