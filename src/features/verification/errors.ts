type SupabaseLikeError = {
  code?: unknown;
  message?: unknown;
};

export function isVerificationSchemaUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as SupabaseLikeError;
  const code = typeof candidate.code === "string" ? candidate.code : "";
  const message = typeof candidate.message === "string" ? candidate.message : "";

  return (
    ["PGRST202", "PGRST205", "42P01", "42883"].includes(code) &&
    /verification_submissions|submission_replies|verification_attachments|approve_verification_submission/.test(
      message
    )
  );
}
