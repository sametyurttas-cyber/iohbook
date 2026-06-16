"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  requireAdminUsersPointManager,
  requireAdminUsersReadStaff
} from "@/features/admin-users/queries";
import { validateManualPointAdjustment } from "@/features/admin-users/permissions";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { captureError, logInfo } from "@/lib/observability";

function parseInteger(value: FormDataEntryValue | null) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function redirectToUser(profileId: string, params: string) {
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${profileId}`);
  redirect(`/admin/users/${profileId}?${params}`);
}

export async function saveAdminUserNotes(formData: FormData) {
  const staff = await requireAdminUsersReadStaff();

  if (!staff.canManagePoints) {
    redirect("/unauthorized");
  }

  const profileId = String(formData.get("profile_id") ?? "");
  const notes = String(formData.get("admin_notes") ?? "").trim();

  if (!profileId) {
    redirect("/admin/users?error=missing-profile");
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data: before, error: beforeError } = await supabase
    .from("profiles")
    .select("admin_notes")
    .eq("id", profileId)
    .maybeSingle();

  if (beforeError) {
    throw beforeError;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ admin_notes: notes.length > 0 ? notes : null })
    .eq("id", profileId);

  if (error) {
    captureError(error, {
      operation: "admin_user.notes_update",
      profile_id: profileId
    });
    throw error;
  }

  const { error: auditError } = await supabase.from("audit_logs").insert({
    action: "admin_user.notes_updated",
    actor_profile_id: staff.user.id,
    after_data: { admin_notes: notes.length > 0 ? notes : null },
    before_data: { admin_notes: before?.admin_notes ?? null },
    entity_id: profileId,
    entity_type: "profile"
  });

  if (auditError) {
    throw auditError;
  }

  logInfo("admin_user.notes_updated", {
    actor_profile_id: staff.user.id,
    profile_id: profileId
  });
  redirectToUser(profileId, "saved=notes");
}

export async function adjustAdminUserPoints(formData: FormData) {
  const staff = await requireAdminUsersPointManager();
  const profileId = String(formData.get("profile_id") ?? "");
  const amount = parseInteger(formData.get("amount"));
  const reason = String(formData.get("reason") ?? "").trim();

  if (!profileId) {
    redirect("/admin/users?error=missing-profile");
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data: balanceRow, error: balanceError } = await supabase
    .from("ioh_point_balances")
    .select("balance")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (balanceError) {
    throw balanceError;
  }

  const validationError = validateManualPointAdjustment({
    amount,
    currentBalance: balanceRow?.balance ?? 0,
    reason
  });

  if (validationError) {
    redirectToUser(profileId, `error=${validationError}`);
  }

  const { data, error } = await supabase.rpc("adjust_ioh_points_manually", {
    p_actor_profile_id: staff.user.id,
    p_amount: amount,
    p_metadata: {
      source: "admin_users_module"
    },
    p_profile_id: profileId,
    p_reason_text: reason
  });

  if (error) {
    captureError(error, {
      operation: "admin_user.points_adjust",
      profile_id: profileId
    });
    redirectToUser(profileId, `error=${encodeURIComponent(error.code ?? "points-failed")}`);
  }

  const result = data?.[0];

  logInfo("admin_user.points_adjusted", {
    actor_profile_id: staff.user.id,
    amount,
    balance: result?.balance ?? null,
    ledger_id: result?.ledger_id ?? null,
    profile_id: profileId
  });
  redirectToUser(profileId, "saved=points");
}
