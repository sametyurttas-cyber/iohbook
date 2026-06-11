export type EmailPayload = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

export type EmailSendResult =
  | {
      messageId: string | null;
      ok: true;
      provider: string;
      skipped?: false;
    }
  | {
      error: string;
      ok: false;
      provider: string;
      skipped?: boolean;
    };

export type EmailProvider = {
  id: string;
  send(payload: EmailPayload): Promise<EmailSendResult>;
};
