/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getRecipientsForSegment } from "./campaign-queries";
import {
  createCampaignAction,
  sendTestCampaignAction,
  processCampaignBatchAction,
  retryFailedCampaignRecipientsAction,
  pauseCampaignAction
} from "./campaign-actions";

vi.mock("@/features/auth/queries", () => ({
  requireStaff: vi.fn(),
  getCurrentUser: vi.fn()
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn()
}));

vi.mock("@/features/email/service", () => ({
  sendTransactionalEmail: vi.fn(() => Promise.resolve({ ok: true, provider: "resend", messageId: "msg-id" }))
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

const { requireStaff, getCurrentUser } = await import("@/features/auth/queries");
const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/service-role");
const { sendTransactionalEmail } = await import("@/features/email/service");

function buildCampaignSupabaseMock() {
  let lastTable = "";
  let queryOptions: any = {};

  const chain: any = {
    eq: vi.fn((_col, _val) => {
      if (_col === "type") queryOptions.type = _val;
      if (_col === "kind") queryOptions.kind = _val;
      if (_col === "status") queryOptions.status = _val;
      if (_col === "batch_id") queryOptions.batch_id = _val;
      if (_col === "id") queryOptions.id = _val;
      if (_col === "profile_id") queryOptions.profile_id = _val;
      return chain;
    }),
    in: vi.fn(() => {
      return chain;
    }),
    gt: vi.fn(() => {
      return chain;
    }),
    select: vi.fn((_fields, _opts) => {
      if (_opts?.count) queryOptions.countExact = true;
      return chain;
    }),
    insert: vi.fn((_data) => {
      queryOptions.insertData = _data;
      return chain;
    }),
    update: vi.fn((_data) => {
      queryOptions.updateData = _data;
      return chain;
    }),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    maybeSingle: vi.fn(() => chain),
    single: vi.fn(() => chain),
    then: vi.fn((resolve: (val: any) => void) => {
      let data: any = null;
      const error: any = null;

      if (lastTable === "email_preferences") {
        if (queryOptions.profile_id) {
          data = { marketing_enabled: queryOptions.profile_id !== "optout-profile" };
        } else {
          data = [
            { profile_id: "p1", profiles: { id: "p1", email: "p1@test.com", full_name: "User One", created_at: new Date().toISOString() } },
            { profile_id: "p2", profiles: { id: "p2", email: "p2@test.com", full_name: "User Two", created_at: new Date().toISOString() } }
          ];
        }
      } else if (lastTable === "profiles") {
        if (queryOptions.id) {
          data = { marketing_email_opt_in: queryOptions.id !== "optout-profile" };
        } else {
          data = [
            { id: "p1", email: "p1@test.com", full_name: "User One", marketing_email_opt_in: true, created_at: new Date().toISOString() },
            { id: "p2", email: "p2@test.com", full_name: "User Two", marketing_email_opt_in: true, created_at: new Date().toISOString() }
          ];
        }
      } else if (lastTable === "products") {
        data = [{ id: "prod-1" }];
      } else if (lastTable === "product_variants") {
        data = [{ id: "var-1" }];
      } else if (lastTable === "order_items") {
        data = [{ order_id: "ord-1" }];
      } else if (lastTable === "orders") {
        data = [{ profile_id: "p1" }];
      } else if (lastTable === "entitlements") {
        data = [{ profile_id: "p1" }];
      } else if (lastTable === "verification_submissions") {
        data = [{ profile_id: "p1" }];
      } else if (lastTable === "ioh_point_balances") {
        data = [{ profile_id: "p1" }];
      } else if (lastTable === "email_batches") {
        if (queryOptions.insertData) {
          data = { id: "new-batch-id" };
        } else {
          data = {
            id: queryOptions.id || "camp-1",
            title: "Weekly News",
            subject: "Updates",
            body_text: "Text content",
            status: "draft",
            sent_count: 0,
            failed_count: 0,
            skipped_count: 0,
            total_recipients: 2,
            scheduled_at: null,
            started_at: null,
            completed_at: null
          };
        }
      } else if (lastTable === "email_batch_recipients") {
        if (queryOptions.countExact) {
          resolve({ count: 0, data: null, error: null });
          return;
        } else if (queryOptions.status === "pending") {
          data = [
            { id: "r1", batch_id: "camp-1", profile_id: "p1", email: "p1@test.com", status: "pending" },
            { id: "r2", batch_id: "camp-2", profile_id: "optout-profile", email: "optout@test.com", status: "pending" }
          ];
        } else {
          data = [];
        }
      }

      // Reset
      lastTable = "";
      queryOptions = {};

      resolve({ data, error });
    })
  };

  const client = {
    from: vi.fn((tableName) => {
      lastTable = tableName;
      return chain;
    })
  } as unknown as SupabaseClient;

  return { client, chain };
}

describe("email campaigns service & actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getRecipientsForSegment", () => {
    it("resolves all opted-in profiles", async () => {
      const { client } = buildCampaignSupabaseMock();
      vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(client);

      const result = await getRecipientsForSegment("all");
      expect(result).toHaveLength(2);
      expect(result[0].email).toBe("p1@test.com");
    });
  });

  describe("createCampaignAction", () => {
    it("blocks unauthorized users (non-staff)", async () => {
      vi.mocked(requireStaff).mockResolvedValue(null as any);

      const res = await createCampaignAction({
        title: "Test Campaign",
        segmentKey: "all",
        subject: "Subject",
        body: "Body text"
      });

      expect(res.ok).toBe(false);
      expect(res.error).toContain("yetkiniz");
    });

    it("validates fields and creates campaign batch with recipients", async () => {
      vi.mocked(requireStaff).mockResolvedValue({ id: "staff-1", roles: ["owner"] } as any);
      vi.mocked(getCurrentUser).mockResolvedValue({ id: "admin-1", email: "admin@test.com" } as User);

      const { client } = buildCampaignSupabaseMock();
      vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(client);

      const res = await createCampaignAction({
        title: "Weekly Newsletter",
        segmentKey: "all",
        subject: "Read our updates",
        body: "Cool body content"
      });

      expect(res.ok).toBe(true);
      expect(res.campaignId).toBe("new-batch-id");
    });
  });

  describe("sendTestCampaignAction", () => {
    it("sends test email and updates campaign header schedule time", async () => {
      vi.mocked(requireStaff).mockResolvedValue({ id: "staff-1", roles: ["admin_ops"] } as any);
      vi.mocked(getCurrentUser).mockResolvedValue({ id: "admin-1", email: "admin@test.com" } as User);

      const { client } = buildCampaignSupabaseMock();
      vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(client);
      vi.mocked(sendTransactionalEmail).mockResolvedValue({ ok: true, provider: "resend", messageId: "msg-test-123" });

      const res = await sendTestCampaignAction("campaign-123");
      expect(res.ok).toBe(true);
      expect(sendTransactionalEmail).toHaveBeenCalledWith(expect.objectContaining({
        templateKey: "campaign_email",
        to: "admin@test.com"
      }));
    });
  });

  describe("processCampaignBatchAction", () => {
    it("processes recipients and updates stats, skipping opted-out users", async () => {
      vi.mocked(requireStaff).mockResolvedValue({ id: "staff-1", roles: ["owner"] } as any);

      const { client } = buildCampaignSupabaseMock();
      vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(client);
      vi.mocked(sendTransactionalEmail).mockResolvedValue({ ok: true, provider: "resend", messageId: "sent-msg-123" });

      const res = await processCampaignBatchAction("camp-1");

      expect(res.ok).toBe(true);
      expect(res.processed).toBe(2);
      expect(res.skipped).toBe(1); // optout-profile
      expect(res.sent).toBe(1); // p1@test.com
    });
  });

  describe("pauseCampaignAction", () => {
    it("updates campaign status to draft", async () => {
      vi.mocked(requireStaff).mockResolvedValue({ id: "staff-1", roles: ["admin_ops"] } as any);

      const { client, chain } = buildCampaignSupabaseMock();
      vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(client);

      const res = await pauseCampaignAction("camp-1");
      expect(res.ok).toBe(true);
      expect(chain.update).toHaveBeenCalledWith({ status: "draft" });
    });
  });

  describe("retryFailedCampaignRecipientsAction", () => {
    it("resets failed recipients to pending and campaign status to draft", async () => {
      vi.mocked(requireStaff).mockResolvedValue({ id: "staff-1", roles: ["owner"] } as any);

      const { client, chain } = buildCampaignSupabaseMock();
      vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(client);

      const res = await retryFailedCampaignRecipientsAction("camp-1");
      expect(res.ok).toBe(true);
      expect(chain.update).toHaveBeenCalledWith({ status: "draft", failed_count: 0, completed_at: null });
    });
  });
});
