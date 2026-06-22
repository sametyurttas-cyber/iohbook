"use server";

import { requireStaff, getCurrentUser } from "@/features/auth/queries";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { sendTransactionalEmail } from "@/features/email/service";
import { getRecipientsForSegment } from "./campaign-queries";
import { revalidatePath } from "next/cache";
import type { EmailBatch } from "@/types/database";
import { createUnsubscribeToken } from "./preferences-actions";

export async function createCampaignAction(input: {
  title: string;
  segmentKey: string;
  subject: string;
  body: string;
}) {
  const staff = await requireStaff(["owner", "admin_ops"]);
  if (!staff) {
    return { ok: false, error: "Bu işlem için yetkiniz bulunmamaktadır." };
  }

  const title = input.title?.trim();
  const segmentKey = input.segmentKey;
  const subject = input.subject?.trim();
  const body = input.body;

  if (!title) return { ok: false, error: "Kampanya başlığı boş bırakılamaz." };
  if (!segmentKey) return { ok: false, error: "Lütfen bir hedef kullanıcı segmenti seçin." };
  if (!subject) return { ok: false, error: "E-posta konusu boş bırakılamaz." };
  if (!body || body.trim().length === 0) return { ok: false, error: "E-posta gövdesi boş bırakılamaz." };

  try {
    const supabase = createSupabaseServiceRoleClient();
    const user = await getCurrentUser();

    // 1. Resolve recipients for the selected segment
    const recipients = await getRecipientsForSegment(segmentKey);

    // 2. Create the email batch header
    const { data: batch, error: batchErr } = await supabase
      .from("email_batches")
      .insert({
        title,
        segment_key: segmentKey,
        subject,
        body_text: body,
        body_html: body, // will be rendered as html with newline replacement
        status: "draft",
        total_recipients: recipients.length,
        created_by: user?.id || null
      })
      .select("id")
      .single();

    if (batchErr || !batch) {
      throw batchErr || new Error("Kampanya başlığı oluşturulamadı.");
    }

    // 3. Create the recipient rows in chunks of 500 to avoid query size limits
    if (recipients.length > 0) {
      const recipientData = recipients.map((r) => ({
        batch_id: batch.id,
        profile_id: r.id,
        email: r.email,
        status: "pending" as const
      }));

      // Chunk inserts
      const chunkSize = 500;
      for (let i = 0; i < recipientData.length; i += chunkSize) {
        const chunk = recipientData.slice(i, i + chunkSize);
        const { error: insErr } = await supabase.from("email_batch_recipients").insert(chunk);
        if (insErr) throw insErr;
      }
    }

    revalidatePath("/admin/emails/campaigns");
    return { ok: true, campaignId: batch.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("createCampaignAction failed", err);
    return { ok: false, error: `Kampanya oluşturulamadı: ${msg}` };
  }
}

export async function sendTestCampaignAction(campaignId: string) {
  const staff = await requireStaff(["owner", "admin_ops"]);
  if (!staff) {
    return { ok: false, error: "Bu işlem için yetkiniz bulunmamaktadır." };
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const user = await getCurrentUser();
    if (!user || !user.email) {
      return { ok: false, error: "Yönetici e-posta adresi bulunamadı." };
    }

    const { data: campaign, error: cErr } = await supabase
      .from("email_batches")
      .select("*")
      .eq("id", campaignId)
      .maybeSingle();

    if (cErr || !campaign) {
      return { ok: false, error: "Kampanya bulunamadı." };
    }

    const token = await createUnsubscribeToken(user.id, "marketing");
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/unsubscribe?token=${token}`;

    const result = await sendTransactionalEmail({
      templateKey: "campaign_email",
      to: user.email,
      profileId: user.id,
      variables: {
        subject: `[TEST] ${campaign.subject}`,
        body: campaign.body_text,
        unsubscribeUrl
      }
    });

    if (result.ok) {
      // Flag in db that test was successfully sent
      await supabase
        .from("email_batches")
        .update({
          scheduled_at: new Date().toISOString() // use scheduled_at temporarily or metadata if we had one, let's update scheduled_at as verification
        })
        .eq("id", campaignId);

      revalidatePath(`/admin/emails/campaigns/${campaignId}`);
      return { ok: true };
    } else {
      return { ok: false, error: result.error || "Test maili gönderilemedi." };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Sunucu hatası: ${msg}` };
  }
}

