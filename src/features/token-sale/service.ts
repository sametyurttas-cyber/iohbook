import { logInfo } from "@/lib/observability";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

type ServiceClient = SupabaseClient<Database>;

export async function approveTokenAllocationsForPaidOrder(input: {
  orderId: string;
  paymentAttemptId?: string | null;
  supabase: ServiceClient;
}) {
  const { data: existing, error: existingError } = await input.supabase
    .from("token_allocations")
    .select("id, status")
    .eq("order_id", input.orderId);

  if (existingError) {
    throw existingError;
  }

  const pending = (existing ?? []).filter((row) => row.status === "pending");

  if (pending.length === 0) {
    return { approved: 0, skipped: existing?.length ?? 0 };
  }

  const { error } = await input.supabase
    .from("token_allocations")
    .update({
      payment_attempt_id: input.paymentAttemptId ?? undefined,
      status: "approved"
    })
    .eq("order_id", input.orderId)
    .eq("status", "pending");

  if (error) {
    throw error;
  }

  logInfo("token_allocations.approved_for_paid_order", {
    approved: pending.length,
    order_id: input.orderId
  });

  return { approved: pending.length, skipped: (existing?.length ?? 0) - pending.length };
}
