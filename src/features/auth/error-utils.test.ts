import { describe, expect, it } from "vitest";
import {
  getSignInRedirectError,
  getSignUpRedirectPath,
  isEmailNotConfirmedError
} from "@/features/auth/error-utils";

describe("auth error utils", () => {
  it("detects unconfirmed email errors from code or message", () => {
    expect(isEmailNotConfirmedError({ code: "email_not_confirmed" })).toBe(true);
    expect(isEmailNotConfirmedError({ message: "Email not confirmed" })).toBe(true);
    expect(isEmailNotConfirmedError({ message: "Invalid login credentials" })).toBe(false);
  });

  it("maps sign-in errors to user-facing redirect codes", () => {
    expect(getSignInRedirectError({ message: "Email not confirmed" })).toBe("email-not-confirmed");
    expect(getSignInRedirectError({ message: "Invalid login credentials" })).toBe(
      "invalid-credentials"
    );
  });

  it("sends unconfirmed signups to sign-in with a check-email notice", () => {
    expect(getSignUpRedirectPath({ email: "samet@example.com", hasSession: false })).toBe(
      "/sign-in?pending-confirmation=1&email=samet%40example.com"
    );
    expect(getSignUpRedirectPath({ email: "samet@example.com", hasSession: true })).toBe(
      "/account"
    );
  });
});
