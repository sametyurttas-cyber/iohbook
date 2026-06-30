"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  getSignInRedirectError,
  getSignUpRedirectError,
  getSignUpRedirectPath,
  isSafeRedirectPath
} from "@/features/auth/error-utils";
import { trackServerAnalyticsEvent } from "@/features/analytics/business-events";
import { mergeAnonymousCartIntoProfileCart } from "@/features/cart/merge";
import { sendAccountSecurityEmail, sendPasswordResetEmail } from "@/features/email/events";
import { awardSignupBonus } from "@/features/points/service";
import {
  clearReferralCodeCookie,
  getReferralCodeFromCookie,
  isReferralInputValid,
  normalizeReferralInput
} from "@/features/referrals/cookie";
import { awardReferralIfEligible, createReferralFromCode } from "@/features/referrals/service";
import { captureError } from "@/lib/observability";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

async function buildSiteUrl() {
  const headersList = await headers();
  const host = headersList.get("host");

  if (host) {
    const protocol = headersList.get("x-forwarded-proto") || "https";
    // Check if localhost to use http
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
    return `${isLocal ? "http" : protocol}://${host}`;
  }

  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_URL?.replace(/^/, "https://") ??
    "http://localhost:3000"
  );
}

async function getReferralCodeFromSignupForm(formData: FormData) {
  const formCode = normalizeReferralInput(String(formData.get("referral_code") ?? ""));

  if (isReferralInputValid(formCode)) {
    return formCode;
  }

  return getReferralCodeFromCookie();
}

async function createPendingReferralAfterSignup(input: {
  formData: FormData;
  profileId: string;
  serviceSupabase: ReturnType<typeof createSupabaseServiceRoleClient>;
}) {
  const referralCode = await getReferralCodeFromSignupForm(input.formData);

  if (!referralCode) {
    return;
  }

  try {
    await createReferralFromCode(input.profileId, referralCode, input.serviceSupabase);
    await awardReferralIfEligible(input.profileId, input.serviceSupabase);
    await clearReferralCodeCookie();
  } catch (error) {
    captureError(error, {
      operation: "referrals.signup",
      profile_id: input.profileId
    });
  }
}

async function awardReferralAfterVerifiedLogin(profileId: string) {
  try {
    await awardReferralIfEligible(profileId, createSupabaseServiceRoleClient());
  } catch (error) {
    captureError(error, {
      operation: "referrals.login_award",
      profile_id: profileId
    });
  }
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/account");

  let redirectPath = next;
  if (!isSafeRedirectPath(redirectPath)) {
    redirectPath = "/token-sale";
  }

  if (!email || !password) {
    redirect(`/sign-in?error=missing-credentials&next=${encodeURIComponent(redirectPath)}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/sign-in?error=${getSignInRedirectError(error)}&next=${encodeURIComponent(redirectPath)}`);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    await mergeAnonymousCartIntoProfileCart(user.id);
    await awardReferralAfterVerifiedLogin(user.id);
    await trackServerAnalyticsEvent({
      eventName: "login",
      metadata: { method: "password" },
      path: "/sign-in",
      profileId: user.id
    });
  }

  await sendAccountSecurityEmail({
    email,
    message: "Hesabiniza yeni bir oturum acildi."
  });

  redirect(redirectPath);
}

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const next = String(formData.get("next") ?? "/account");

  let redirectPath = next;
  if (!isSafeRedirectPath(redirectPath)) {
    redirectPath = "/token-sale";
  }

  if (!email || !password) {
    redirect(`/sign-up?error=missing-credentials&next=${encodeURIComponent(redirectPath)}`);
  }

  if (password.length < 8) {
    redirect(`/sign-up?error=weak-password&next=${encodeURIComponent(redirectPath)}`);
  }

  const serviceSupabase = createSupabaseServiceRoleClient();
  const { error: createError } = await serviceSupabase.auth.admin.createUser({
    email,
    email_confirm: true,
    password,
    user_metadata: {
      full_name: fullName || null
    }
  });

  if (createError) {
    redirect(`/sign-up?error=${getSignUpRedirectError(createError)}&next=${encodeURIComponent(redirectPath)}`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/sign-in?error=${getSignInRedirectError(error)}&next=${encodeURIComponent(redirectPath)}`);
  }

  if (data.user) {
    await mergeAnonymousCartIntoProfileCart(data.user.id);
    await trackServerAnalyticsEvent({
      eventName: "signup",
      idempotencyKey: data.user.id,
      metadata: { method: "password" },
      path: "/sign-up",
      profileId: data.user.id
    });
    if (fullName) {
      await trackServerAnalyticsEvent({
        eventName: "profile_completed",
        idempotencyKey: data.user.id,
        metadata: { source: "signup" },
        path: "/sign-up",
        profileId: data.user.id
      });
    }
    try {
      await awardSignupBonus({
        profileId: data.user.id,
        supabase: serviceSupabase
      });
    } catch (error) {
      captureError(error, {
        operation: "points.signup_bonus",
        profile_id: data.user.id
      });
    }
    await createPendingReferralAfterSignup({
      formData,
      profileId: data.user.id,
      serviceSupabase
    });
  }

  if (data.session) {
    redirect(redirectPath);
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
      redirectTo: `${await buildSiteUrl()}/account/profile`
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

export async function signInWithGoogle(formData: FormData) {
  const next = String(formData.get("next") ?? "/account");
  let redirectPath = next;
  if (!isSafeRedirectPath(redirectPath)) {
    redirectPath = "/account";
  }

  const supabase = await createSupabaseServerClient();
  const siteUrl = await buildSiteUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/api/auth/callback?next=${encodeURIComponent(redirectPath)}`,
      queryParams: {
        prompt: "select_account"
      }
    }
  });

  if (error) {
    redirect(`/sign-in?error=oauth-failed&next=${encodeURIComponent(redirectPath)}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}
