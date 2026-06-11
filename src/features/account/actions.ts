"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccountUser } from "@/features/account/queries";
import { LEGAL_DOCUMENT_VERSION } from "@/features/legal/legal-content";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateCommunicationPreferences(formData: FormData) {
  const user = await requireAccountUser();
  const emailMarketing = formData.get("email_marketing_consent") === "on";
  const smsMarketing = formData.get("sms_marketing_consent") === "on";
  const supabase = await createSupabaseServerClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      marketing_email_opt_in: emailMarketing,
      marketing_sms_opt_in: smsMarketing
    })
    .eq("id", user.id);

  if (profileError) {
    redirect("/account/profile?error=preferences");
  }

  const events = [
    {
      document_slug: "privacy",
      document_version: LEGAL_DOCUMENT_VERSION,
      email: user.email ?? null,
      event_kind: "explicit_consent" as const,
      granted: emailMarketing,
      metadata: { source: "account_profile" },
      profile_id: user.id,
      purpose: "email_marketing"
    },
    {
      document_slug: "privacy",
      document_version: LEGAL_DOCUMENT_VERSION,
      email: user.email ?? null,
      event_kind: "explicit_consent" as const,
      granted: smsMarketing,
      metadata: { source: "account_profile" },
      profile_id: user.id,
      purpose: "sms_marketing"
    }
  ];

  const { error: consentError } = await supabase.from("consent_events").insert(events);

  if (consentError) {
    redirect("/account/profile?error=consent-log");
  }

  revalidatePath("/account/profile");
  redirect("/account/profile?saved=preferences");
}
