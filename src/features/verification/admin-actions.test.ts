import { beforeEach, describe, expect, it, vi } from "vitest";
import { approveSubmission } from "@/features/verification/admin-actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

vi.mock("@/features/analytics/business-events", () => ({
  trackServerAnalyticsEvent: vi.fn()
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }
}));

vi.mock("@/features/auth/queries", () => ({
  getCurrentUser: vi.fn(),
  requireStaff: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn()
}));

vi.mock("@/lib/observability", () => ({
  captureError: vi.fn(),
  logInfo: vi.fn()
}));

const { getCurrentUser, requireStaff } = await import("@/features/auth/queries");
const { trackServerAnalyticsEvent } = await import("@/features/analytics/business-events");
const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/service-role");
const { captureError, logInfo } = await import("@/lib/observability");

type SubmissionKind = "amazon_purchase" | "amazon_review" | "general_message";

function buildForm(rewardAmount: string, adminNote = "") {
  const formData = new FormData();
  formData.set("submission_id", "submission-id");
  formData.set("reward_amount", rewardAmount);
  formData.set("admin_note", adminNote);
  formData.set("expected_reward", "999999");
  return formData;
}

function buildClient(input: {
  kind: SubmissionKind;
  rpcError?: { message: string } | null;
  rpcResult?: {
    approved: boolean;
    balance: number | null;
    error_code: string | null;
    ledger_id: string | null;
  };
}) {
  const maybeSingle = vi.fn(async () => ({
    data: { book_slug: "godcode", kind: input.kind, profile_id: "profile-id" },
    error: null
  }));
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const rpc = vi.fn(async () => ({
    data: input.rpcResult
      ? [input.rpcResult]
      : [{ approved: true, balance: 30, error_code: null, ledger_id: "ledger-id" }],
    error: input.rpcError ?? null
  }));

  return {
    client: {
      from: vi.fn(() => ({ select })),
      rpc
    },
    rpc
  };
}

describe("verification approval action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({
      email: "admin@example.com",
      id: "admin-id"
    } as never);
    vi.mocked(requireStaff).mockResolvedValue({
      roles: ["owner"],
      user: { id: "admin-id" }
    } as never);
  });

  it.each([
    ["amazon_purchase", "30"],
    ["amazon_review", "250"]
  ] as const)("approves %s with its configured reward", async (kind, amount) => {
    const supabase = buildClient({ kind });
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(supabase.client as never);

    await expect(approveSubmission(buildForm(amount))).rejects.toThrow(
      "NEXT_REDIRECT:/admin/verifications/submission-id?saved=approved"
    );

    expect(supabase.rpc).toHaveBeenCalledWith("approve_verification_submission", {
      p_admin_note: null,
      p_actor_profile_id: "admin-id",
      p_reward_amount: Number(amount),
      p_submission_id: "submission-id"
    });
    expect(trackServerAnalyticsEvent).toHaveBeenCalledWith({
      eventName: "amazon_verification_approved",
      idempotencyKey: "submission-id",
      metadata: {
        book_slug: "godcode",
        kind,
        reward_amount: Number(amount),
        submission_id: "submission-id"
      },
      path: "/admin/verifications",
      profileId: "profile-id"
    });
  });

  it("approves a general message with zero points and does not call the point award RPC", async () => {
    const supabase = buildClient({
      kind: "general_message",
      rpcResult: { approved: true, balance: null, error_code: null, ledger_id: null }
    });
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(supabase.client as never);

    await expect(approveSubmission(buildForm("0"))).rejects.toThrow(
      "NEXT_REDIRECT:/admin/verifications/submission-id?saved=approved"
    );

    expect(supabase.rpc).toHaveBeenCalledTimes(1);
    expect(supabase.rpc).toHaveBeenCalledWith(
      "approve_verification_submission",
      expect.objectContaining({ p_reward_amount: 0 })
    );
    expect(supabase.rpc).not.toHaveBeenCalledWith("award_ioh_points", expect.anything());
  });

  it("treats a repeated approval result as an idempotent success", async () => {
    const supabase = buildClient({
      kind: "amazon_purchase",
      rpcResult: {
        approved: true,
        balance: 30,
        error_code: "already_approved",
        ledger_id: "existing-ledger-id"
      }
    });
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(supabase.client as never);

    await expect(approveSubmission(buildForm("30"))).rejects.toThrow(
      "NEXT_REDIRECT:/admin/verifications/submission-id?saved=approved"
    );
    expect(supabase.rpc).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["duplicate_book_reward", "approve_duplicate_book_reward"],
    ["duplicate_review_url", "approve_duplicate_review_url"]
  ])("shows a meaningful redirect for %s", async (errorCode, queryError) => {
    const supabase = buildClient({
      kind: "amazon_review",
      rpcResult: { approved: false, balance: null, error_code: errorCode, ledger_id: null }
    });
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(supabase.client as never);

    await expect(approveSubmission(buildForm("250"))).rejects.toThrow(
      `NEXT_REDIRECT:/admin/verifications/submission-id?error=${queryError}`
    );
  });

  it("does not accept a custom reward without an admin note or trust the hidden expected value", async () => {
    const supabase = buildClient({ kind: "amazon_purchase" });
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(supabase.client as never);

    await expect(approveSubmission(buildForm("999999"))).rejects.toThrow(
      "NEXT_REDIRECT:/admin/verifications/submission-id?error=note_required_for_custom_reward"
    );
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("rejects negative rewards before calling the approval RPC", async () => {
    await expect(approveSubmission(buildForm("-1"))).rejects.toThrow(
      "NEXT_REDIRECT:/admin/verifications/submission-id?error=negative_reward"
    );
    expect(createSupabaseServiceRoleClient).not.toHaveBeenCalled();
  });

  it("prevents support staff from approving", async () => {
    vi.mocked(requireStaff).mockResolvedValue({
      roles: ["support"],
      user: { id: "support-id" }
    } as never);

    await expect(approveSubmission(buildForm("30"))).rejects.toThrow(
      "NEXT_REDIRECT:/unauthorized"
    );
    expect(createSupabaseServiceRoleClient).not.toHaveBeenCalled();
  });

  it("stops on an RPC/ledger failure and does not report approval success", async () => {
    const supabase = buildClient({
      kind: "amazon_purchase",
      rpcError: { message: "ledger insert failed" }
    });
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(supabase.client as never);

    await expect(approveSubmission(buildForm("30"))).rejects.toThrow(
      "NEXT_REDIRECT:/admin/verifications/submission-id?error=approve_failed"
    );
    expect(captureError).toHaveBeenCalled();
    expect(logInfo).not.toHaveBeenCalledWith("verification.approve", expect.anything());
  });
});
