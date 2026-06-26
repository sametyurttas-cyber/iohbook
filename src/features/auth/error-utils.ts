type AuthErrorLike = {
  code?: string | null;
  message?: string | null;
  status?: number;
};

function normalizeAuthText(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

export function isEmailNotConfirmedError(error: AuthErrorLike | null | undefined) {
  const code = normalizeAuthText(error?.code);
  const message = normalizeAuthText(error?.message);

  return code === "email_not_confirmed" || message.includes("email not confirmed");
}

export function getSignInRedirectError(error: AuthErrorLike | null | undefined) {
  return isEmailNotConfirmedError(error) ? "email-not-confirmed" : "invalid-credentials";
}

export function getSignUpRedirectError(error: AuthErrorLike | null | undefined) {
  const code = normalizeAuthText(error?.code);
  const message = normalizeAuthText(error?.message);

  if (code === "over_email_send_rate_limit" || message.includes("rate limit")) {
    return "email-rate-limit";
  }

  if (
    code === "email_exists" ||
    code === "user_already_exists" ||
    message.includes("already registered") ||
    message.includes("already been registered") ||
    message.includes("already exists")
  ) {
    return "email-already-registered";
  }

  return "signup-failed";
}

export function getSignUpRedirectPath(input: {
  email: string;
  hasSession: boolean;
}) {
  if (input.hasSession) {
    return "/account";
  }

  const email = encodeURIComponent(input.email);
  return `/sign-in?pending-confirmation=1&email=${email}`;
}

export function isSafeRedirectPath(path: string): boolean {
  if (!path) return false;
  // Ensure it starts with exactly one '/' and is not protocol relative (e.g. '//')
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("\\")) {
    return false;
  }

  // Ensure it does not contain colon in path part to reject schemes
  const pathPart = path.split("?")[0];
  if (pathPart.includes(":")) {
    return false;
  }

  return true;
}
