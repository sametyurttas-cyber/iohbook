/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import {
  createUnsubscribeToken,
  consumeUnsubscribeToken,
  getAccountEmailPreferences,
  updateAccountPreferencesAction
} from "./preferences-actions";

vi.mock("@/features/auth/queries", () => ({
  requireUser: vi.fn()
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn()
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn()
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

const { requireUser } = await import("@/features/auth/queries");
const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/service-role");
const { createSupabaseServerClient } = await import("@/lib/supabase/server");

function buildPreferencesSupabaseMock() {
  let lastTable = "";
  let queryOptions: any = {};

  const chain: any = {
    eq: vi.fn((_col, _val) => {
      if (_col === "token_hash") queryOptions.token_hash = _val;
      if (_col === "profile_id") queryOptions.profile_id = _val;
      if (_col === "id") queryOptions.id = _val;
      return chain;
    }),
    select: vi.fn(() => chain),
    insert: vi.fn((_data) => {
      queryOptions.insertData = _data;
      return chain;
    }),
    update: vi.fn((_data) => {
      queryOptions.updateData = _data;
      return chain;
    }),
    single: vi.fn(() => chain),
    maybeSingle: vi.fn(() => chain),
    then: vi.fn((resolve: (val: any) => void) => {
      let data: any = null;
      const error: any = null;

      if (lastTable === "email_preferences") {
        if (queryOptions.insertData) {
          data = { ...queryOptions.insertData, updated_at: new Date().toISOString() };
        } else if (queryOptions.profile_id === "legacy-user") {
          data = null; // trigger auto-create
        } else {
          data = {
            profile_id: queryOptions.profile_id || "user-1",
            transactional_enabled: true,
            marketing_enabled: true,
            product_updates_enabled: true,
            community_enabled: true,
            amazon_rewards_enabled: true,
            updated_at: new Date().toISOString()
          };
        }
      } else if (lastTable === "profiles") {
        data = { id: "legacy-user", marketing_email_opt_in: true };
      } else if (lastTable === "email_unsubscribe_tokens") {
        if (queryOptions.insertData) {
          data = queryOptions.insertData;
        } else if (queryOptions.token_hash) {
          if (queryOptions.token_hash === crypto.createHash("sha256").update("expired-token").digest("hex")) {
            data = {
              id: "t-expired",
              profile_id: "user-1",
              token_hash: queryOptions.token_hash,
              category: "marketing",
              expires_at: new Date(Date.now() - 3600000).toISOString(),
              used_at: null
            };
          } else if (queryOptions.token_hash === crypto.createHash("sha256").update("used-token").digest("hex")) {
            data = {
              id: "t-used",
              profile_id: "user-1",
              token_hash: queryOptions.token_hash,
              category: "marketing",
              expires_at: new Date(Date.now() + 3600000).toISOString(),
              used_at: new Date().toISOString()
            };
          } else if (queryOptions.token_hash === crypto.createHash("sha256").update("valid-token").digest("hex")) {
            data = {
              id: "t-valid",
              profile_id: "user-1",
              token_hash: queryOptions.token_hash,
              category: "marketing",
              expires_at: new Date(Date.now() + 3600000).toISOString(),
              used_at: null
            };
          } else {
            data = null; // invalid token
          }
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

describe("email preferences actions & tokens", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAccountEmailPreferences", () => {
    it("fetches preferences and handles legacy users auto-creation", async () => {
      const { client } = buildPreferencesSupabaseMock();
      vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(client);

      const prefs = await getAccountEmailPreferences("legacy-user");
      expect(prefs).toBeDefined();
      expect(prefs.marketing_enabled).toBe(true);
    });
  });

  describe("updateAccountPreferencesAction", () => {
    it("requires authentication", async () => {
      vi.mocked(requireUser).mockResolvedValue(null as any);

      const res = await updateAccountPreferencesAction({
        marketing: false,
        productUpdates: false,
        community: false,
        amazonRewards: false
      });

      expect(res.ok).toBe(false);
      expect(res.error).toContain("Oturum");
    });

    it("updates both email preferences and core profile settings", async () => {
      vi.mocked(requireUser).mockResolvedValue({ id: "user-1", email: "user@test.com" } as any);
      const { client, chain } = buildPreferencesSupabaseMock();
      vi.mocked(createSupabaseServerClient).mockResolvedValue(client as any);

      const res = await updateAccountPreferencesAction({
        marketing: false,
        productUpdates: true,
        community: true,
        amazonRewards: false
      });

      expect(res.ok).toBe(true);
      expect(chain.update).toHaveBeenCalledWith(expect.objectContaining({
        marketing_enabled: false,
        product_updates_enabled: true
      }));
    });
  });

  describe("createUnsubscribeToken", () => {
    it("generates 32-byte token and inserts SHA-256 hash into database", async () => {
      const { client, chain } = buildPreferencesSupabaseMock();
      vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(client);

      const token = await createUnsubscribeToken("user-1", "marketing");
      expect(token).toBeDefined();
      expect(token.length).toBe(64); // 32 bytes to hex is 64 characters

      const hash = crypto.createHash("sha256").update(token).digest("hex");
      expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({
        token_hash: hash,
        category: "marketing",
        profile_id: "user-1"
      }));
    });
  });

  describe("consumeUnsubscribeToken", () => {
    it("rejects invalid tokens safely", async () => {
      const { client } = buildPreferencesSupabaseMock();
      vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(client);

      const res = await consumeUnsubscribeToken("invalid-token");
      expect(res.ok).toBe(false);
      expect(res.error).toContain("Geçersiz");
    });

    it("rejects expired tokens", async () => {
      const { client } = buildPreferencesSupabaseMock();
      vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(client);

      const res = await consumeUnsubscribeToken("expired-token");
      expect(res.ok).toBe(false);
      expect(res.error).toContain("süresi dolmuş");
    });

    it("handles used tokens idempotently by returning success", async () => {
      const { client } = buildPreferencesSupabaseMock();
      vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(client);

      const res = await consumeUnsubscribeToken("used-token");
      expect(res.ok).toBe(true);
      expect(res.category).toBe("marketing");
    });

    it("consummates a valid token, updates preference, and marks used", async () => {
      const { client, chain } = buildPreferencesSupabaseMock();
      vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(client);

      const res = await consumeUnsubscribeToken("valid-token");
      expect(res.ok).toBe(true);
      expect(res.category).toBe("marketing");

      // Verifies that marketing preference was set to false
      expect(chain.update).toHaveBeenCalledWith(expect.objectContaining({
        marketing_enabled: false
      }));

      // Verifies token marked as used
      expect(chain.update).toHaveBeenCalledWith(expect.objectContaining({
        used_at: expect.any(String)
      }));
    });
  });
});
