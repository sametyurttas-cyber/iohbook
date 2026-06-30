import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { awardSignupBonus } from "@/features/points/service";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      try {
        const serviceSupabase = createSupabaseServiceRoleClient();
        await awardSignupBonus({
          profileId: data.user.id,
          supabase: serviceSupabase
        });
      } catch (pointsError) {
        console.error("Failed to award signup bonus for OAuth:", pointsError);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to sign-in with oauth-failed error query param
  return NextResponse.redirect(`${origin}/sign-in?error=oauth-failed`);
}
