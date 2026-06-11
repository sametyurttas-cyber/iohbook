import { NextResponse, type NextRequest } from "next/server";
import { confirmIyzicoCheckoutPayment } from "@/features/checkout/payment-confirmation";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = String(formData.get("token") ?? "");

  if (!token) {
    return NextResponse.redirect(new URL("/checkout?error=missing-payment-token", request.url));
  }

  try {
    const result = await confirmIyzicoCheckoutPayment({
      source: "callback",
      supabase: createSupabaseServiceRoleClient(),
      token
    });

    return NextResponse.redirect(
      new URL(
        result.paid ? "/checkout/success" : "/checkout?error=payment-failed",
        request.url
      )
    );
  } catch {
    return NextResponse.redirect(new URL("/checkout?error=payment-verify-failed", request.url));
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/checkout?error=callback-method-not-supported", request.url)
  );
}

