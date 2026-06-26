import { cookies } from "next/headers";
import {
  REFERRAL_COOKIE_MAX_AGE,
  REFERRAL_COOKIE_NAME
} from "@/features/referrals/config";

export function normalizeReferralInput(code: string | null | undefined) {
  return String(code ?? "").trim().toUpperCase();
}

export function isReferralInputValid(code: string) {
  return /^[A-Z0-9]{6,16}$/.test(code);
}

export function getReferralCookieOptions() {
  return {
    httpOnly: true,
    maxAge: REFERRAL_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production"
  };
}

export async function getReferralCodeFromCookie() {
  const cookieStore = await cookies();
  const code = normalizeReferralInput(cookieStore.get(REFERRAL_COOKIE_NAME)?.value);

  return isReferralInputValid(code) ? code : null;
}

export async function clearReferralCodeCookie() {
  const cookieStore = await cookies();

  try {
    cookieStore.set(REFERRAL_COOKIE_NAME, "", {
      ...getReferralCookieOptions(),
      maxAge: 0
    });
  } catch {
    // Server Components cannot clear cookies; Server Actions can.
  }
}
