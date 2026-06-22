import { beforeEach, describe, expect, it, vi } from "vitest";
import { createVerificationSubmission } from "@/features/verification/actions";
import { createVerificationRecordId } from "@/features/verification/idempotency";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }
}));
vi.mock("@/features/account/queries", () => ({
  requireAccountUser: vi.fn(async () => ({ id: "profile-id", email: "customer@example.com" }))
}));
vi.mock("@/features/analytics/business-events", () => ({
  trackServerAnalyticsEvent: vi.fn()
}));
vi.mock("@/lib/observability", () => ({ captureError: vi.fn(), logInfo: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn() }));
vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn()
}));

vi.mock("@/features/email/service", () => ({
  sendTransactionalEmail: vi.fn(async () => ({ ok: true, provider: "resend" }))
}));

const { trackServerAnalyticsEvent } = await import("@/features/analytics/business-events");
const { createSupabaseServerClient } = await import("@/lib/supabase/server");
const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/service-role");
const { sendTransactionalEmail } = await import("@/features/email/service");
const { captureError } = await import("@/lib/observability");

describe("verification submission analytics and emails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      from(table: string) {
        if (table === "verification_submissions") {
          return {
            insert() {
              return this;
            },
            select() {
              return this;
            },
            single: async () => ({ data: { id: "submission-id" }, error: null })
          };
        }
        if (table === "verification_attachments") {
          return { insert: async () => ({ error: null }) };
        }
        if (table === "profiles") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: { full_name: "Customer Name" }, error: null })
              })
            })
          };
        }
        throw new Error(`Unexpected table: ${table}`);
      }
    } as never);
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue({
      storage: {
        from: () => ({
          remove: vi.fn(async () => ({ error: null })),
          upload: vi.fn(async () => ({ error: null }))
        })
      }
    } as never);
  });

  it("tracks an Amazon submission and triggers email notification", async () => {
    const requestId = "11111111-1111-4111-8111-111111111111";
    const submissionId = createVerificationRecordId(
      "verification-submission",
      "profile-id",
      requestId
    );
    const formData = new FormData();
    formData.set("kind", "amazon_purchase");
    formData.set("title", "GODCODE satin alma dogrulamasi");
    formData.set("book_slug", "godcode");
    formData.set("amazon_order_id", "SECRET-AMAZON-ORDER");
    formData.set("request_id", requestId);
    formData.append("attachments", new File(["proof"], "proof.png", { type: "image/png" }));

    await expect(createVerificationSubmission(formData)).rejects.toThrow(
      `NEXT_REDIRECT:/account/rewards/${submissionId}`
    );
    expect(trackServerAnalyticsEvent).toHaveBeenCalledWith({
      eventName: "amazon_verification_submitted",
      idempotencyKey: submissionId,
      metadata: {
        book_slug: "godcode",
        kind: "amazon_purchase",
        submission_id: submissionId
      },
      path: "/account/rewards/new",
      profileId: "profile-id"
    });
    expect(JSON.stringify(vi.mocked(trackServerAnalyticsEvent).mock.calls)).not.toContain(
      "SECRET-AMAZON-ORDER"
    );

    expect(sendTransactionalEmail).toHaveBeenCalledWith({
      templateKey: "amazon_verification_received",
      to: "customer@example.com",
      profileId: "profile-id",
      variables: {
        userName: "Customer Name",
        verificationTitle: "GODCODE satin alma dogrulamasi",
        accountUrl: `http://localhost:3000/account/rewards/${submissionId}`
      },
      metadata: {
        submission_id: submissionId,
        kind: "amazon_purchase"
      }
    });
  });

  it("succeeds even if email notification fails", async () => {
    const requestId = "22222222-2222-4222-8222-222222222222";
    const submissionId = createVerificationRecordId(
      "verification-submission",
      "profile-id",
      requestId
    );
    const formData = new FormData();
    formData.set("kind", "amazon_purchase");
    formData.set("title", "GODCODE satin alma dogrulamasi");
    formData.set("book_slug", "godcode");
    formData.set("amazon_order_id", "SECRET-AMAZON-ORDER");
    formData.set("request_id", requestId);
    formData.append("attachments", new File(["proof"], "proof.png", { type: "image/png" }));

    vi.mocked(sendTransactionalEmail).mockRejectedValueOnce(new Error("Email failed"));

    await expect(createVerificationSubmission(formData)).rejects.toThrow(
      `NEXT_REDIRECT:/account/rewards/${submissionId}`
    );

    expect(captureError).toHaveBeenCalled();
  });
});
