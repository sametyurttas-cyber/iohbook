import { grantsDigitalAccess } from "@/features/entitlements/entitlement-utils";
import { captureError, logInfo } from "@/lib/observability";
import type { Database, Entitlement, FulfillmentType } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

type ServiceClient = SupabaseClient<Database>;

type OrderItemForEntitlement = {
  fulfillment_type: FulfillmentType;
  id: string;
  variant_id: string | null;
  product_variants: {
    digital_access_expires_at: string | null;
    digital_access_starts_at: string | null;
    digital_delivery_bucket: string | null;
    digital_delivery_path: string | null;
    digital_download_limit: number | null;
    fulfillment_type: FulfillmentType;
  } | null;
};

type OrderForEntitlements = {
  id: string;
  profile_id: string | null;
  order_items: OrderItemForEntitlement[];
};

export async function createEntitlementsForPaidOrder(input: {
  orderId: string;
  supabase: ServiceClient;
}) {
  const { data: order, error: orderError } = await input.supabase
    .from("orders")
    .select(
      "id, profile_id, order_items(id, variant_id, fulfillment_type, product_variants(fulfillment_type, digital_delivery_bucket, digital_delivery_path, digital_download_limit, digital_access_starts_at, digital_access_expires_at))"
    )
    .eq("id", input.orderId)
    .single();

  if (orderError) {
    throw orderError;
  }

  const typedOrder = order as unknown as OrderForEntitlements;

  if (!typedOrder.profile_id) {
    logInfo("entitlements.skipped_guest_order", {
      order_id: typedOrder.id
    });
    return { created: 0, skipped: typedOrder.order_items.length };
  }

  const digitalItems = typedOrder.order_items.filter((item) =>
    grantsDigitalAccess(item.fulfillment_type)
  );

  if (digitalItems.length === 0) {
    return { created: 0, skipped: 0 };
  }

  const itemIds = digitalItems.map((item) => item.id);
  const { data: existing, error: existingError } = await input.supabase
    .from("entitlements")
    .select("order_item_id")
    .in("order_item_id", itemIds);

  if (existingError) {
    throw existingError;
  }

  const existingItemIds = new Set(
    ((existing ?? []) as Pick<Entitlement, "order_item_id">[])
      .map((item) => item.order_item_id)
      .filter(Boolean)
  );

  const rows = digitalItems
    .filter((item) => !existingItemIds.has(item.id))
    .map((item) => {
      const variant = item.product_variants;
      const hasFile = Boolean(variant?.digital_delivery_bucket && variant.digital_delivery_path);
      const isClaimable = item.fulfillment_type === "claimable";

      return {
        download_limit: isClaimable ? null : variant?.digital_download_limit ?? 5,
        kind: item.fulfillment_type,
        order_item_id: item.id,
        profile_id: typedOrder.profile_id,
        starts_at: variant?.digital_access_starts_at ?? null,
        expires_at: variant?.digital_access_expires_at ?? null,
        status: !isClaimable && hasFile ? "active" : "pending",
        storage_bucket: variant?.digital_delivery_bucket ?? null,
        storage_path: variant?.digital_delivery_path ?? null,
        variant_id: item.variant_id
      } satisfies Partial<Entitlement>;
    });

  if (rows.length === 0) {
    return { created: 0, skipped: digitalItems.length };
  }

  const { error: insertError } = await input.supabase.from("entitlements").insert(rows);

  if (insertError) {
    captureError(insertError, {
      operation: "entitlements.create_for_paid_order",
      order_id: typedOrder.id
    });
    throw insertError;
  }

  logInfo("entitlements.created_for_paid_order", {
    count: rows.length,
    order_id: typedOrder.id
  });

  return { created: rows.length, skipped: digitalItems.length - rows.length };
}
