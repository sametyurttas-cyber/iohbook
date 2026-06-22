import { requireAccountUser } from "@/features/account/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { VERIFICATION_BUCKET } from "@/features/verification/config";
import type {
  SubmissionReply,
  VerificationAttachment,
  VerificationSubmission
} from "@/types/database";

export type SubmissionWithMeta = VerificationSubmission & {
  reply_count?: number;
  last_reply_at?: string | null;
};

export type AttachmentWithUrl = VerificationAttachment & {
  signedUrl: string | null;
};

export async function listOwnSubmissions(): Promise<SubmissionWithMeta[]> {
  const user = await requireAccountUser();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("verification_submissions")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  const submissions = (data ?? []) as unknown as VerificationSubmission[];
  if (submissions.length === 0) {
    return [];
  }

  const submissionIds = submissions.map((s) => s.id);

  const { data: replies, error: replyError } = await supabase
    .from("submission_replies")
    .select("submission_id, created_at")
    .in("submission_id", submissionIds)
    .order("created_at", { ascending: false });

  if (replyError) {
    return submissions.map((s) => ({ ...s, reply_count: 0, last_reply_at: null }));
  }

  const replyMap = new Map<string, { count: number; lastAt: string | null }>();

  for (const reply of replies ?? []) {
    const existing = replyMap.get(reply.submission_id);
    if (existing) {
      existing.count += 1;
    } else {
      replyMap.set(reply.submission_id, {
        count: 1,
        lastAt: reply.created_at
      });
    }
  }

  return submissions.map((s) => ({
    ...s,
    reply_count: replyMap.get(s.id)?.count ?? 0,
    last_reply_at: replyMap.get(s.id)?.lastAt ?? null
  }));
}

export async function getOwnSubmission(
  submissionId: string
): Promise<VerificationSubmission | null> {
  const user = await requireAccountUser();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("verification_submissions")
    .select("*")
    .eq("id", submissionId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as unknown as VerificationSubmission | null;
}

export async function listOwnSubmissionReplies(
  submissionId: string
): Promise<SubmissionReply[]> {
  const user = await requireAccountUser();
  const supabase = await createSupabaseServerClient();

  const { data: submission } = await supabase
    .from("verification_submissions")
    .select("id")
    .eq("id", submissionId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!submission) {
    return [];
  }

  const { data, error } = await supabase
    .from("submission_replies")
    .select("*")
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as SubmissionReply[];
}

export async function listOwnSubmissionAttachments(
  submissionId: string
): Promise<AttachmentWithUrl[]> {
  const user = await requireAccountUser();
  const supabase = await createSupabaseServerClient();

  const { data: submission } = await supabase
    .from("verification_submissions")
    .select("id")
    .eq("id", submissionId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!submission) {
    return [];
  }

  const { data, error } = await supabase
    .from("verification_attachments")
    .select("*")
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: true })
    .limit(20);

  if (error) {
    throw error;
  }

  const attachments = (data ?? []) as unknown as VerificationAttachment[];
  if (attachments.length === 0) {
    return [];
  }

  const attachmentsWithUrls: AttachmentWithUrl[] = [];
  const storageAdmin = createSupabaseServiceRoleClient();

  for (const attachment of attachments) {
    const { data: urlData } = await storageAdmin.storage
      .from(VERIFICATION_BUCKET)
      .createSignedUrl(attachment.path, 300);

    attachmentsWithUrls.push({
      ...attachment,
      signedUrl: urlData?.signedUrl ?? null
    });
  }

  return attachmentsWithUrls;
}
