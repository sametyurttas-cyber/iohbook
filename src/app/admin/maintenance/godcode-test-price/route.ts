import { NextResponse } from "next/server";
import { requireStaff } from "@/features/auth/queries";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET() {
  const staff = await requireStaff(["owner", "admin_ops"]);

  if (!staff) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 403 });
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("product_variants")
    .update({ price_minor: 100 })
    .eq("sku", "IOH-GODCODE-PDF")
    .select("id, sku, title, price_minor, currency");

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, variants: data });
}