export async function processCampaignBatchAction(campaignId: string) {
  const staff = await requireStaff(["owner", "admin_ops"]);
  if (!staff) {
    return { ok: false, error: "Bu işlem için yetkiniz bulunmamaktadır." };
  }

  try {
    const supabase = createSupabaseServiceRoleClient();

    // 1. Fetch Campaign
    const { data: campaign, error: cErr } = await supabase
      .from("email_batches")
      .select("*")
      .eq("id", campaignId)
      .maybeSingle();

    if (cErr || !campaign) {
      return { ok: false, error: "Kampanya kaydı bulunamadı." };
    }

    if (campaign.status === "completed" || campaign.status === "cancelled") {
      return { ok: true, message: "Kampanya zaten sonlandırılmış veya iptal edilmiş durumda." };
    }

    // 2. Fetch up to 50 pending or failed recipients (only pending for clean start, but failed retry will also put them to pending)
    const { data: recipients, error: rErr } = await supabase
      .from("email_batch_recipients")
      .select("*")
      .eq("batch_id", campaignId)
      .eq("status", "pending")
      .limit(50);

    if (rErr) throw rErr;

    // If no recipients are left pending, mark campaign completed
    if (!recipients || recipients.length === 0) {
      await supabase
        .from("email_batches")
        .update({
          status: "completed",
          completed_at: new Date().toISOString()
        })
        .eq("id", campaignId);

      revalidatePath(`/admin/emails/campaigns/${campaignId}`);
      revalidatePath("/admin/emails/campaigns");
      return { ok: true, completed: true, processed: 0 };
    }

    // Start timing and status update if starting
    const updateData: Partial<EmailBatch> = { status: "sending" };
    if (!campaign.started_at) {
      updateData.started_at = new Date().toISOString();
    }
    await supabase.from("email_batches").update(updateData).eq("id", campaignId);

    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/account/profile`;

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    // 3. Process recipients sequentially to respect rate limit / connection limits
    for (const rec of recipients) {
      try {
        // Query email preferences to make sure they haven't opted out in the meantime!
        if (rec.profile_id) {
          const { data: prefs } = await supabase
            .from("email_preferences")
            .select("marketing_enabled")
            .eq("profile_id", rec.profile_id)
            .maybeSingle();

          if (prefs && !prefs.marketing_enabled) {
            await supabase
              .from("email_batch_recipients")
              .update({ status: "skipped", error_message: "User opted out of marketing preferences" })
              .eq("id", rec.id);
            skipped++;
            continue;
          }
        }

        // Generate recipient-specific unsubscribe URL
        let recipientUnsubscribeUrl = unsubscribeUrl;
        if (rec.profile_id) {
          try {
            const token = await createUnsubscribeToken(rec.profile_id, "marketing");
            recipientUnsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/unsubscribe?token=${token}`;
          } catch (tErr) {
            console.error("Failed to generate unsubscribe token for recipient", rec.profile_id, tErr);
          }
        }

        // Send Email
        const res = await sendTransactionalEmail({
          templateKey: "campaign_email",
          to: rec.email,
          profileId: rec.profile_id,
          variables: {
            subject: campaign.subject,
            body: campaign.body_text,
            unsubscribeUrl: recipientUnsubscribeUrl
          }
        });

        if (res.ok) {
          await supabase
            .from("email_batch_recipients")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
              provider_message_id: res.messageId || null
            })
            .eq("id", rec.id);
          sent++;
        } else {
          await supabase
            .from("email_batch_recipients")
            .update({
              status: "failed",
              error_message: res.error || "Email provider rejected send"
            })
            .eq("id", rec.id);
          failed++;
        }
      } catch (recErr) {
        const recMsg = recErr instanceof Error ? recErr.message : String(recErr);
        await supabase
          .from("email_batch_recipients")
          .update({
            status: "failed",
            error_message: recMsg
          })
          .eq("id", rec.id);
        failed++;
      }
    }

    // 4. Update Batch counters
    const newSentCount = campaign.sent_count + sent;
    const newFailedCount = campaign.failed_count + failed;
    const newSkippedCount = campaign.skipped_count + skipped;

    // Check if any pending are left in DB
    const { count: pendingLeft } = await supabase
      .from("email_batch_recipients")
      .select("*", { count: "exact", head: true })
      .eq("batch_id", campaignId)
      .eq("status", "pending");

    const isCompleted = (pendingLeft ?? 0) === 0;

    await supabase
      .from("email_batches")
      .update({
        sent_count: newSentCount,
        failed_count: newFailedCount,
        skipped_count: newSkippedCount,
        ...(isCompleted
          ? { status: "completed", completed_at: new Date().toISOString() }
          : {})
      })
      .eq("id", campaignId);

    revalidatePath(`/admin/emails/campaigns/${campaignId}`);
    revalidatePath("/admin/emails/campaigns");

    return {
      ok: true,
      processed: recipients.length,
      sent,
      failed,
      skipped,
      completed: isCompleted
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("processCampaignBatchAction failed", err);
    return { ok: false, error: `Kampanya gönderim işlemi başarısız oldu: ${msg}` };
  }
}

