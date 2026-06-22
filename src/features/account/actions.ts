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
  const productUpdates = formData.get("email_product_updates") === "on";
  const community = formData.get("email_community") === "on";
  const amazonRewards = formData.get("email_amazon_rewards") === "on";
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

  // Sync with granular email_preferences table
  const { error: prefError } = await supabase
    .from("email_preferences")
    .upsert({
      profile_id: user.id,
      marketing_enabled: emailMarketing,
      product_updates_enabled: productUpdates,
      community_enabled: community,
      amazon_rewards_enabled: amazonRewards
    });

  if (prefError) {
    redirect("/account/profile?error=preferences-sync");
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
