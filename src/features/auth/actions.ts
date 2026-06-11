"use server";

import { redirect } from "next/navigation";
import { getSignInRedirectError, getSignUpRedirectPath } from "@/features/auth/error-utils";
import { sendAccountSecurityEmail, sendPasswordResetEmail } from "@/features/email/events";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

function buildSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_URL?.replace(/^/, "https://") ??
    "http://localhost:3000"
  );
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/account");

  if (!email || !password) {
    redirect("/sign-in?error=missing-credentials");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/sign-in?error=${getSignInRedirectError(error)}`);
  }

  await sendAccountSecurityEmail({
    email,
    message: "Hesabiniza yeni bir oturum acildi."
  });

  redirect(next);
}

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!email || !password) {
    redirect("/sign-up?error=missing-credentials");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    options: {
      data: {
        full_name: fullName || null
      },
      emailRedirectTo: `${buildSiteUrl()}/sign-in?confirmed=1`
    },
    password
  });

  if (error) {
    redirect("/sign-up?error=signup-failed");
  }

  redirect(
    getSignUpRedirectPath({
      email,
      hasSession: Boolean(data.session)
    })
  );
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect("/forgot-password?error=missing-email");
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    email,
    options: {
      redirectTo: `${buildSiteUrl()}/account/profile`
    },
    type: "recovery"
  });

  if (error || !data.properties?.action_link) {
    redirect("/forgot-password?error=reset-link-failed");
  }

  await sendPasswordResetEmail({
    email,
    resetUrl: data.properties.action_link
  });

  redirect("/forgot-password?sent=1");
}
