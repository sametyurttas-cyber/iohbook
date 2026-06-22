import { requireStaff } from "@/features/auth/queries";
import { getCurrentUser } from "@/features/auth/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { VERIFICATION_BUCKET } from "@/features/verification/config";
import { collapseDuplicateSubmissions } from "@/features/verification/idempotency";
import type {
  Profile,
  SubmissionKind,
  SubmissionReply,
  SubmissionStatus,
  VerificationAttachment,
  VerificationSubmission
} from "@/types/database";

export type AdminSubmissionListItem = VerificationSubmission & {
  profile: Pick<Profile, "email" | "full_name"> | null;
  reply_count: number;
  last_reply_at: string | null;
  attachment_count: number;
};

export type AdminSubmissionDetail = VerificationSubmission & {
  profile: Pick<Profile, "email" | "full_name" | "id"> | null;
};

export type AdminAttachmentWithUrl = VerificationAttachment & {
  signedUrl: string | null;
};

export type AdminSubmissionFilters = {
  kind?: string;
  status?: string;
  bookSlug?: string;
  q?: string;
};

async function requireVerificationStaff() {
  const user = await getCurrentUser();
  if (!user) return null;

  const staff = await requireStaff(["owner", "admin_ops", "support"]);
  if (!staff) return null;

  return staff;
}

export async function listSubmissionsForAdmin(
  filters: AdminSubmissionFilters
): Promise<AdminSubmissionListItem[]> {
  const staff = await requireVerificationStaff();
  if (!staff) return [];

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("verification_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (filters.kind && filters.kind !== "all") {
    query = query.eq("kind", filters.kind as SubmissionKind);
  }

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status as SubmissionStatus);
  }

  if (filters.bookSlug && filters.bookSlug !== "all") {
    query = query.eq("book_slug", filters.bookSlug);
  }

  if (filters.q && filters.q.trim().length > 0) {
    query = query.or(`title.ilike.%${filters.q}%,amazon_order_id.ilike.%${filters.q}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const submissions = collapseDuplicateSubmissions(
    (data ?? []) as unknown as VerificationSubmission[]
  );
  if (submissions.length === 0) {
    return [];
  }

  const profileIds = [...new Set(submissions.map((s) => s.profile_id))];
  const submissionIds = submissions.map((s) => s.id);

  const [profilesResult, repliesResult, attachmentsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", profileIds),
    supabase
      .from("submission_replies")
      .select("submission_id, created_at")
      .in("submission_id", submissionIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("verification_attachments")
      .select("submission_id")
      .in("submission_id", submissionIds)
  ]);

  const profileMap = new Map<string, Pick<Profile, "email" | "full_name">>();
  for (const profile of (profilesResult.data ?? []) as Pick<Profile, "id" | "email" | "full_name">[]) {
    profileMap.set(profile.id, { email: profile.email, full_name: profile.full_name });
  }

  const replyMap = new Map<string, { count: number; lastAt: string | null }>();
  for (const reply of (repliesResult.data ?? []) as { submission_id: string; created_at: string }[]) {
    const existing = replyMap.get(reply.submission_id);
    if (existing) {
      existing.count += 1;
    } else {
      replyMap.set(reply.submission_id, { count: 1, lastAt: reply.created_at });
    }
  }

  const attachmentMap = new Map<string, number>();
  for (const att of (attachmentsResult.data ?? []) as { submission_id: string }[]) {
    attachmentMap.set(att.submission_id, (attachmentMap.get(att.submission_id) ?? 0) + 1);
  }

  return submissions.map((s) => ({
    ...s,
    attachment_count: attachmentMap.get(s.id) ?? 0,
    last_reply_at: replyMap.get(s.id)?.lastAt ?? null,
    profile: profileMap.get(s.profile_id) ?? null,
    reply_count: replyMap.get(s.id)?.count ?? 0
  }));
}

export async function getSubmissionForAdmin(
  submissionId: string
): Promise<AdminSubmissionDetail | null> {
  const staff = await requireVerificationStaff();
  if (!staff) return null;

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("verification_submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const submission = data as unknown as VerificationSubmission;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .eq("id", submission.profile_id)
    .maybeSingle();

  return {
    ...submission,
    profile: profile as Pick<Profile, "id" | "email" | "full_name"> | null
  };
}

export async function listSubmissionRepliesForAdmin(
  submissionId: string
): Promise<(SubmissionReply & { profile_email: string | null; profile_name: string | null })[]> {
  const staff = await requireVerificationStaff();
  if (!staff) return [];

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("submission_replies")
    .select("*")
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    throw error;
  }

  const replies = (data ?? []) as unknown as SubmissionReply[];
  if (replies.length === 0) {
    return [];
  }

  const profileIds = [...new Set(replies.map((r) => r.profile_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .in("id", profileIds);

  const profileMap = new Map<string, { email: string; full_name: string | null }>();
  for (const p of (profiles ?? []) as Pick<Profile, "id" | "email" | "full_name">[]) {
    profileMap.set(p.id, { email: p.email, full_name: p.full_name });
  }

  return replies.map((r) => ({
    ...r,
    profile_email: profileMap.get(r.profile_id)?.email ?? null,
    profile_name: profileMap.get(r.profile_id)?.full_name ?? null
  }));
}

export async function listSubmissionAttachmentsForAdmin(
  submissionId: string
): Promise<AdminAttachmentWithUrl[]> {
  const staff = await requireVerificationStaff();
  if (!staff) return [];

  const supabase = await createSupabaseServerClient();

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

  const attachmentsWithUrls: AdminAttachmentWithUrl[] = [];
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
