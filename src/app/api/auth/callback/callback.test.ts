import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

vi.mock("next/server", () => ({
  NextResponse: {
    redirect: vi.fn((url: string) => `REDIRECT:${url}`)
  }
}));

const mockExchangeCodeForSession = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
      getUser: mockGetUser
    }
  }))
}));

const mockServiceSupabase = {};
vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn(() => mockServiceSupabase)
}));

vi.mock("@/features/points/service", () => ({
  awardSignupBonus: vi.fn()
}));

vi.mock("@/features/email/events", () => ({
  sendWelcomeEmail: vi.fn()
}));

vi.mock("@/features/referrals/service", () => ({
  createReferralFromCode: vi.fn(),
  awardReferralIfEligible: vi.fn()
}));

vi.mock("@/features/referrals/cookie", () => ({
  getReferralCodeFromCookie: vi.fn(),
  clearReferralCodeCookie: vi.fn()
}));

const { NextResponse } = await import("next/server");
const { awardSignupBonus } = await import("@/features/points/service");
const { sendWelcomeEmail } = await import("@/features/email/events");
const { getReferralCodeFromCookie, clearReferralCodeCookie } = await import("@/features/referrals/cookie");
const { createReferralFromCode, awardReferralIfEligible } = await import("@/features/referrals/service");

describe("OAuth Callback Route Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should process OAuth code exchange, award signup bonus, send welcome email, and redirect new users", async () => {
    // Setup Mocks
    mockExchangeCodeForSession.mockResolvedValue({
      data: {
        user: {
          id: "new-user-uuid",
          email: "newuser@example.com",
          user_metadata: { full_name: "New Google User" }
        }
      },
      error: null
    });

    vi.mocked(awardSignupBonus).mockResolvedValue({
      applied: true,
      balance: 10,
      ledgerId: "ledger-uuid"
    });

    vi.mocked(getReferralCodeFromCookie).mockResolvedValue(null);

    const request = new Request("https://www.iohcoin.com/api/auth/callback?code=test-code");
    
    // Execute GET
    const response = await GET(request);

    // Assertions
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("test-code");
    expect(awardSignupBonus).toHaveBeenCalledWith({
      profileId: "new-user-uuid",
      supabase: mockServiceSupabase
    });
    expect(sendWelcomeEmail).toHaveBeenCalledWith({
      email: "newuser@example.com",
      userName: "New Google User",
      profileId: "new-user-uuid"
    });
    expect(NextResponse.redirect).toHaveBeenCalledWith("https://www.iohcoin.com/account");
  });

  it("should skip welcome email for existing users logging in again", async () => {
    // Setup Mocks
    mockExchangeCodeForSession.mockResolvedValue({
      data: {
        user: {
          id: "existing-user-uuid",
          email: "existing@example.com"
        }
      },
      error: null
    });

    vi.mocked(awardSignupBonus).mockResolvedValue({
      applied: false,
      balance: 10,
      ledgerId: null
    });

    const request = new Request("https://www.iohcoin.com/api/auth/callback?code=test-code");
    
    // Execute GET
    await GET(request);

    // Assertions
    expect(sendWelcomeEmail).not.toHaveBeenCalled();
  });

  it("should award referral points if referral cookie is present", async () => {
    // Setup Mocks
    mockExchangeCodeForSession.mockResolvedValue({
      data: {
        user: {
          id: "referred-user-uuid",
          email: "referred@example.com"
        }
      },
      error: null
    });

    vi.mocked(awardSignupBonus).mockResolvedValue({
      applied: true,
      balance: 10,
      ledgerId: "ledger-uuid"
    });

    vi.mocked(getReferralCodeFromCookie).mockResolvedValue("INVITECODE123");

    const request = new Request("https://www.iohcoin.com/api/auth/callback?code=test-code");
    
    // Execute GET
    await GET(request);

    // Assertions
    expect(createReferralFromCode).toHaveBeenCalledWith("referred-user-uuid", "INVITECODE123", mockServiceSupabase);
    expect(awardReferralIfEligible).toHaveBeenCalledWith("referred-user-uuid", mockServiceSupabase);
    expect(clearReferralCodeCookie).toHaveBeenCalled();
  });
});
