import { describe, expect, it } from "vitest";
import { isVerificationSchemaUnavailableError } from "@/features/verification/errors";

describe("verification schema errors", () => {
  it("recognizes missing verification tables from PostgREST", () => {
    expect(isVerificationSchemaUnavailableError({
      code: "PGRST205",
      message: "Could not find the table 'public.verification_submissions' in the schema cache"
    })).toBe(true);
  });

  it("recognizes missing verification tables from Postgres", () => {
    expect(isVerificationSchemaUnavailableError({
      code: "42P01",
      message: "relation \"public.verification_submissions\" does not exist"
    })).toBe(true);
  });

  it("does not hide unrelated Supabase errors", () => {
    expect(isVerificationSchemaUnavailableError({
      code: "42501",
      message: "permission denied"
    })).toBe(false);
  });
});
