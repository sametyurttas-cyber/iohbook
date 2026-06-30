import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  submitContactMessageAction,
  getContactMessagesAction,
  updateContactMessageStatusAction,
  updateContactMessageNotesAction
} from "./contact-actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

vi.mock("@/features/auth/queries", () => ({
  getCurrentUser: vi.fn(),
  requireStaff: vi.fn()
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn()
}));

const { getCurrentUser, requireStaff } = await import("@/features/auth/queries");
const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/service-role");

describe("contact system actions", () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.resetAllMocks();

    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null })
    };

    (createSupabaseServiceRoleClient as any).mockReturnValue(mockSupabase);
  });

  describe("submitContactMessageAction", () => {
    it("fails on invalid name", async () => {
      const res = await submitContactMessageAction({
        name: "",
        email: "test@example.com",
        purpose: "support",
        message: "Hello this is a valid message length."
      });
      expect(res.ok).toBe(false);
      expect(res.error).toContain("name");
    });

    it("fails on invalid email", async () => {
      const res = await submitContactMessageAction({
        name: "John Doe",
        email: "notanemail",
        purpose: "support",
        message: "Hello this is a valid message length."
      });
      expect(res.ok).toBe(false);
      expect(res.error).toContain("email");
    });

    it("fails on too short message", async () => {
      const res = await submitContactMessageAction({
        name: "John Doe",
        email: "test@example.com",
        purpose: "support",
        message: "short"
      });
      expect(res.ok).toBe(false);
      expect(res.error).toContain("message");
    });

    it("succeeds and stores signal when inputs are valid", async () => {
      (getCurrentUser as any).mockResolvedValue(null);
      mockSupabase.select.mockResolvedValue({ count: 0, error: null });

      const res = await submitContactMessageAction({
        name: "John Doe",
        email: "test@example.com",
        purpose: "support",
        message: "This is a valid long transmission signal body."
      });

      expect(res.ok).toBe(true);
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "John Doe",
          email: "test@example.com",
          purpose: "support",
          message: "This is a valid long transmission signal body."
        })
      );
    });
  });

  describe("getContactMessagesAction", () => {
    it("denies access if user is not staff", async () => {
      (requireStaff as any).mockResolvedValue(null);
      const res = await getContactMessagesAction({});
      expect(res.ok).toBe(false);
      expect(res.error).toContain("Unauthorized");
    });

    it("allows access and retrieves messages if user is staff", async () => {
      (requireStaff as any).mockResolvedValue({ id: "staff-id" });
      mockSupabase.order.mockResolvedValue({
        data: [{ id: "msg-1", name: "Alice" }],
        error: null
      });

      const res = await getContactMessagesAction({});
      expect(res.ok).toBe(true);
      expect(res.data).toHaveLength(1);
    });
  });
});
