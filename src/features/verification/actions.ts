"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccountUser } from "@/features/account/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { captureError, logInfo } from "@/lib/observability";
import { VERIFICATION_BUCKET } from "@/features/verification/config";
import { isVerificationSchemaUnavailableError } from "@/features/verification/errors";
import {
  sanitizeFileName,
  requiresAttachment,
  validateAttachment,
  validateSubmission,
  type AttachmentInput,
  type SubmissionInput
} from "@/features/verification/validation";
import type { SubmissionKind, SubmissionStatus } from "@/types/database";

export async function createVerificationSubmission(formData: FormData) {
  const user = await requireAccountUser();
  const supabase = await createSupabaseServerClient();
  const storageAdmin = createSupabaseServiceRoleClient();

  const kind = String(formData.get("kind") ?? "") as SubmissionKind;
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim() || null;
  const bookSlug = String(formData.get("book_slug") ?? "").trim() || null;
  const amazonOrderId = String(formData.get("amazon_order_id") ?? "").trim() || null;
  const amazonReviewUrl = String(formData.get("amazon_review_url") ?? "").trim() || null;
  const amazonProfileName = String(formData.get("amazon_profile_name") ?? "").trim() || null;

  const input: SubmissionInput = {
    amazonOrderId: amazonOrderId ?? undefined,
    amazonProfileName: amazonProfileName ?? undefined,
    amazonReviewUrl: amazonReviewUrl ?? undefined,
    body: body ?? undefined,
    bookSlug: bookSlug ?? undefined,
    kind,
    title
  };

  const errors = validateSubmission(input);

  if (errors.length > 0) {
    redirect(`/account/rewards/new?error=${errors[0].code}`);
  }

  const files = formData.getAll("attachments").filter((f): f is File => f instanceof File);
  const validAttachments: { file: File; sanitized: string }[] = [];

  for (const file of files) {
    if (file.size === 0) continue;

    const attInput: AttachmentInput = {
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size
    };

    const attErrors = validateAttachment(attInput);

    if (attErrors.length > 0) {
      redirect(`/account/rewards/new?error=${attErrors[0].code}`);
    }

    validAttachments.push({ file, sanitized: sanitizeFileName(file.name) });
  }

  if (requiresAttachment(kind) && validAttachments.length === 0) {
    redirect("/account/rewards/new?error=attachment_required");
  }

  const { data: submission, error: insertError } = await supabase
    .from("verification_submissions")
    .insert({
      amazon_order_id: amazonOrderId,
      amazon_profile_name: amazonProfileName,
      amazon_review_url: amazonReviewUrl,
      body,
      book_slug: bookSlug,
      kind,
      profile_id: user.id,
      title
    })
    .select("id")
    .single();

  if (insertError || !submission) {
    captureError(insertError, {
      operation: "verification.create_submission",
      profile_id: user.id
    });
    redirect(
      isVerificationSchemaUnavailableError(insertError)
        ? "/account/rewards/new?error=setup_required"
        : "/account/rewards/new?error=insert_failed"
    );
  }

  const submissionId = submission.id;

  for (const { file, sanitized } of validAttachments) {
    const storagePath = `${user.id}/${submissionId}/${sanitized}`;

    const { error: uploadError } = await storageAdmin.storage
      .from(VERIFICATION_BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      captureError(uploadError, {
        operation: "verification.upload_attachment",
        path: storagePath,
        submission_id: submissionId
      });
      continue;
    }

    const { error: metadataError } = await supabase.from("verification_attachments").insert({
      bucket: VERIFICATION_BUCKET,
      file_name: sanitized,
      mime_type: file.type,
      path: storagePath,
      profile_id: user.id,
      size_bytes: file.size,
      submission_id: submissionId
    });

    if (metadataError) {
      await storageAdmin.storage.from(VERIFICATION_BUCKET).remove([storagePath]);
      captureError(metadataError, {
        operation: "verification.insert_attachment_metadata",
        path: storagePath,
        submission_id: submissionId
      });
    }
  }

  logInfo("verification.submission_created", {
    kind,
    profile_id: user.id,
    submission_id: submissionId
  });

  revalidatePath("/account/rewards");
  redirect(`/account/rewards/${submissionId}`);
}

export async function createSubmissionReply(formData: FormData) {
  const user = await requireAccountUser();
  const supabase = await createSupabaseServerClient();

  const submissionId = String(formData.get("submission_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!submissionId || !body) {
    redirect(`/account/rewards/${submissionId}?error=reply_empty`);
  }

  const { data: submission } = await supabase
    .from("verification_submissions")
    .select("status")
    .eq("id", submissionId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!submission) {
    redirect("/account/rewards");
  }

  const status = submission.status as SubmissionStatus;
  const openStatuses: SubmissionStatus[] = ["pending", "under_review", "responded"];

  if (!openStatuses.includes(status)) {
    redirect(`/account/rewards/${submissionId}?error=reply_closed`);
  }

  const { error } = await supabase.from("submission_replies").insert({
    body,
    is_staff: false,
    profile_id: user.id,
    submission_id: submissionId
  });

  if (error) {
    captureError(error, {
      operation: "verification.create_reply",
      profile_id: user.id,
      submission_id: submissionId
    });
    redirect(`/account/rewards/${submissionId}?error=reply_failed`);
  }

  logInfo("verification.reply_created", {
    profile_id: user.id,
    submission_id: submissionId
  });

  revalidatePath(`/account/rewards/${submissionId}`);
  redirect(`/account/rewards/${submissionId}`);
}
