import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { awardSignupBonus } from "@/features/points/service";
import { createReferralFromCode, awardReferralIfEligible } from "@/features/referrals/service";
import { getReferralCodeFromCookie, clearReferralCodeCookie } from "@/features/referrals/cookie";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      const serviceSupabase = createSupabaseServiceRoleClient();
      
      // 1. Award Signup points bonus
      try {
        await awardSignupBonus({
          profileId: data.user.id,
          supabase: serviceSupabase
        });
      } catch (pointsError) {
        console.error("Failed to award signup bonus for OAuth:", pointsError);
      }

      // 2. Handle Referral tracking and award points to referrer and referred
      try {
        const referralCode = await getReferralCodeFromCookie();
        if (referralCode) {
          await createReferralFromCode(data.user.id, referralCode, serviceSupabase);
          await awardReferralIfEligible(data.user.id, serviceSupabase);
          await clearReferralCodeCookie();
        }
      } catch (referralError) {
        console.error("Failed to handle referral for OAuth:", referralError);
      }
      const forwardedHost = request.headers.get("x-forwarded-host");
      const host = request.headers.get("host");
      const isLocal = host?.includes("localhost") || host?.includes("127.0.0.1");

      if (isLocal) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Redirect to sign-in with oauth-failed error query param
  return NextResponse.redirect(`${origin}/sign-in?error=oauth-failed`);
}
