import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  getAdminEmailStats,
  listAdminEmailLogs,
  requireEmailStaff
} from "./admin-queries";
import {
  retryFailedEmailAction,
  sendTestEmailAction,
  searchProfilesAction,
  sendManualEmailAction
} from "./admin-actions";

vi.mock("@/features/auth/queries", () => ({
  requireStaff: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn()
}));

vi.mock("@/features/email/service", () => ({
  sendTransactionalEmail: vi.fn(() => Promise.resolve({ ok: true, provider: "resend", messageId: "msg-id" })),
  sendTestEmail: vi.fn(() => Promise.resolve({ ok: true, provider: "resend", messageId: "test-msg-id" }))
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

const { requireStaff } = await import("@/features/auth/queries");
const { createSupabaseServerClient } = await import("@/lib/supabase/server");
const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/service-role");
const { sendTransactionalEmail, sendTestEmail } = await import("@/features/email/service");

function buildSupabaseMock() {
  let lastStatus = "all";
  let lastGte = false;

  const chain = {
    eq: vi.fn((col, val) => {
      if (col === "status") {
        lastStatus = val;
      }
      return chain;
    }),
    in: vi.fn((col) => {
      if (col === "status") {
        lastStatus = "pending";
      }
      return chain;
    }),
    gte: vi.fn(() => {
      lastGte = true;
      return chain;
    }),
    lte: vi.fn(() => chain),
    ilike: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    select: vi.fn(() => chain),
    single: vi.fn(async () => ({
      data: {
        id: "event-id",
        status: "failed",
        recipient: "x@example.com",
        template_key: "welcome",
        payload: { _variables: { userName: "Samet" } }
      },
      error: null
    })),
    maybeSingle: vi.fn(async () => ({
      data: {
        id: "event-id",
        status: "failed",
        recipient: "x@example.com",
        template_key: "welcome",
        payload: { _variables: { userName: "Samet" } }
      },
      error: null
    })),
    then: vi.fn((resolve: (value: unknown) => void) => {
      let count = 10;
      if (lastStatus === "failed") {
        count = 2;
      } else if (lastStatus === "pending") {
        count = 1;
      } else if (lastGte) {
        count = 5;
      }
      // Reset state for next chain
      lastStatus = "all";
      lastGte = false;

      resolve({
        count,
        data: [
          { id: "event-1", recipient: "a@a.com", status: "sent", created_at: "2026-06-22", payload: { _variables: { userName: "Samet" } } }
        ],
        error: null
      });
    })
  };

  return {
    from: vi.fn(() => chain),
    rpc: vi.fn()
  };
}

describe("admin emails system", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("permissions", () => {
    it("allows owner/admin_ops/support roles", async () => {
      vi.mocked(requireStaff).mockResolvedValueOnce({ roles: ["support"], user: { id: "uid" } as unknown as User });
      const staff = await requireEmailStaff();
      expect(staff).not.toBeNull();
      expect(staff?.roles).toContain("support");
    });

    it("denies other roles or guests", async () => {
      vi.mocked(requireStaff).mockResolvedValueOnce(null);
      const staff = await requireEmailStaff();
      expect(staff).toBeNull();
    });
  });

  describe("queries", () => {
    it("retrieves dashboard stats successfully", async () => {
      vi.mocked(requireStaff).mockResolvedValueOnce({ roles: ["admin_ops"], user: { id: "uid" } as unknown as User });
      const client = buildSupabaseMock();
      vi.mocked(createSupabaseServerClient).mockResolvedValueOnce(client as unknown as SupabaseClient);

      const stats = await getAdminEmailStats();
      expect(stats).not.toBeNull();
      expect(stats?.totalCount).toBe(10);
      expect(stats?.failedCount).toBe(2);
    });

    it("lists email logs with filters", async () => {
      vi.mocked(requireStaff).mockResolvedValueOnce({ roles: ["support"], user: { id: "uid" } as unknown as User });
      const client = buildSupabaseMock();
      vi.mocked(createSupabaseServerClient).mockResolvedValueOnce(client as unknown as SupabaseClient);

      const logs = await listAdminEmailLogs({ status: "sent", templateKey: "welcome" });
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].recipient).toBe("a@a.com");
    });
  });

  describe("actions", () => {
    it("denies support from retrying failed emails", async () => {
      vi.mocked(requireStaff).mockResolvedValueOnce(null); // not owner/admin_ops

      const result = await retryFailedEmailAction("event-id");
      expect(result.ok).toBe(false);
      expect(result.error).toContain("yetkiniz bulunmamaktadır");
    });

    it("allows owner/admin_ops to retry failed emails", async () => {
      vi.mocked(requireStaff).mockResolvedValueOnce({ roles: ["admin_ops"], user: { id: "uid" } as unknown as User });
      const client = buildSupabaseMock();
      vi.mocked(createSupabaseServiceRoleClient).mockReturnValueOnce(client as unknown as SupabaseClient);

      const result = await retryFailedEmailAction("event-id");
      expect(result.ok).toBe(true);
      expect(sendTransactionalEmail).toHaveBeenCalledWith(expect.objectContaining({
        templateKey: "welcome",
        to: "x@example.com",
        variables: { userName: "Samet" }
      }));
    });

    it("denies support from sending test emails", async () => {
      vi.mocked(requireStaff).mockResolvedValueOnce(null);

      const result = await sendTestEmailAction("x@example.com", "welcome");
      expect(result.ok).toBe(false);
      expect(result.error).toContain("yetkiniz bulunmamaktadır");
    });

    it("allows admin_ops to send test emails", async () => {
      vi.mocked(requireStaff).mockResolvedValueOnce({ roles: ["admin_ops"], user: { id: "uid" } as unknown as User });

      const result = await sendTestEmailAction("x@example.com", "welcome");
      expect(result.ok).toBe(true);
      expect(sendTestEmail).toHaveBeenCalledWith("x@example.com", "welcome");
    });
  });

  describe("searchProfilesAction", () => {
    it("denies access to non-staff", async () => {
      vi.mocked(requireStaff).mockResolvedValueOnce(null);
      const result = await searchProfilesAction("test");
      expect(result.ok).toBe(false);
      expect(result.error).toContain("yetkiniz bulunmamaktadır");
    });

    it("allows staff to search profiles", async () => {
      vi.mocked(requireStaff).mockResolvedValueOnce({ roles: ["support"], user: { id: "uid" } as unknown as User });
      const mockClient = {
        from: vi.fn(() => {
          const chain = {
            select: vi.fn(() => chain),
            or: vi.fn(() => chain),
            limit: vi.fn(async () => ({
              data: [{ id: "user-1", email: "a@a.com", full_name: "John Doe" }],
              error: null
            }))
          };
          return chain;
        })
      };
      vi.mocked(createSupabaseServiceRoleClient).mockReturnValueOnce(mockClient as unknown as SupabaseClient);

      const result = await searchProfilesAction("John");
      expect(result.ok).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].full_name).toBe("John Doe");
    });
  });

  describe("sendManualEmailAction", () => {
    it("denies non-owners/admin_ops (like support or guests)", async () => {
      vi.mocked(requireStaff).mockResolvedValueOnce(null); // Denied roles
      const result = await sendManualEmailAction({
        profileId: "profile-id",
        to: "x@example.com",
        subject: "Hello",
        body: "World"
      });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("yetkiniz bulunmamaktadır");
    });

    it("validates empty subject or body", async () => {
      vi.mocked(requireStaff).mockResolvedValueOnce({ roles: ["admin_ops"], user: { id: "uid" } as unknown as User });
      const result1 = await sendManualEmailAction({
        profileId: "profile-id",
        to: "x@example.com",
        subject: "",
        body: "World"
      });
      expect(result1.ok).toBe(false);
      expect(result1.error).toContain("konusu boş bırakılamaz");

      vi.mocked(requireStaff).mockResolvedValueOnce({ roles: ["admin_ops"], user: { id: "uid" } as unknown as User });
      const result2 = await sendManualEmailAction({
        profileId: "profile-id",
        to: "x@example.com",
        subject: "Hello",
        body: ""
      });
      expect(result2.ok).toBe(false);
      expect(result2.error).toContain("içeriği boş bırakılamaz");
    });

    it("denies sending if user profile doesn't exist", async () => {
      vi.mocked(requireStaff).mockResolvedValueOnce({ roles: ["admin_ops"], user: { id: "uid" } as unknown as User });
      const mockClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: async () => ({ data: null, error: null })
            }))
          }))
        }))
      };
      vi.mocked(createSupabaseServiceRoleClient).mockReturnValueOnce(mockClient as unknown as SupabaseClient);

      const result = await sendManualEmailAction({
        profileId: "non-existent",
        to: "x@example.com",
        subject: "Hello",
        body: "World"
      });
      expect(result.ok).toBe(false);
      expect(result.error).toContain("bulunamadı");
    });

    it("sends manual email successfully", async () => {
      vi.mocked(requireStaff).mockResolvedValueOnce({ roles: ["owner"], user: { id: "uid" } as unknown as User });
      const mockClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: async () => ({ data: { email: "x@example.com" }, error: null })
            }))
          }))
        }))
      };
      vi.mocked(createSupabaseServiceRoleClient).mockReturnValueOnce(mockClient as unknown as SupabaseClient);

      const result = await sendManualEmailAction({
        profileId: "profile-id",
        to: "x@example.com",
        subject: "Hello",
        body: "World"
      });

      expect(result.ok).toBe(true);
      expect(sendTransactionalEmail).toHaveBeenCalledWith({
        templateKey: "manual_email",
        to: "x@example.com",
        profileId: "profile-id",
        variables: {
          subject: "Hello",
          body: "World"
        }
      });
    });
  });
});
