"use server";

import crypto from "crypto";
import { requireUser } from "@/features/auth/queries";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { EmailPreference } from "@/types/database";

/**
 * Creates a cryptographically secure unsubscribe token for a profile and category.
 * Returns the raw token to be placed in email links.
 */
export async function createUnsubscribeToken(profileId: string, category: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  
  // Set expiry to 30 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("email_unsubscribe_tokens")
    .insert({
      profile_id: profileId,
      token_hash: tokenHash,
      category,
      expires_at: expiresAt.toISOString()
    });

  if (error) {
    console.error("Failed to create unsubscribe token", error);
    throw error;
  }

  return rawToken;
}

/**
 * Consumes an unsubscribe token, sets its used_at timestamp, and deactivates the corresponding preference.
 * Returns the resolved category or error. Safe from leaking database info.
 */
export async function consumeUnsubscribeToken(rawToken: string): Promise<{ ok: boolean; category?: string; error?: string }> {
  if (!rawToken || rawToken.trim().length === 0) {
    return { ok: false, error: "Geçersiz veya süresi geçmiş bağlantı." };
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const supabase = createSupabaseServiceRoleClient();

    // 1. Fetch token details
    const { data: tokenData, error: fetchErr } = await supabase
      .from("email_unsubscribe_tokens")
      .select("*")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (fetchErr || !tokenData) {
      return { ok: false, error: "Geçersiz veya süresi geçmiş bağlantı." };
    }

    // 2. Idempotency: If already used, return success but don't perform action again
    if (tokenData.used_at) {
      return { ok: true, category: tokenData.category };
    }

    // 3. Expiry Check
    if (tokenData.expires_at && new Date(tokenData.expires_at).getTime() < Date.now()) {
      return { ok: false, error: "Bağlantının kullanım süresi dolmuş." };
    }

    const { category, profile_id } = tokenData;

    // 4. Determine column to disable in preferences
    const updatePayload: Partial<EmailPreference> = {};
    if (category === "marketing") {
      updatePayload.marketing_enabled = false;
    } else if (category === "product_updates") {
      updatePayload.product_updates_enabled = false;
    } else if (category === "community") {
      updatePayload.community_enabled = false;
    } else if (category === "amazon_rewards") {
      updatePayload.amazon_rewards_enabled = false;
    } else {
      // Default fallback
      updatePayload.marketing_enabled = false;
    }

    // 5. Update Email Preferences
    const { error: prefErr } = await supabase
      .from("email_preferences")
      .update(updatePayload)
      .eq("profile_id", profile_id);

    if (prefErr) throw prefErr;

    // 6. Sync profile table if unsubscribed from marketing
    if (category === "marketing") {
      await supabase
        .from("profiles")
        .update({ marketing_email_opt_in: false })
        .eq("id", profile_id);
    }

    // 7. Mark token as used
    await supabase
      .from("email_unsubscribe_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenData.id);

    return { ok: true, category };
  } catch (err) {
    console.error("consumeUnsubscribeToken failed", err);
    return { ok: false, error: "Tercihler güncellenirken bir hata oluştu." };
  }
}

/**
 * Fetches user's email preferences. Creates a default row if not exists.
 */
export async function getAccountEmailPreferences(profileId: string): Promise<EmailPreference> {
  const supabase = createSupabaseServiceRoleClient();
  
  // 1. Try to fetch
  const { data, error } = await supabase
    .from("email_preferences")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    console.error("getAccountEmailPreferences failed", error);
  }

  if (data) {
    return data as EmailPreference;
  }

  // 2. Auto-create if missing (e.g. legacy profiles)
  const { data: profile } = await supabase
    .from("profiles")
    .select("marketing_email_opt_in")
    .eq("id", profileId)
    .maybeSingle();

  const isMarketingOptIn = profile?.marketing_email_opt_in ?? true;

  const { data: inserted, error: insertErr } = await supabase
    .from("email_preferences")
    .insert({
      profile_id: profileId,
      marketing_enabled: isMarketingOptIn,
      product_updates_enabled: true,
      community_enabled: true,
      amazon_rewards_enabled: true
    })
    .select("*")
    .single();

  if (insertErr) {
    console.error("Failed to insert default email preferences", insertErr);
    // Return a local in-memory fallback to avoid crashing
    return {
      profile_id: profileId,
      transactional_enabled: true,
      marketing_enabled: isMarketingOptIn,
      product_updates_enabled: true,
      community_enabled: true,
      amazon_rewards_enabled: true,
      updated_at: new Date().toISOString()
    };
  }

  return inserted as EmailPreference;
}

/**
 * Server Action: Updates the authenticated user's email preferences.
 */
export async function updateAccountPreferencesAction(input: {
  marketing: boolean;
  productUpdates: boolean;
  community: boolean;
  amazonRewards: boolean;
}) {
  const user = await requireUser();
  if (!user) {
    return { ok: false, error: "Oturum açmanız gerekmektedir." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    
    // 1. Update email preferences table
    const { error: prefErr } = await supabase
      .from("email_preferences")
      .update({
        marketing_enabled: input.marketing,
        product_updates_enabled: input.productUpdates,
        community_enabled: input.community,
        amazon_rewards_enabled: input.amazonRewards
      })
      .eq("profile_id", user.id);

    if (prefErr) throw prefErr;

    // 2. Sync core profiles table
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({
        marketing_email_opt_in: input.marketing
      })
      .eq("id", user.id);

    if (profileErr) throw profileErr;

    revalidatePath("/account/profile");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("updateAccountPreferencesAction failed", err);
    return { ok: false, error: `Ayarlar kaydedilemedi: ${msg}` };
  }
}
