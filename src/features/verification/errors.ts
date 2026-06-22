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

  return code === "PGRST205"
    && /verification_submissions|submission_replies|verification_attachments/.test(message);
}
