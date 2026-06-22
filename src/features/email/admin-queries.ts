import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireStaff } from "@/features/auth/queries";

export async function requireEmailStaff() {
  const staff = await requireStaff(["owner", "admin_ops", "support"]);
  if (!staff) return null;
  return staff;
}

export type EmailEventLog = {
  id: string;
  recipient: string;
  template_key: string | null;
  event_type: string;
  status: "pending" | "failed" | "queued" | "sent" | "skipped";
  created_at: string;
  subject: string;
  provider: string;
  provider_message_id: string | null;
  error_message: string | null;
  payload: Record<string, unknown>;
};

export type AdminEmailStats = {
  totalCount: number;
  last24hCount: number;
  failedCount: number;
  pendingCount: number;
  provider: string;
  last10Failed: EmailEventLog[];
  last10Processed: EmailEventLog[];
};

export async function getAdminEmailStats(): Promise<AdminEmailStats | null> {
  const staff = await requireEmailStaff();
  if (!staff) return null;

  const supabase = await createSupabaseServerClient();
  
  // Total emails
  const { count: totalCount, error: err1 } = await supabase
    .from("email_events")
    .select("*", { count: "exact", head: true });

  // Son 24 saat
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: last24hCount, error: err2 } = await supabase
    .from("email_events")
    .select("*", { count: "exact", head: true })
    .gte("created_at", oneDayAgo);

  // Failed
  const { count: failedCount, error: err3 } = await supabase
    .from("email_events")
    .select("*", { count: "exact", head: true })
    .eq("status", "failed");

  // Pending / Queued
  const { count: pendingCount, error: err4 } = await supabase
    .from("email_events")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "queued"]);

  // Son 10 failed
  const { data: last10Failed, error: err5 } = await supabase
    .from("email_events")
    .select("*")
    .eq("status", "failed")
    .order("created_at", { ascending: false })
    .limit(10);

  // Son 10 işlem (tümü)
  const { data: last10Processed, error: err6 } = await supabase
    .from("email_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (err1 || err2 || err3 || err4 || err5 || err6) {
    console.error("Failed to query email stats for admin", { err1, err2, err3, err4, err5, err6 });
  }

  // Detect provider status
  const provider = process.env.RESEND_API_KEY ? "Resend (Aktif)" : "Resend (Mock/Sandbox)";

  return {
    totalCount: totalCount ?? 0,
    last24hCount: last24hCount ?? 0,
    failedCount: failedCount ?? 0,
    pendingCount: pendingCount ?? 0,
    provider,
    last10Failed: last10Failed ?? [],
    last10Processed: last10Processed ?? []
  };
}

export type AdminEmailLogsFilters = {
  status?: string;
  templateKey?: string;
  q?: string;
  startDate?: string;
  endDate?: string;
};

export async function listAdminEmailLogs(filters: AdminEmailLogsFilters) {
  const staff = await requireEmailStaff();
  if (!staff) return [];

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("email_events")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status as "pending" | "failed" | "queued" | "sent" | "skipped");
  }

  if (filters.templateKey && filters.templateKey !== "all") {
    query = query.eq("template_key", filters.templateKey);
  }

  if (filters.q && filters.q.trim().length > 0) {
    query = query.ilike("recipient", `%${filters.q.trim()}%`);
  }

  if (filters.startDate) {
    query = query.gte("created_at", filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte("created_at", filters.endDate);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to list email logs", error);
    return [];
  }

  return data ?? [];
}

export async function listAdminEmailTemplates() {
  const staff = await requireEmailStaff();
  if (!staff) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .order("key", { ascending: true });

  if (error) {
    console.error("Failed to list email templates", error);
    return [];
  }

  return data ?? [];
}

export async function getAdminEmailTemplateByKey(key: string) {
  const staff = await requireEmailStaff();
  if (!staff) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    console.error("Failed to query email template by key", error);
    return null;
  }

  return data;
}
