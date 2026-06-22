import { beforeEach, describe, expect, it, vi } from "vitest";
import { signInWithPassword, signUpWithPassword } from "./actions";

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }
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
    expect(trackServerAnalyticsEvent).toHaveBeenCalledWith({
      eventName: "signup",
      idempotencyKey: "profile-id",
      metadata: { method: "password" },
      path: "/sign-up",
      profileId: "profile-id"
    });
  });

  it("tracks login only after Supabase confirms the user", async () => {
    const serverSupabase = {
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "profile-id" } }, error: null })),
        signInWithPassword: vi.fn(async () => ({ data: {}, error: null }))
      }
    };
    vi.mocked(createSupabaseServerClient).mockResolvedValue(serverSupabase as never);
    const formData = new FormData();
    formData.set("email", "samet@example.com");
    formData.set("password", "strong-password");

    await expect(signInWithPassword(formData)).rejects.toThrow("NEXT_REDIRECT:/account");
    expect(trackServerAnalyticsEvent).toHaveBeenCalledWith({
      eventName: "login",
      metadata: { method: "password" },
      path: "/sign-in",
      profileId: "profile-id"
    });
  });
});
