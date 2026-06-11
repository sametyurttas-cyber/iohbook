import { getEmailProvider } from "@/features/email/providers";
import type { EmailPayload } from "@/features/email/providers/types";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export type TransactionalEmailEvent =
  | "account_security"
  | "order_received"
  | "order_shipped"
  | "password_reset"
  | "payment_confirmed";

type SendTransactionalEmailInput = EmailPayload & {
  eventType: TransactionalEmailEvent;
  orderId?: string | null;
  payload?: Record<string, unknown>;
  profileId?: string | null;
  providerId?: string;
};

export async function sendTransactionalEmail(input: SendTransactionalEmailInput) {
  const provider = getEmailProvider(input.providerId);
  const result = await provider.send({
    html: input.html,
    subject: input.subject,
    text: input.text,
    to: input.to
  });

  try {
    const supabase = createSupabaseServiceRoleClient();
    await supabase.from("email_events").insert({
      error_message: result.ok ? null : result.error,
      event_type: input.eventType,
      order_id: input.orderId ?? null,
      payload: input.payload ?? {},
      profile_id: input.profileId ?? null,
      provider: result.provider,
      provider_message_id: result.ok ? result.messageId : null,
      recipient: input.to,
      status: result.ok ? "sent" : result.skipped ? "skipped" : "failed",
      subject: input.subject
    });
  } catch (error) {
    console.error("email_events log failed", error);
  }

  return result;
}
