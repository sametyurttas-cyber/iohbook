"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/queries";
import { isEntitlementCurrentlyAccessible } from "@/features/entitlements/entitlement-utils";
import { STORAGE_BUCKETS } from "@/features/media/storage-config";
import { captureError, logInfo } from "@/lib/observability";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Entitlement, OrderStatus } from "@/types/database";

type DownloadEntitlementRow = Entitlement & {
  order_items:
    | {
        id: string;
        orders:
          | {
              id: string;
              status: OrderStatus;
            }
          | {
              id: string;
              status: OrderStatus;
            }[]
          | null;
      }
    | {
        id: string;
        orders:
          | {
              id: string;
              status: OrderStatus;
            }
          | {
              id: string;
              status: OrderStatus;
            }[]
          | null;
      }[]
    | null;
};

const signedUrlTtlSeconds = 60 * 5;

function getEntitlementOrderStatus(entitlement: DownloadEntitlementRow) {
  const orderItem = Array.isArray(entitlement.order_items)
    ? entitlement.order_items[0]
    : entitlement.order_items;
  const order = Array.isArray(orderItem?.orders) ? orderItem.orders[0] : orderItem?.orders;
  return order?.status ?? null;
}

function isPaidOrderStatus(status: OrderStatus | null) {
  return status === "paid" || status === "fulfilled" || status === "completed";
}

async function writeDownloadAudit(input: {
  action: string;
  bucket?: string | null;
  entitlementId: string | null;
  error?: unknown;
  path?: string | null;
  profileId: string | null;
  reason?: string;
}) {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.from("audit_logs").insert({
    action: input.action,
    actor_profile_id: input.profileId,
    entity_id: input.entitlementId,
    entity_type: "entitlement",
    metadata: {
      bucket: input.bucket ?? null,
      error:
        input.error instanceof Error
          ? input.error.message
          : input.error
            ? String(input.error)
            : null,
      path: input.path ?? null,
      reason: input.reason ?? null
    }
  });

  if (error) {
    captureError(error, {
      entitlement_id: input.entitlementId,
      operation: "entitlement.download.audit"
    });
  }
}

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
    .select("*, order_items(id, orders(id, status))")
    .eq("id", entitlementId)
    .eq("profile_id", user.id)
    .single();

  if (error) {
    captureError(error, {
      entitlement_id: entitlementId,
      profile_id: user.id,
      operation: "entitlement.download.find"
    });
    await writeDownloadAudit({
      action: "entitlement.download_denied",
      entitlementId,
      error,
      profileId: user.id,
      reason: "not_found_or_not_owned"
    });
    redirect("/account/downloads?error=download-not-found");
  }

  const entitlement = data as unknown as DownloadEntitlementRow;
  const orderStatus = getEntitlementOrderStatus(entitlement);

  if (!isPaidOrderStatus(orderStatus)) {
    await writeDownloadAudit({
      action: "entitlement.download_denied",
      entitlementId: entitlement.id,
      profileId: user.id,
      reason: "order_not_paid"
    });
    redirect("/account/downloads?error=download-order-not-paid");
  }

  if (
    !isEntitlementCurrentlyAccessible({
      expiresAt: entitlement.expires_at,
      startsAt: entitlement.starts_at,
      status: entitlement.status
    })
  ) {
    await writeDownloadAudit({
      action: "entitlement.download_denied",
      entitlementId: entitlement.id,
      profileId: user.id,
      reason: "not_active"
    });
    redirect("/account/downloads?error=download-not-active");
  }

  if (!entitlement.storage_bucket || !entitlement.storage_path) {
    await writeDownloadAudit({
      action: "entitlement.download_denied",
      entitlementId: entitlement.id,
      profileId: user.id,
      reason: "file_missing"
    });
    redirect("/account/downloads?error=download-file-missing");
  }

  if (
    entitlement.download_limit !== null &&
    entitlement.download_count >= entitlement.download_limit
  ) {
    await writeDownloadAudit({
      action: "entitlement.download_denied",
      entitlementId: entitlement.id,
      profileId: user.id,
      reason: "limit_reached"
    });
    redirect("/account/downloads?error=download-limit-reached");
  }

  if (entitlement.storage_bucket !== STORAGE_BUCKETS.digitalDeliveries) {
    await writeDownloadAudit({
      action: "entitlement.download_denied",
      bucket: entitlement.storage_bucket,
      entitlementId: entitlement.id,
      path: entitlement.storage_path,
      profileId: user.id,
      reason: "invalid_bucket"
    });
    redirect("/account/downloads?error=download-bucket-invalid");
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from(entitlement.storage_bucket)
    .createSignedUrl(entitlement.storage_path, signedUrlTtlSeconds);

  if (signedError) {
    captureError(signedError, {
      entitlement_id: entitlement.id,
      operation: "entitlement.download.signed_url"
    });
    redirect("/account/downloads?error=download-url-failed");
  }

  const downloadCountUpdate = await supabase
    .from("entitlements")
    .update({ download_count: entitlement.download_count + 1 })
    .eq("id", entitlement.id)
    .eq("profile_id", user.id);

  if (downloadCountUpdate.error) {
    captureError(downloadCountUpdate.error, {
      entitlement_id: entitlement.id,
      operation: "entitlement.download.increment"
    });
    redirect("/account/downloads?error=download-log-failed");
  }

  await writeDownloadAudit({
    action: "entitlement.download_url_created",
    bucket: entitlement.storage_bucket,
    entitlementId: entitlement.id,
    path: entitlement.storage_path,
    profileId: user.id,
    reason: `signed_url_${signedUrlTtlSeconds}s`
  });

  logInfo("entitlement.download_url_created", {
    entitlement_id: entitlement.id,
    profile_id: user.id
  });

  redirect(signed.signedUrl);
}
