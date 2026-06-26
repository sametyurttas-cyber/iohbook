type SupabaseLikeError = {
  code?: unknown;
  message?: unknown;
};

export function isReferralSchemaUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as SupabaseLikeError;
  const code = typeof candidate.code === "string" ? candidate.code : "";
  const message = typeof candidate.message === "string" ? candidate.message : "";

  return (
    ["PGRST202", "PGRST205", "42P01", "42883"].includes(code) &&
    /referral_codes|referrals|record_referral_signup|award_referral_if_eligible|qualify_referral_after_email_verified/.test(
      message
    )
  );
}
