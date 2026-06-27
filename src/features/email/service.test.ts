import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  escapeHtml,
  renderEmailTemplate,
  sendTransactionalEmail,
  sendTestEmail
} from "@/features/email/service";

vi.mock("@/features/email/providers", () => ({
  getEmailProvider: vi.fn()
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn()
}));

vi.mock("@/lib/observability", () => ({
  captureError: vi.fn()
}));

const { getEmailProvider } = await import("@/features/email/providers");
const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/service-role");
const { captureError } = await import("@/lib/observability");

describe("email service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("escapeHtml", () => {
    it("escapes critical HTML characters properly", () => {
      const input = "<div>Hello & 'welcome' \"world\"</div>";
      const expected = "&lt;div&gt;Hello &amp; &#39;welcome&#39; &quot;world&quot;&lt;/div&gt;";
      expect(escapeHtml(input)).toBe(expected);
    });
  });

  describe("renderEmailTemplate", () => {
    it("renders fallback template variables correctly", () => {
      const vars = {
        userName: "Samet",
        email: "samet@example.com",
        accountUrl: "https://iohbook.local/account"
      };

      const rendered = renderEmailTemplate("welcome", vars);

      expect(rendered.subject).toContain("Welcome to the IOH Universe");
      expect(rendered.html).toContain("Hello Samet");
      expect(rendered.html).toContain("samet@example.com");
      expect(rendered.html).toContain("https://iohbook.local/account");
      expect(rendered.text).toContain("Hello Samet");
      expect(rendered.text).toContain("samet@example.com");
    });

    it("escapes template variables in HTML output but keeps raw values in plain text/subject", () => {
      const vars = {
        userName: "<script>alert('xss')</script>",
        email: "xss@example.com",
        accountUrl: "https://iohbook.local/account"
      };

      const rendered = renderEmailTemplate("welcome", vars);

      // HTML should be escaped
      expect(rendered.html).toContain("&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;");
      expect(rendered.html).not.toContain("<script>");

      // Text should not be escaped
      expect(rendered.text).toContain("<script>alert('xss')</script>");
    });

    it("handles missing variables gracefully without throwing", () => {
      const vars = {
        // userName is missing
        email: "test@example.com"
      };

      const rendered = renderEmailTemplate("welcome", vars);

      expect(rendered.html).toContain("Hello ");
      expect(rendered.text).toContain("Hello ");
    });

    it("renders database-defined template if provided", () => {
      const dbTemplate = {
        subject: "Custom Subject for {{userName}}",
        body_html: "<p>Custom HTML for {{userName}}</p>",
        body_text: "Custom Text for {{userName}}",
        preview_text: "Custom Preview for {{userName}}"
      };

      const rendered = renderEmailTemplate("welcome", { userName: "Samet" }, dbTemplate);

      expect(rendered.subject).toBe("Custom Subject for Samet");
      expect(rendered.html).toContain("Custom HTML for Samet");
      expect(rendered.text).toBe("Custom Text for Samet");
      // Shell preview text check
      expect(rendered.html).toContain("Custom Preview for Samet");
    });
  });

  describe("sendTransactionalEmail", () => {
    it("successfully sends mail, logs pending, and updates to sent in database", async () => {
      // Mock Supabase
      const singleMock = vi.fn().mockResolvedValue({
        data: { id: "logged-event-id" },
        error: null
      });

      const maybeSingleMock = vi.fn().mockResolvedValue({
        data: null, // No database template found, fallback will be used
        error: null
      });

      const updateEqMock = vi.fn();
      const supabaseMock = {
        from: vi.fn((table: string) => {
          if (table === "email_templates") {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: maybeSingleMock
                  })
                })
              })
            } as unknown as ReturnType<typeof createSupabaseServiceRoleClient>;
          }
          if (table === "email_events") {
            return {
              insert: () => ({
                select: () => ({
                  single: singleMock
                })
              }),
              update: (payload: unknown) => ({
                eq: (column: string, value: unknown) => {
                  updateEqMock(payload, column, value);
                  return Promise.resolve({ error: null });
                }
              })
            } as unknown as ReturnType<typeof createSupabaseServiceRoleClient>;
          }
          return {} as unknown as ReturnType<typeof createSupabaseServiceRoleClient>;
        })
      };

      vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(supabaseMock as unknown as ReturnType<typeof createSupabaseServiceRoleClient>);

      // Mock Provider
      const sendMock = vi.fn().mockResolvedValue({
        ok: true,
        provider: "resend",
        messageId: "resend-message-id"
      });

      vi.mocked(getEmailProvider).mockReturnValue({
        id: "resend",
        send: sendMock
      });

      const result = await sendTransactionalEmail({
        templateKey: "welcome",
        to: "samet@example.com",
        profileId: "profile-123",
        variables: { userName: "Samet", email: "samet@example.com", accountUrl: "https://ioh.local" }
      });

      expect(result.ok).toBe(true);
      expect(sendMock).toHaveBeenCalled();
      expect(updateEqMock).toHaveBeenCalledWith(
        expect.objectContaining({ status: "sent", provider_message_id: "resend-message-id" }),
        "id",
        "logged-event-id"
      );
    });

    it("marks status as failed if provider fails to send the email", async () => {
      const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const updateEqMock = vi.fn();

      const supabaseMock = {
        from: vi.fn((table: string) => {
          if (table === "email_templates") {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    maybeSingle: maybeSingleMock
                  })
                })
              })
            } as unknown as ReturnType<typeof createSupabaseServiceRoleClient>;
          }
          if (table === "email_events") {
            return {
              insert: () => ({
                select: () => ({
                  single: async () => ({ data: { id: "failed-event-id" }, error: null })
                })
              }),
              update: (payload: unknown) => ({
                eq: (column: string, value: unknown) => {
                  updateEqMock(payload, column, value);
                  return Promise.resolve({ error: null });
                }
              })
            } as unknown as ReturnType<typeof createSupabaseServiceRoleClient>;
          }
          return {} as unknown as ReturnType<typeof createSupabaseServiceRoleClient>;
        })
      };

      vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(supabaseMock as unknown as ReturnType<typeof createSupabaseServiceRoleClient>);

      // Mock Provider to fail
      const sendMock = vi.fn().mockResolvedValue({
        ok: false,
        provider: "resend",
        error: "RESEND_API_KEY is not configured."
      });

      vi.mocked(getEmailProvider).mockReturnValue({
        id: "resend",
        send: sendMock
      });

      const result = await sendTransactionalEmail({
        templateKey: "welcome",
        to: "samet@example.com",
        variables: { userName: "Samet" }
      });

      expect(result.ok).toBe(false);
      expect(updateEqMock).toHaveBeenCalledWith(
        expect.objectContaining({ status: "failed", error_message: "RESEND_API_KEY is not configured." }),
        "id",
        "failed-event-id"
      );
    });

    it("does not throw exception if email flow encounters error, isolating side effects", async () => {
      vi.mocked(createSupabaseServiceRoleClient).mockReturnValue({
        from: vi.fn(() => ({
          select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }),
          insert: () => ({ select: () => ({ single: async () => ({ data: { id: "some-id" }, error: null }) }) }),
          update: () => ({ eq: () => Promise.resolve({ error: null }) })
        }))
      } as unknown as ReturnType<typeof createSupabaseServiceRoleClient>);

      const sendMock = vi.fn().mockImplementation(() => {
        throw new Error("Resend connection failed");
      });

      vi.mocked(getEmailProvider).mockReturnValue({
        id: "resend",
        send: sendMock
      });

      const result = await sendTransactionalEmail({
        templateKey: "welcome",
        to: "samet@example.com",
        variables: { userName: "Samet" }
      });

      expect(result.ok).toBe(false);
      expect((result as { error?: string }).error).toContain("Resend connection failed");
      expect(captureError).toHaveBeenCalled();
    });
  });

  describe("sendTestEmail", () => {
    it("successfully initiates sendTransactionalEmail with dummy variables", async () => {
      const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const sendMock = vi.fn().mockResolvedValue({ ok: true, provider: "resend" });

      vi.mocked(getEmailProvider).mockReturnValue({
        id: "resend",
        send: sendMock
      });

      const supabaseMock = {
        from: vi.fn(() => ({
          insert: () => ({
            select: () => ({
              single: async () => ({ data: { id: "test-event-id" }, error: null })
            })
          }),
          update: () => ({
            eq: () => Promise.resolve({ error: null })
          }),
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: maybeSingleMock
              })
            })
          })
        }))
      };

      vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(supabaseMock as unknown as ReturnType<typeof createSupabaseServiceRoleClient>);

      const result = await sendTestEmail("test@example.com", "welcome");
      expect(result.ok).toBe(true);
    });
  });
});
