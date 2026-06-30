"use server";

import { requireStaff, getCurrentUser } from "@/features/auth/queries";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { revalidatePath } from "next/cache";

export type ContactMessageInput = {
  name: string;
  email: string;
  purpose: "press" | "partnership" | "support" | "tech" | "other";
  subject?: string;
  message: string;
};

async function checkRateLimit(email: string): Promise<boolean> {
  try {
    const supabase = createSupabaseServiceRoleClient() as any;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .gt("created_at", oneHourAgo);

    if (error) return true; // allow if check fails to prevent blocking genuine requests
    return (count || 0) < 5; // allow up to 5 messages per hour per email address
  } catch {
    return true;
  }
}

export async function submitContactMessageAction(input: ContactMessageInput) {
  const name = input.name?.trim();
  const email = input.email?.trim();
  const purpose = input.purpose;
  const subject = input.subject?.trim();
  const message = input.message?.trim();

  if (!name || name.length < 2 || name.length > 100) {
    return { ok: false, error: "Please enter a valid name (2-100 characters)." };
  }

  const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
  if (!email || !emailRegex.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const allowedPurposes = ["press", "partnership", "support", "tech", "other"];
  if (!purpose || !allowedPurposes.includes(purpose)) {
    return { ok: false, error: "Invalid contact purpose." };
  }

  if (!message || message.length < 10 || message.length > 5000) {
    return { ok: false, error: "Please enter a message between 10 and 5000 characters." };
  }

  if (subject && subject.length > 200) {
    return { ok: false, error: "Subject must be under 200 characters." };
  }

  const isAllowed = await checkRateLimit(email);
  if (!isAllowed) {
    return { ok: false, error: "Too many messages sent. Please wait an hour before sending again." };
  }

  try {
    const user = await getCurrentUser();
    const supabase = createSupabaseServiceRoleClient() as any;

    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      purpose,
      subject: subject || null,
      message,
      user_id: user?.id || null,
      status: "unread"
    });

    if (error) {
      return { ok: false, error: `Database error: ${error.message || JSON.stringify(error)}` };
    }

    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("submitContactMessageAction failed", err);
    return { ok: false, error: `Failed to transmit signal: ${msg}` };
  }
}

export async function getContactMessagesAction(filters: {
  status?: "unread" | "read" | "archived";
  purpose?: string;
}) {
  const staff = await requireStaff(["owner", "admin_ops"]);
  if (!staff) {
    return { ok: false, error: "Unauthorized access." };
  }

  try {
    const supabase = createSupabaseServiceRoleClient() as any;
    let query = supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.status) {
      query = query.eq("status", filters.status);
    }
    if (filters.purpose && filters.purpose !== "all") {
      query = query.eq("purpose", filters.purpose);
    }

    const { data, error } = await query;
    if (error) {
      return { ok: false, error: `Database error: ${error.message || JSON.stringify(error)}` };
    }

    return { ok: true, data: data || [] };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("getContactMessagesAction failed", err);
    return { ok: false, error: `Failed to fetch signals: ${msg}` };
  }
}

export async function updateContactMessageStatusAction(
  id: string,
  status: "unread" | "read" | "archived"
) {
  const staff = await requireStaff(["owner", "admin_ops"]);
  if (!staff) {
    return { ok: false, error: "Unauthorized access." };
  }

  try {
    const supabase = createSupabaseServiceRoleClient() as any;
    const { error } = await supabase
      .from("contact_messages")
      .update({ status })
      .eq("id", id);

    if (error) {
      return { ok: false, error: `Database error: ${error.message || JSON.stringify(error)}` };
    }

    revalidatePath("/admin/contact");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("updateContactMessageStatusAction failed", err);
    return { ok: false, error: `Failed to update status: ${msg}` };
  }
}

export async function updateContactMessageNotesAction(id: string, notes: string) {
  const staff = await requireStaff(["owner", "admin_ops"]);
  if (!staff) {
    return { ok: false, error: "Unauthorized access." };
  }

  try {
    const supabase = createSupabaseServiceRoleClient() as any;
    const { error } = await supabase
      .from("contact_messages")
      .update({ admin_notes: notes || null })
      .eq("id", id);

    if (error) {
      return { ok: false, error: `Database error: ${error.message || JSON.stringify(error)}` };
    }

    revalidatePath("/admin/contact");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("updateContactMessageNotesAction failed", err);
    return { ok: false, error: `Failed to update notes: ${msg}` };
  }
}
