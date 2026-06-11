import { resendEmailProvider } from "@/features/email/providers/resend";

export const DEFAULT_EMAIL_PROVIDER_ID = "resend";

export const EMAIL_PROVIDERS = {
  resend: resendEmailProvider
};

export function getEmailProvider(id = DEFAULT_EMAIL_PROVIDER_ID) {
  return EMAIL_PROVIDERS[id as keyof typeof EMAIL_PROVIDERS] ?? resendEmailProvider;
}
