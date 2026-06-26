import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  REFERRAL_COOKIE_MAX_AGE,
  REFERRAL_COOKIE_NAME
} from "@/features/referrals/config";
import type { Database } from "@/types/database";

function normalizeReferralCode(code: string | null) {
  return String(code ?? "").trim().toUpperCase();
}

function maybeSetReferralCookie(request: NextRequest, response: NextResponse) {
  const code = normalizeReferralCode(request.nextUrl.searchParams.get("ref"));

  if (request.nextUrl.pathname !== "/sign-up" || !/^[A-Z0-9]{6,16}$/.test(code)) {
    return;
  }

  response.cookies.set(REFERRAL_COOKIE_NAME, code, {
    httpOnly: true,
    maxAge: REFERRAL_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    const response = NextResponse.next({ request });
    maybeSetReferralCookie(request, response);
    return response;
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, options, value }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  await supabase.auth.getUser();

  maybeSetReferralCookie(request, response);

  return response;
}
