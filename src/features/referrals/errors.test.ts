import { describe, expect, it } from "vitest";
import { isReferralSchemaUnavailableError } from "@/features/referrals/errors";

describe("referral schema errors", () => {
  it("recognizes missing referral tables from PostgREST", () => {
    expect(isReferralSchemaUnavailableError({
      code: "PGRST205",
      message: "Could not find the table 'public.referral_codes' in the schema cache"
    })).toBe(true);
  });

  it("recognizes missing referral functions from PostgREST", () => {
    expect(isReferralSchemaUnavailableError({
      code: "PGRST202",
      message: "Could not find the function public.award_referral_if_eligible"
    })).toBe(true);
  });

  it("does not hide unrelated Supabase errors", () => {
    expect(isReferralSchemaUnavailableError({
      code: "42501",
      message: "permission denied"
    })).toBe(false);
  });
});
