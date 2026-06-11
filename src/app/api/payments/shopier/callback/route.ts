import { NextResponse, type NextRequest } from "next/server";
import { confirmShopierPayment } from "@/features/checkout/shopier-confirmation";
import { parseShopierCallback } from "@/features/checkout/shopier";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { captureError } from "@/lib/observability";

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const payload = parseShopierCallback(formData);
  const supabase = createSupabaseServiceRoleClient();

  try {
    const result = await confirmShopierPayment({
      payload,
      supabase
    });

    return redirectTo(
      request,
      result.paid ? "/checkout/success?provider=shopier" : "/checkout?error=shopier-payment-failed"
    );
  } catch (error) {
    captureError(error, {
      operation: "shopier.callback"
    });

    return redirectTo(request, "/checkout?error=shopier-callback-failed");
  }
}

export async function GET(request: NextRequest) {
  return redirectTo(request, "/checkout?notice=shopier-return-pending");
}
