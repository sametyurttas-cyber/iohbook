"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendOrderShippedEmail } from "@/features/email/events";
import { requireOrderStaff, type AdminOrder } from "@/features/orders/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { captureError, logInfo } from "@/lib/observability";
import type { FulfillmentShipment, ShipmentStatus } from "@/types/database";

type OperationPayload = {
  notes?: string | null;
  provider?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
};

function parseOptionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function redirectToOrders(orderId: string, saved: string) {
  revalidatePath("/admin/orders");
  redirect(`/admin/orders?selected=${orderId}&saved=${saved}`);
}

async function getOrderSnapshot(orderId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, fulfillment_shipments(*), order_items(*), payment_attempts(*)")
    .eq("id", orderId)
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as AdminOrder;
}

function latestShipment(order: AdminOrder) {
  return [...(order.fulfillment_shipments ?? [])].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
  )[0];
}

async function writeAuditLog(
  action: string,
  actorProfileId: string,
  orderId: string,
  beforeData: Record<string, unknown>,
  afterData: Record<string, unknown>,
  metadata: Record<string, unknown> = {}
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("audit_logs").insert({
    action,
    actor_profile_id: actorProfileId,
    after_data: afterData,
    before_data: beforeData,
    entity_id: orderId,
    entity_type: "order",
    metadata
  });

  if (error) {
    throw error;
  }
}

async function upsertShipment(
  orderId: string,
  existing: FulfillmentShipment | undefined,
  status: ShipmentStatus,
  payload: OperationPayload
) {
  const supabase = await createSupabaseServerClient();
  const shipmentPayload = {
    notes: payload.notes ?? existing?.notes ?? null,
    provider: payload.provider ?? existing?.provider ?? null,
    status,
    tracking_number: payload.tracking_number ?? existing?.tracking_number ?? null,
    tracking_url: payload.tracking_url ?? existing?.tracking_url ?? null,
    ...(status === "shipped" ? { shipped_at: new Date().toISOString() } : {}),
    ...(status === "delivered" ? { delivered_at: new Date().toISOString() } : {})
  };

  const result = existing
    ? await supabase
        .from("fulfillment_shipments")
        .update(shipmentPayload)
        .eq("id", existing.id)
        .select("*")
        .single()
    : await supabase
        .from("fulfillment_shipments")
        .insert({
          ...shipmentPayload,
          order_id: orderId
        })
        .select("*")
        .single();

  if (result.error) {
    captureError(result.error, {
      operation: "admin.shipment_upsert",
      order_id: orderId,
      shipment_status: status
    });
    throw result.error;
  }

  return result.data as FulfillmentShipment;
}

export async function markOrderPreparing(formData: FormData) {
  const staff = await requireOrderStaff();
  const orderId = String(formData.get("order_id") ?? "");

  if (!orderId) {
    redirect("/admin/orders?error=missing-order");
  }

  const before = await getOrderSnapshot(orderId);
  const shipment = await upsertShipment(orderId, latestShipment(before), "preparing", {
    notes: parseOptionalString(formData.get("notes"))
  });
  const after = await getOrderSnapshot(orderId);

  await writeAuditLog(
    "order.mark_preparing",
    staff.user.id,
    orderId,
    { order_status: before.status, shipment: latestShipment(before) ?? null },
    { order_status: after.status, shipment },
    { shipment_id: shipment.id }
  );
  logInfo("admin.order_preparing", {
    order_id: orderId,
    shipment_id: shipment.id
  });

  redirectToOrders(orderId, "preparing");
}

export async function markOrderShipped(formData: FormData) {
  const staff = await requireOrderStaff();
  const orderId = String(formData.get("order_id") ?? "");

  if (!orderId) {
    redirect("/admin/orders?error=missing-order");
  }

  const before = await getOrderSnapshot(orderId);
  const supabase = await createSupabaseServerClient();
  const shipment = await upsertShipment(orderId, latestShipment(before), "shipped", {
    notes: parseOptionalString(formData.get("notes")),
    provider: parseOptionalString(formData.get("provider")),
    tracking_number: parseOptionalString(formData.get("tracking_number")),
    tracking_url: parseOptionalString(formData.get("tracking_url"))
  });
  const { error } = await supabase
    .from("orders")
    .update({ status: "fulfilled" })
    .eq("id", orderId);

  if (error) {
    captureError(error, {
      operation: "admin.order_mark_shipped",
      order_id: orderId
    });
    throw error;
  }

  const after = await getOrderSnapshot(orderId);
  await writeAuditLog(
    "order.mark_shipped",
    staff.user.id,
    orderId,
    { order_status: before.status, shipment: latestShipment(before) ?? null },
    { order_status: after.status, shipment },
    {
      shipment_id: shipment.id,
      tracking_number: shipment.tracking_number
    }
  );

  await sendOrderShippedEmail(orderId);
  logInfo("admin.order_shipped", {
    order_id: orderId,
    shipment_id: shipment.id,
    tracking_number: shipment.tracking_number
  });

  redirectToOrders(orderId, "shipped");
}

export async function markOrderCompleted(formData: FormData) {
  const staff = await requireOrderStaff();
  const orderId = String(formData.get("order_id") ?? "");

  if (!orderId) {
    redirect("/admin/orders?error=missing-order");
  }

  const before = await getOrderSnapshot(orderId);
  const supabase = await createSupabaseServerClient();
  const shipment = await upsertShipment(orderId, latestShipment(before), "delivered", {
    notes: parseOptionalString(formData.get("notes"))
  });
  const { error } = await supabase
    .from("orders")
    .update({ completed_at: new Date().toISOString(), status: "completed" })
    .eq("id", orderId);

  if (error) {
    captureError(error, {
      operation: "admin.order_mark_completed",
      order_id: orderId
    });
    throw error;
  }

  const after = await getOrderSnapshot(orderId);
  await writeAuditLog(
    "order.mark_completed",
    staff.user.id,
    orderId,
    { order_status: before.status, shipment: latestShipment(before) ?? null },
    { order_status: after.status, shipment },
    { shipment_id: shipment.id }
  );
  logInfo("admin.order_completed", {
    order_id: orderId,
    shipment_id: shipment.id
  });

  redirectToOrders(orderId, "completed");
}
