import { logInfo } from "@/lib/observability";
import { awardIohPoints } from "@/features/points/service";
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
    .select("id, status, profile_id, total_amount")
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

  // Award IOH points for the purchased amount
  for (const allocation of pending) {
    if (allocation.profile_id && typeof allocation.total_amount === "string") {
      const amount = Math.floor(parseFloat(allocation.total_amount));
      if (amount > 0) {
        try {
          await awardIohPoints({
            amount,
            metadata: {
              source: "token_purchase",
              token_allocation_id: allocation.id
            },
            orderId: input.orderId,
            profileId: allocation.profile_id,
            reason: "manual_adjustment_credit",
            supabase: input.supabase
          });
        } catch (pointsErr) {
          console.error(`Failed to award points for allocation ${allocation.id}:`, pointsErr);
          // Don't crash the entire flow if points award ledger fails, as allocation is already approved.
        }
      }
    }
  }

  logInfo("token_allocations.approved_for_paid_order", {
    approved: pending.length,
    order_id: input.orderId
  });

  return { approved: pending.length, skipped: (existing?.length ?? 0) - pending.length };
}
