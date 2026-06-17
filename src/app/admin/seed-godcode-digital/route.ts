import { NextResponse } from "next/server";
import { requireStaff } from "@/features/auth/queries";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET() {
  const staff = await requireStaff(["owner", "admin_ops"]);

  if (!staff) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, slug")
    .eq("slug", "godcode")
    .eq("type", "book")
    .single();

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 });
  }

  const { data: variant, error: variantError } = await supabase
    .from("product_variants")
    .upsert(
      {
        active: true,
        currency: "TRY",
        digital_delivery_bucket: "digital-deliveries",
        digital_delivery_path: "ebooks/godcode.pdf",
        digital_download_limit: 5,
        format: "ebook",
        fulfillment_type: "digital",
        lead_time_days: 0,
        max_per_order: 3,
        metadata: { mvp_delivery: "private_signed_url" },
        price_minor: 45000,
        product_id: product.id,
        sku: "IOH-GODCODE-PDF",
        sort_order: 0,
        stock_policy: "unlimited",
        title: "PDF"
      },
      { onConflict: "sku" }
    )
    .select("id, sku, title, format, fulfillment_type, active, digital_delivery_bucket, digital_delivery_path")
    .single();

  if (variantError) {
    return NextResponse.json({ error: variantError.message }, { status: 500 });
  }

  await supabase
    .from("products")
    .update({
      requires_shipping: false,
      status: "active",
      updated_at: new Date().toISOString()
    })
    .eq("id", product.id);

  return NextResponse.json({ ok: true, product: product.slug, variant });
}