export async function retryFailedCampaignRecipientsAction(campaignId: string) {
  const staff = await requireStaff(["owner", "admin_ops"]);
  if (!staff) {
    return { ok: false, error: "Bu işlem için yetkiniz bulunmamaktadır." };
  }

  try {
    const supabase = createSupabaseServiceRoleClient();

    // 1. Reset recipient statuses
    const { error: rErr } = await supabase
      .from("email_batch_recipients")
      .update({
        status: "pending",
        error_message: null
      })
      .eq("batch_id", campaignId)
      .eq("status", "failed");

    if (rErr) throw rErr;

    // 2. Reset campaign header stats
    const { error: cErr } = await supabase
      .from("email_batches")
      .update({
        status: "draft",
        failed_count: 0,
        completed_at: null
      })
      .eq("id", campaignId);

    if (cErr) throw cErr;

    revalidatePath(`/admin/emails/campaigns/${campaignId}`);
    revalidatePath("/admin/emails/campaigns");

    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("retryFailedCampaignRecipientsAction failed", err);
    return { ok: false, error: `Başarısız kayıtlar sıfırlanamadı: ${msg}` };
  }
}

export async function estimateSegmentRecipientsAction(segmentKey: string) {
  const staff = await requireStaff(["owner", "admin_ops", "support"]);
  if (!staff) {
    return { ok: false, error: "Bu işlem için yetkiniz bulunmamaktadır." };
  }

  try {
    const recipients = await getRecipientsForSegment(segmentKey);
    return { ok: true, count: recipients.length };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Alıcı sayısı hesaplanamadı: ${msg}` };
  }
}

export async function pauseCampaignAction(campaignId: string) {
  const staff = await requireStaff(["owner", "admin_ops"]);
  if (!staff) {
    return { ok: false, error: "Bu işlem için yetkiniz bulunmamaktadır." };
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { error } = await supabase
      .from("email_batches")
      .update({ status: "draft" })
      .eq("id", campaignId);

    if (error) throw error;

    revalidatePath(`/admin/emails/campaigns/${campaignId}`);
    revalidatePath("/admin/emails/campaigns");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Kampanya duraklatılamadı: ${msg}` };
  }
}
