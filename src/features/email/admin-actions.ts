"use server";

import { requireStaff } from "@/features/auth/queries";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { sendTransactionalEmail, sendTestEmail } from "@/features/email/service";
import { revalidatePath } from "next/cache";

export async function retryFailedEmailAction(eventId: string) {
  const staff = await requireStaff(["owner", "admin_ops"]);
  if (!staff) {
    return { ok: false, error: "Bu işlem için yetkiniz bulunmamaktadır." };
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data: event, error } = await supabase
      .from("email_events")
      .select("*")
      .eq("id", eventId)
      .maybeSingle();

    if (error || !event) {
      return { ok: false, error: "E-posta kaydı bulunamadı." };
    }

    if (event.status !== "failed") {
      return { ok: false, error: "Sadece başarısız olan e-postalar yeniden gönderilebilir." };
    }

    const payload = (event.payload as Record<string, unknown>) || {};
    const variables = (payload._variables as Record<string, unknown>) || {};
    
    const metadata = { ...payload };
    delete metadata._variables;

    // Retry sending
    const result = await sendTransactionalEmail({
      templateKey: event.template_key || event.event_type,
      to: event.recipient,
      profileId: event.profile_id,
      orderId: event.order_id,
      variables,
      metadata
    });

    if (result.ok) {
      revalidatePath("/admin/emails");
      revalidatePath("/admin/emails/logs");
      return { ok: true };
    } else {
      return { ok: false, error: result.error || "E-posta gönderimi başarısız oldu." };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Sunucu hatası: ${msg}` };
  }
}

export async function sendTestEmailAction(to: string, templateKey: string) {
  const staff = await requireStaff(["owner", "admin_ops"]);
  if (!staff) {
    return { ok: false, error: "Bu işlem için yetkiniz bulunmamaktadır." };
  }

  if (!to || !to.includes("@")) {
    return { ok: false, error: "Geçersiz alıcı e-posta adresi." };
  }

  try {
    const result = await sendTestEmail(to, templateKey);
    if (result.ok) {
      revalidatePath("/admin/emails");
      revalidatePath("/admin/emails/logs");
      return { ok: true };
    } else {
      return { ok: false, error: result.error || "Test e-postası gönderilemedi." };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Sunucu hatası: ${msg}` };
  }
}

export async function searchProfilesAction(query: string) {
  const staff = await requireStaff(["owner", "admin_ops", "support"]);
  if (!staff) {
    return { ok: false, error: "Bu işlem için yetkiniz bulunmamaktadır." };
  }

  if (!query || query.trim().length < 2) {
    return { ok: true, data: [] };
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .or(`email.ilike.%${query.trim()}%,full_name.ilike.%${query.trim()}%`)
      .limit(10);

    if (error) throw error;
    return { ok: true, data: data ?? [] };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("searchProfilesAction failed", err);
    return { ok: false, error: `Kullanıcılar aranamadı: ${msg}` };
  }
}

export async function sendManualEmailAction(input: {
  profileId?: string;
  to?: string;
  subject: string;
  body: string;
  templateKey?: string;
  sendToAll?: boolean;
}) {
  const staff = await requireStaff(["owner", "admin_ops"]);
  if (!staff) {
    return { ok: false, error: "Bu işlem için yetkiniz bulunmamaktadır." };
  }

  const subject = input.subject?.trim();
  const body = input.body;

  if (!subject) {
    return { ok: false, error: "E-posta konusu boş bırakılamaz." };
  }

  if (!body || body.trim().length === 0) {
    return { ok: false, error: "E-posta içeriği boş bırakılamaz." };
  }

  const supabase = createSupabaseServiceRoleClient();

  if (input.sendToAll) {
    try {
      const { data: allProfiles, error: fetchErr } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .not("email", "is", null);

      if (fetchErr) throw fetchErr;

      if (!allProfiles || allProfiles.length === 0) {
        return { ok: false, error: "Sistemde tanımlı e-posta adresi olan hiçbir kullanıcı bulunamadı." };
      }

      let successCount = 0;
      let failCount = 0;

      // Loop and send emails dynamically
      for (const profile of allProfiles) {
        if (!profile.email) continue;
        try {
          const result = await sendTransactionalEmail({
            templateKey: input.templateKey || "manual_email",
            to: profile.email,
            profileId: profile.id,
            variables: {
              subject,
              body,
              userName: profile.full_name || "Değerli Okurumuz",
              email: profile.email,
              accountUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.iohcoin.com"}/account`
            }
          });
          if (result.ok) successCount++;
          else failCount++;
        } catch (err) {
          console.error(`Bulk send error for profile ${profile.id}:`, err);
          failCount++;
        }
      }

      revalidatePath("/admin/emails");
      revalidatePath("/admin/emails/logs");
      return { 
        ok: true, 
        message: `Toplu e-posta gönderimi tamamlandı. Başarılı: ${successCount}, Başarısız: ${failCount}` 
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("sendManualEmailAction bulk failed", err);
      return { ok: false, error: `Toplu gönderim sırasında sunucu hatası: ${msg}` };
    }
  }

  const to = input.to?.trim();
  const profileId = input.profileId;

  if (!to || !to.includes("@")) {
    return { ok: false, error: "Geçersiz veya eksik alıcı e-posta adresi." };
  }

  if (!profileId) {
    return { ok: false, error: "Geçerli bir kullanıcı seçilmelidir." };
  }

  try {
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", profileId)
      .maybeSingle();

    if (profileErr || !profile) {
      return { ok: false, error: "Seçilen kullanıcı veritabanında bulunamadı." };
    }

    if (!profile.email) {
      return { ok: false, error: "Seçilen kullanıcının tanımlı bir e-posta adresi bulunmamaktadır." };
    }

    if (profile.email.toLowerCase() !== to.toLowerCase()) {
      return { ok: false, error: "Seçilen kullanıcının e-posta adresi belirtilen adres ile eşleşmiyor." };
    }

    // Send the manual transactional email
    const result = await sendTransactionalEmail({
      templateKey: input.templateKey || "manual_email",
      to,
      profileId,
      variables: {
        subject,
        body
      }
    });

    if (result.ok) {
      revalidatePath("/admin/emails");
      revalidatePath("/admin/emails/logs");
      return { ok: true };
    } else {
      return { ok: false, error: result.error || "E-posta gönderimi başarısız oldu." };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("sendManualEmailAction failed", err);
    return { ok: false, error: `Sunucu hatası: ${msg}` };
  }
}
