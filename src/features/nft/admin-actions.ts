"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/features/auth/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EntitlementStatus } from "@/types/database";

export async function updateNftFulfillmentStatus(formData: FormData) {
  const staff = await requireStaff(["owner", "admin_ops", "fulfillment"]);

  if (!staff) {
    redirect("/unauthorized");
  }

  const entitlementId = String(formData.get("entitlement_id") ?? "");
  const status = String(formData.get("status") ?? "pending") as EntitlementStatus;

  if (!entitlementId || !["pending", "active", "revoked"].includes(status)) {
    redirect("/admin/nft-orders?error=invalid-status");
  }

  const supabase = await createSupabaseServerClient();
  const { data: entitlement, error: entitlementError } = await supabase
    .from("entitlements")
    .select("id, profile_id, kind")
    .eq("id", entitlementId)
    .eq("kind", "claimable")
    .single();

  if (entitlementError || !entitlement) {
    redirect("/admin/nft-orders?error=entitlement-not-found");
  }

  if (status === "active") {
    if (!entitlement.profile_id) {
      redirect("/admin/nft-orders?error=profile-required");
    }

    const { data: wallet, error: walletError } = await supabase
      .from("user_wallets")
      .select("id")
      .eq("profile_id", entitlement.profile_id)
      .is("revoked_at", null)
      .limit(1)
      .maybeSingle();

    if (walletError) {
      throw walletError;
    }

    if (!wallet) {
      redirect("/admin/nft-orders?error=wallet-required");
    }
  }

  const { error } = await supabase
    .from("entitlements")
    .update({ status })
    .eq("id", entitlementId);

  if (error) {
    redirect(`/admin/nft-orders?error=${encodeURIComponent(error.code ?? "update-failed")}`);
  }

  await supabase.from("audit_logs").insert({
    action: "nft.fulfillment_status_updated",
    actor_profile_id: staff.user.id,
    entity_id: entitlementId,
    entity_type: "entitlement",
    metadata: { status }
  });

  revalidatePath("/admin/nft-orders");
  redirect("/admin/nft-orders?saved=1");
}
