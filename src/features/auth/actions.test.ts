import { beforeEach, describe, expect, it, vi } from "vitest";
import { signInWithPassword, signUpWithPassword } from "./actions";

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }
}));

const cookieMocks = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn()
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieMocks)
}));

vi.mock("@/features/cart/merge", () => ({
  mergeAnonymousCartIntoProfileCart: vi.fn()
}));

vi.mock("@/features/analytics/business-events", () => ({
  trackServerAnalyticsEvent: vi.fn()
}));

vi.mock("@/features/email/events", () => ({
  sendAccountSecurityEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn()
}));

vi.mock("@/features/points/service", () => ({
  awardSignupBonus: vi.fn()
}));

vi.mock("@/features/referrals/service", () => ({
  awardReferralIfEligible: vi.fn(),
  createReferralFromCode: vi.fn()
}));

vi.mock("@/lib/observability", () => ({
  captureError: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn()
}));

const { mergeAnonymousCartIntoProfileCart } = await import("@/features/cart/merge");
const { trackServerAnalyticsEvent } = await import("@/features/analytics/business-events");
const { awardSignupBonus } = await import("@/features/points/service");
const { awardReferralIfEligible, createReferralFromCode } = await import("@/features/referrals/service");
const { captureError } = await import("@/lib/observability");
const { createSupabaseServerClient } = await import("@/lib/supabase/server");
const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/service-role");

function buildSignUpFormData() {
  const formData = new FormData();
  formData.set("email", "samet@example.com");
  formData.set("password", "strong-password");
  formData.set("full_name", "Samet Yurttas");
  return formData;
}

describe("auth signup points", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieMocks.get.mockReturnValue(undefined);
  });

  it("awards 10 IOH points after a successful signup", async () => {
    const serviceSupabase = {
      auth: {
        admin: {
          createUser: vi.fn(async () => ({ error: null }))
        }
      }
    };
    const serverSupabase = {
      auth: {
        signInWithPassword: vi.fn(async () => ({
          data: {
            session: { access_token: "session" },
            user: { id: "profile-id" }
          },
          error: null
        }))
      }
    };

    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(serviceSupabase as never);
    vi.mocked(createSupabaseServerClient).mockResolvedValue(serverSupabase as never);

    await expect(signUpWithPassword(buildSignUpFormData())).rejects.toThrow(
      "NEXT_REDIRECT:/account"
    );

    expect(serviceSupabase.auth.admin.createUser).toHaveBeenCalledWith({
      email: "samet@example.com",
      email_confirm: true,
      password: "strong-password",
      user_metadata: {
        full_name: "Samet Yurttas"
      }
    });
    expect(mergeAnonymousCartIntoProfileCart).toHaveBeenCalledWith("profile-id");
    expect(awardSignupBonus).toHaveBeenCalledWith({
      profileId: "profile-id",
      supabase: serviceSupabase
    });
    expect(createReferralFromCode).not.toHaveBeenCalled();
    expect(trackServerAnalyticsEvent).toHaveBeenCalledWith({
      eventName: "signup",
      idempotencyKey: "profile-id",
      metadata: { method: "password" },
      path: "/sign-up",
      profileId: "profile-id"
    });
  });

  it("tracks login only after Supabase confirms the user", async () => {
    const serviceSupabase = {};
    const serverSupabase = {
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "profile-id" } }, error: null })),
        signInWithPassword: vi.fn(async () => ({ data: {}, error: null }))
      }
    };
    vi.mocked(createSupabaseServerClient).mockResolvedValue(serverSupabase as never);
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(serviceSupabase as never);
    const formData = new FormData();
    formData.set("email", "samet@example.com");
    formData.set("password", "strong-password");

    await expect(signInWithPassword(formData)).rejects.toThrow("NEXT_REDIRECT:/account");
    expect(awardReferralIfEligible).toHaveBeenCalledWith("profile-id", serviceSupabase);
    expect(trackServerAnalyticsEvent).toHaveBeenCalledWith({
      eventName: "login",
      metadata: { method: "password" },
      path: "/sign-in",
      profileId: "profile-id"
    });
  });

  it("creates a pending referral from the signup referral code and triggers the verified reward hook", async () => {
    const serviceSupabase = {
      auth: {
        admin: {
          createUser: vi.fn(async () => ({ error: null }))
        }
      }
    };
    const serverSupabase = {
      auth: {
        signInWithPassword: vi.fn(async () => ({
          data: {
            session: { access_token: "session" },
            user: { id: "referred-profile-id" }
          },
          error: null
        }))
      }
    };
    const formData = buildSignUpFormData();
    formData.set("referral_code", "iohabc123");

    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(serviceSupabase as never);
    vi.mocked(createSupabaseServerClient).mockResolvedValue(serverSupabase as never);

    await expect(signUpWithPassword(formData)).rejects.toThrow("NEXT_REDIRECT:/account");

    expect(createReferralFromCode).toHaveBeenCalledWith(
      "referred-profile-id",
      "IOHABC123",
      serviceSupabase
    );
    expect(awardReferralIfEligible).toHaveBeenCalledWith("referred-profile-id", serviceSupabase);
    expect(cookieMocks.set).toHaveBeenCalledWith(
      "ioh_referral_code",
      "",
      expect.objectContaining({ maxAge: 0, path: "/" })
    );
  });

  it("uses the referral cookie when the hidden field is missing", async () => {
    const serviceSupabase = {
      auth: {
        admin: {
          createUser: vi.fn(async () => ({ error: null }))
        }
      }
    };
    const serverSupabase = {
      auth: {
        signInWithPassword: vi.fn(async () => ({
          data: {
            session: { access_token: "session" },
            user: { id: "referred-profile-id" }
          },
          error: null
        }))
      }
    };

    cookieMocks.get.mockReturnValue({ value: "iohcookie1" });
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(serviceSupabase as never);
    vi.mocked(createSupabaseServerClient).mockResolvedValue(serverSupabase as never);

    await expect(signUpWithPassword(buildSignUpFormData())).rejects.toThrow(
      "NEXT_REDIRECT:/account"
    );

    expect(createReferralFromCode).toHaveBeenCalledWith(
      "referred-profile-id",
      "IOHCOOKIE1",
      serviceSupabase
    );
  });

  it("does not block signup when referral creation fails", async () => {
    const serviceSupabase = {
      auth: {
        admin: {
          createUser: vi.fn(async () => ({ error: null }))
        }
      }
    };
    const serverSupabase = {
      auth: {
        signInWithPassword: vi.fn(async () => ({
          data: {
            session: { access_token: "session" },
            user: { id: "referred-profile-id" }
          },
          error: null
        }))
      }
    };
    const formData = buildSignUpFormData();
    formData.set("referral_code", "IOHABC123");

    vi.mocked(createReferralFromCode).mockRejectedValueOnce(new Error("referral failed"));
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(serviceSupabase as never);
    vi.mocked(createSupabaseServerClient).mockResolvedValue(serverSupabase as never);

    await expect(signUpWithPassword(formData)).rejects.toThrow("NEXT_REDIRECT:/account");

    expect(captureError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        operation: "referrals.signup",
        profile_id: "referred-profile-id"
      })
    );
    expect(awardSignupBonus).toHaveBeenCalled();
  });
});
