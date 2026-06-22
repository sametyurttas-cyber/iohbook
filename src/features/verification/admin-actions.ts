"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { trackServerAnalyticsEvent } from "@/features/analytics/business-events";
import { requireStaff } from "@/features/auth/queries";
import { getCurrentUser } from "@/features/auth/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { captureError, logInfo } from "@/lib/observability";
import { getVerificationRewardConfig } from "@/features/verification/config";
import {
  createVerificationRecordId,
  isValidVerificationRequestId
} from "@/features/verification/idempotency";
import type { SubmissionStatus } from "@/types/database";

async function requireAdminActor() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/sign-in?next=/admin/verifications");
  }

  const staff = await requireStaff(["owner", "admin_ops", "support"]);
  if (!staff) {
    redirect("/unauthorized");
  }

  const canApprove = staff.roles.includes("owner") || staff.roles.includes("admin_ops");
  return { canApprove, staff, user };
}

async function writeAuditLog(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  actorId: string,
  action: string,
  submissionId: string,
  metadata: Record<string, unknown>
) {
  await supabase.from("audit_logs").insert({
    action,
    actor_profile_id: actorId,
    after_data: metadata,
    entity_id: submissionId,
    entity_type: "verification_submission",
    metadata
  });
}

export async function markSubmissionUnderReview(formData: FormData) {
  const { canApprove, user } = await requireAdminActor();

  if (!canApprove) {
    redirect("/unauthorized");
  }

  const submissionId = String(formData.get("submission_id") ?? "");

  if (!submissionId) {
    redirect("/admin/verifications");
  }

  const supabase = await createSupabaseServerClient();

  const { data: current } = await supabase
    .from("verification_submissions")
    .select("status")
    .eq("id", submissionId)
    .maybeSingle();

  if (!current || current.status !== "pending") {
    redirect(`/admin/verifications/${submissionId}?error=invalid_status`);
  }

  const { error } = await supabase
    .from("verification_submissions")
    .update({
      status: "under_review" as SubmissionStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id
    })
    .eq("id", submissionId);

  if (error) {
    captureError(error, { operation: "verification.under_review", submission_id: submissionId });
    redirect(`/admin/verifications/${submissionId}?error=update_failed`);
  }

  await writeAuditLog(supabase, user.id, "verification.under_review", submissionId, {
    actor_email: user.email,
    from: "pending",
    to: "under_review"
  });

  logInfo("verification.under_review", { submission_id: submissionId, actor: user.id });

  revalidatePath("/admin/verifications");
  revalidatePath(`/admin/verifications/${submissionId}`);
  redirect(`/admin/verifications/${submissionId}`);
}

