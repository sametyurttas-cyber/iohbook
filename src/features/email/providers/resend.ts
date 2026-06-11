import type { EmailPayload, EmailProvider, EmailSendResult } from "@/features/email/providers/types";

function getFromAddress() {
  return process.env.EMAIL_FROM ?? "IOH Book <no-reply@iohbook.local>";
}

export const resendEmailProvider: EmailProvider = {
  id: "resend",
  async send(payload: EmailPayload): Promise<EmailSendResult> {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return {
        error: "RESEND_API_KEY is not configured.",
        ok: false,
        provider: "resend",
        skipped: true
      };
    }

    const response = await fetch("https://api.resend.com/emails", {
      body: JSON.stringify({
        from: getFromAddress(),
        html: payload.html,
        subject: payload.subject,
        text: payload.text,
        to: payload.to
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    const data = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
      id?: string;
      message?: string;
    };

    if (!response.ok) {
      return {
        error: data.error?.message ?? data.message ?? `Resend HTTP ${response.status}`,
        ok: false,
        provider: "resend"
      };
    }

    return {
      messageId: data.id ?? null,
      ok: true,
      provider: "resend"
    };
  }
};
