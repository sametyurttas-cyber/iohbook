import { beforeEach, describe, expect, it, vi } from "vitest";
import { downloadEntitlement } from "@/features/entitlements/actions";

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }
}));

vi.mock("@/features/auth/queries", () => ({
  requireUser: vi.fn(async () => ({ email: "reader@example.com", id: "profile-id" }))
}));

vi.mock("@/lib/observability", () => ({
  captureError: vi.fn(),
  logInfo: vi.fn()
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn()
}));

const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/service-role");
const { captureError } = await import("@/lib/observability");

function buildFormData(entitlementId = "entitlement-id") {
  const formData = new FormData();
  formData.set("entitlement_id", entitlementId);
  return formData;
}

function buildEntitlement(overrides: Record<string, unknown> = {}) {
  return {
    claim_reference: null,
    created_at: "2026-06-16T00:00:00.000Z",
    download_count: 0,
    download_limit: 5,
    expires_at: null,
    id: "entitlement-id",
    kind: "digital",
    order_item_id: "order-item-id",
    order_items: {
      id: "order-item-id",
      orders: {
        id: "order-id",
        status: "paid"
      }
    },
    profile_id: "profile-id",
    starts_at: null,
    status: "active",
    storage_bucket: "digital-deliveries",
    storage_path: "ebooks/godcode.pdf",
    updated_at: "2026-06-16T00:00:00.000Z",
    variant_id: "variant-id",
    ...overrides
  };
}

function createSupabaseMock(options: {
  entitlement?: Record<string, unknown> | null;
  findError?: Error | null;
  signedError?: Error | null;
  updateError?: Error | null;
} = {}) {
  const auditRows: unknown[] = [];
  const signedUrlCalls: Array<{ path: string; seconds: number }> = [];
  const updateCalls: unknown[] = [];
  const entitlement = options.entitlement === undefined ? buildEntitlement() : options.entitlement;

  const supabase = {
    from(table: string) {
      if (table === "entitlements") {
        return {
          eq() {
            return this;
          },
          select() {
            return this;
          },
          single: async () => ({
            data: entitlement,
            error: options.findError ?? null
          }),
          update(payload: unknown) {
            updateCalls.push(payload);
            return {
              eq() {
                return this;
              },
              then(resolve: (value: { error: Error | null }) => void) {
                resolve({ error: options.updateError ?? null });
              }
            };
          }
        };
      }

      if (table === "audit_logs") {
        return {
          insert: async (row: unknown) => {
            auditRows.push(row);
            return { error: null };
          }
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
    storage: {
      from(bucket: string) {
        return {
          createSignedUrl: async (path: string, seconds: number) => {
            signedUrlCalls.push({ path, seconds });
            return {
              data: { signedUrl: `https://signed.example/${bucket}/${path}?ttl=${seconds}` },
              error: options.signedError ?? null
            };
          }
        };
      }
    }
  };

  return {
    auditRows,
    signedUrlCalls,
    supabase,
    updateCalls
  };
}

describe("downloadEntitlement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a 5 minute signed URL for the entitlement owner", async () => {
    const mock = createSupabaseMock();
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(mock.supabase as never);

    await expect(downloadEntitlement(buildFormData())).rejects.toThrow(
      "NEXT_REDIRECT:https://signed.example/digital-deliveries/ebooks/godcode.pdf?ttl=300"
    );

    expect(mock.signedUrlCalls).toEqual([{ path: "ebooks/godcode.pdf", seconds: 300 }]);
    expect(mock.updateCalls).toEqual([{ download_count: 1 }]);
    expect(mock.auditRows).toEqual([
      expect.objectContaining({
        action: "entitlement.download_url_created",
        actor_profile_id: "profile-id",
        entity_id: "entitlement-id"
      })
    ]);
  });

  it("does not create a signed URL when the entitlement is not owned by the user", async () => {
    const mock = createSupabaseMock({ entitlement: null, findError: new Error("not found") });
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(mock.supabase as never);

    await expect(downloadEntitlement(buildFormData("other-entitlement"))).rejects.toThrow(
      "NEXT_REDIRECT:/account/downloads?error=download-not-found"
    );

    expect(mock.signedUrlCalls).toEqual([]);
    expect(mock.auditRows).toEqual([
      expect.objectContaining({
        action: "entitlement.download_denied",
        actor_profile_id: "profile-id",
        entity_id: "other-entitlement"
      })
    ]);
    expect(captureError).toHaveBeenCalled();
  });

  it("does not create a signed URL before the order is paid", async () => {
    const mock = createSupabaseMock({
      entitlement: buildEntitlement({
        order_items: {
          id: "order-item-id",
          orders: {
            id: "order-id",
            status: "pending_payment"
          }
        }
      })
    });
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(mock.supabase as never);

    await expect(downloadEntitlement(buildFormData())).rejects.toThrow(
      "NEXT_REDIRECT:/account/downloads?error=download-order-not-paid"
    );

    expect(mock.signedUrlCalls).toEqual([]);
  });

  it("does not create a signed URL for inactive entitlements", async () => {
    const mock = createSupabaseMock({
      entitlement: buildEntitlement({ status: "pending" })
    });
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(mock.supabase as never);

    await expect(downloadEntitlement(buildFormData())).rejects.toThrow(
      "NEXT_REDIRECT:/account/downloads?error=download-not-active"
    );

    expect(mock.signedUrlCalls).toEqual([]);
  });
});
