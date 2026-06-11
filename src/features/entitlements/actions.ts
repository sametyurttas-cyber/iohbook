"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/queries";
import { isEntitlementCurrentlyAccessible } from "@/features/entitlements/entitlement-utils";
import { STORAGE_BUCKETS } from "@/features/media/storage-config";
import { captureError, logInfo } from "@/lib/observability";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Entitlement } from "@/types/database";

export async function downloadEntitlement(formData: FormData) {
  const user = await requireUser();

  if (!user) {
    redirect("/sign-in?next=/account/downloads");
  }

  const entitlementId = String(formData.get("entitlement_id") ?? "");

  if (!entitlementId) {
    redirect("/account/downloads?error=missing-entitlement");
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("entitlements")
    .select("*")
    .eq("id", entitlementId)
    .eq("profile_id", user.id)
    .single();

  if (error) {
    captureError(error, {
      entitlement_id: entitlementId,
      operation: "entitlement.download.find"
    });
    redirect("/account/downloads?error=download-not-found");
  }

  const entitlement = data as Entitlement;

  if (
    !isEntitlementCurrentlyAccessible({
      expiresAt: entitlement.expires_at,
      startsAt: entitlement.starts_at,
      status: entitlement.status
    })
  ) {
    redirect("/account/downloads?error=download-not-active");
  }

  if (!entitlement.storage_bucket || !entitlement.storage_path) {
    redirect("/account/downloads?error=download-file-missing");
  }

  if (
    entitlement.download_limit !== null &&
    entitlement.download_count >= entitlement.download_limit
  ) {
    redirect("/account/downloads?error=download-limit-reached");
  }

  if (entitlement.storage_bucket !== STORAGE_BUCKETS.digitalDeliveries) {
    redirect("/account/downloads?error=download-bucket-invalid");
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from(entitlement.storage_bucket)
    .createSignedUrl(entitlement.storage_path, 60 * 5);

  if (signedError) {
    captureError(signedError, {
      entitlement_id: entitlement.id,
      operation: "entitlement.download.signed_url"
    });
    redirect("/account/downloads?error=download-url-failed");
  }

  await supabase
    .from("entitlements")
    .update({ download_count: entitlement.download_count + 1 })
    .eq("id", entitlement.id);

  await supabase.from("audit_logs").insert({
    action: "entitlement.download_url_created",
    actor_profile_id: user.id,
    entity_id: entitlement.id,
    entity_type: "entitlement",
    metadata: {
      bucket: entitlement.storage_bucket,
      path: entitlement.storage_path
    }
  });

  logInfo("entitlement.download_url_created", {
    entitlement_id: entitlement.id,
    profile_id: user.id
  });

  redirect(signed.signedUrl);
}