export async function createAdminReply(formData: FormData) {
  const { user } = await requireAdminActor();
  const submissionId = String(formData.get("submission_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const requestId = String(formData.get("request_id") ?? "");

  if (!submissionId || !body || !isValidVerificationRequestId(requestId)) {
    redirect(`/admin/verifications/${submissionId}?error=reply_empty`);
  }

  const replyId = createVerificationRecordId(
    "verification-admin-reply",
    submissionId,
    user.id,
    requestId
  );

  const supabase = await createSupabaseServerClient();

  const { data: submission } = await supabase
    .from("verification_submissions")
    .select("status, profile_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission) {
    redirect("/admin/verifications");
  }

  const { error: replyError } = await supabase.from("submission_replies").insert({
    body,
    id: replyId,
    is_staff: true,
    profile_id: user.id,
    submission_id: submissionId
  });

  if (replyError) {
    if (replyError.code === "23505") {
      redirect(`/admin/verifications/${submissionId}`);
    }

    captureError(replyError, { operation: "verification.admin_reply", submission_id: submissionId });
    redirect(`/admin/verifications/${submissionId}?error=reply_failed`);
  }

  const newStatus: SubmissionStatus =
    submission.status === "pending" || submission.status === "under_review"
      ? "responded"
      : submission.status as SubmissionStatus;

  await supabase
    .from("verification_submissions")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", submissionId);

  await writeAuditLog(supabase, user.id, "verification.reply", submissionId, {
    actor_email: user.email,
    reply_length: body.length
  });

  // TODO: Send email notification to customer about admin reply.
  // Requires: sendVerificationReplyEmail({ to: customerEmail, submissionTitle, reply: body })
  // Current email infrastructure (src/features/email/events.ts) does not have a verification reply template.
  // This will be added in a future prompt. Email failure must not block the admin action.

  logInfo("verification.admin_reply", { submission_id: submissionId, actor: user.id });

  revalidatePath(`/admin/verifications/${submissionId}`);
  revalidatePath(`/account/rewards/${submissionId}`);
  redirect(`/admin/verifications/${submissionId}`);
}

export async function rejectSubmission(formData: FormData) {
  const { canApprove, user } = await requireAdminActor();

  if (!canApprove) {
    redirect("/unauthorized");
  }

  const submissionId = String(formData.get("submission_id") ?? "");
  const rejectionReason = String(formData.get("rejection_reason") ?? "").trim();

  if (!submissionId) {
    redirect("/admin/verifications");
  }

  if (!rejectionReason) {
    redirect(`/admin/verifications/${submissionId}?error=rejection_reason_required`);
  }

  const supabase = await createSupabaseServerClient();

  const { data: rejectedSubmission, error } = await supabase
    .from("verification_submissions")
    .update({
      rejection_reason: rejectionReason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      status: "rejected" as SubmissionStatus
    })
    .eq("id", submissionId)
    .select("profile_id, kind, book_slug")
    .maybeSingle();

  if (error) {
    captureError(error, { operation: "verification.reject", submission_id: submissionId });
    redirect(`/admin/verifications/${submissionId}?error=update_failed`);
  }

  await writeAuditLog(supabase, user.id, "verification.reject", submissionId, {
    actor_email: user.email,
    rejection_reason: rejectionReason
  });

  logInfo("verification.reject", { submission_id: submissionId, actor: user.id });

  if (
    rejectedSubmission?.kind === "amazon_purchase" ||
    rejectedSubmission?.kind === "amazon_review"
  ) {
    await trackServerAnalyticsEvent({
      eventName: "amazon_verification_rejected",
      idempotencyKey: submissionId,
      metadata: {
        book_slug: rejectedSubmission.book_slug,
        kind: rejectedSubmission.kind,
        submission_id: submissionId
      },
      path: "/admin/verifications",
      profileId: rejectedSubmission.profile_id
    });
  }

  revalidatePath("/admin/verifications");
  revalidatePath(`/admin/verifications/${submissionId}`);
  revalidatePath(`/account/rewards/${submissionId}`);
  redirect(`/admin/verifications/${submissionId}`);
}

export async function closeSubmission(formData: FormData) {
  const { canApprove, user } = await requireAdminActor();

  if (!canApprove) {
    redirect("/unauthorized");
  }

  const submissionId = String(formData.get("submission_id") ?? "");

  if (!submissionId) {
    redirect("/admin/verifications");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("verification_submissions")
    .update({
      status: "closed" as SubmissionStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", submissionId);

  if (error) {
    captureError(error, { operation: "verification.close", submission_id: submissionId });
    redirect(`/admin/verifications/${submissionId}?error=update_failed`);
  }

  await writeAuditLog(supabase, user.id, "verification.close", submissionId, {
    actor_email: user.email
  });

  logInfo("verification.close", { submission_id: submissionId, actor: user.id });

  revalidatePath("/admin/verifications");
  revalidatePath(`/admin/verifications/${submissionId}`);
  redirect(`/admin/verifications/${submissionId}`);
}

export async function updateAdminNotes(formData: FormData) {
  const { canApprove, user } = await requireAdminActor();

  if (!canApprove) {
    redirect("/unauthorized");
  }

  const submissionId = String(formData.get("submission_id") ?? "");
  const notes = String(formData.get("admin_notes") ?? "").trim() || null;

  if (!submissionId) {
    redirect("/admin/verifications");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("verification_submissions")
    .update({
      admin_notes: notes,
      updated_at: new Date().toISOString()
    })
    .eq("id", submissionId);

  if (error) {
    captureError(error, { operation: "verification.update_notes", submission_id: submissionId });
    redirect(`/admin/verifications/${submissionId}?error=notes_failed`);
  }

  await writeAuditLog(supabase, user.id, "verification.admin_notes_update", submissionId, {
    actor_email: user.email,
    notes_length: notes?.length ?? 0
  });

  logInfo("verification.admin_notes_update", { submission_id: submissionId, actor: user.id });

  revalidatePath(`/admin/verifications/${submissionId}`);
  redirect(`/admin/verifications/${submissionId}?saved=notes`);
}

export async function approveSubmission(formData: FormData) {
  const { canApprove, user } = await requireAdminActor();

  if (!canApprove) {
    redirect("/unauthorized");
  }

  const submissionId = String(formData.get("submission_id") ?? "");
  const rewardAmountRaw = String(formData.get("reward_amount") ?? "0");
  const adminNote = String(formData.get("admin_note") ?? "").trim() || null;

  if (!submissionId) {
    redirect("/admin/verifications");
  }

  const rewardAmount = Number(rewardAmountRaw);

  if (!Number.isInteger(rewardAmount) || rewardAmount < 0) {
    redirect(`/admin/verifications/${submissionId}?error=negative_reward`);
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data: submission, error: submissionError } = await supabase
    .from("verification_submissions")
    .select("kind, profile_id, book_slug")
    .eq("id", submissionId)
    .maybeSingle();

  if (submissionError || !submission) {
    captureError(submissionError, {
      operation: "verification.approve_lookup",
      submission_id: submissionId
    });
    redirect(`/admin/verifications/${submissionId}?error=approve_submission_not_found`);
  }

  const expectedReward = getVerificationRewardConfig(submission.kind).amount;

  if (!adminNote && rewardAmount !== expectedReward) {
    redirect(`/admin/verifications/${submissionId}?error=note_required_for_custom_reward`);
  }

  const { data, error } = await supabase.rpc("approve_verification_submission", {
    p_admin_note: adminNote,
    p_actor_profile_id: user.id,
    p_reward_amount: rewardAmount,
    p_submission_id: submissionId
  });

  if (error) {
    captureError(error, {
      operation: "verification.approve",
      submission_id: submissionId
    });
    redirect(`/admin/verifications/${submissionId}?error=approve_failed`);
  }

  const result = (data as { approved: boolean; ledger_id: string | null; balance: number | null; error_code: string | null }[] | null)?.[0];

  if (!result?.approved) {
    const errorCode = result?.error_code ?? "unknown";
    redirect(`/admin/verifications/${submissionId}?error=approve_${errorCode}`);
  }

  // TODO: Send email notification to customer about approval + reward.
  // Current email infrastructure (src/features/email/events.ts) does not have a verification approval template.
  // This will be added in a future prompt. Email failure must not block the approval action.

  logInfo("verification.approve", {
    actor: user.id,
    ledger_id: result.ledger_id,
    reward_amount: rewardAmount,
    submission_id: submissionId
  });

  if (submission.kind === "amazon_purchase" || submission.kind === "amazon_review") {
    await trackServerAnalyticsEvent({
      eventName: "amazon_verification_approved",
      idempotencyKey: submissionId,
      metadata: {
        book_slug: submission.book_slug,
        kind: submission.kind,
        reward_amount: rewardAmount,
        submission_id: submissionId
      },
      path: "/admin/verifications",
      profileId: submission.profile_id
    });
  }
  if (rewardAmount > 0 && result.ledger_id) {
    await trackServerAnalyticsEvent({
      eventName: "ioh_points_awarded",
      idempotencyKey: result.ledger_id,
      metadata: {
        amount: rewardAmount,
        ledger_id: result.ledger_id,
        order_id: null,
        reason: submission.kind
      },
      path: "/account/rewards",
      profileId: submission.profile_id
    });
  }

  revalidatePath("/admin/verifications");
  revalidatePath(`/admin/verifications/${submissionId}`);
  revalidatePath(`/account/rewards/${submissionId}`);
  revalidatePath("/account/rewards");
  revalidatePath(`/account/profile`);
  redirect(`/admin/verifications/${submissionId}?saved=approved`);
}
