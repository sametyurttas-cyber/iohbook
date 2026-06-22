import { describe, expect, it } from "vitest";
import {
  isAllowedMimeType,
  isSafeFileName,
  requiresAttachment,
  validateAttachment,
  validateSubmission
} from "@/features/verification/validation";

describe("verification submission validation", () => {
  it("validates purchase, review and general message requirements", () => {
    expect(validateSubmission({ kind: "amazon_purchase", title: "Purchase" })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "book_slug_required" }),
        expect.objectContaining({ code: "amazon_order_id_required" })
      ])
    );
    expect(validateSubmission({ kind: "amazon_review", title: "Review" })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "book_slug_required" }),
        expect.objectContaining({ code: "amazon_review_url_required" })
      ])
    );
    expect(validateSubmission({ kind: "general_message", title: "Help" })).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "body_required" })])
    );
  });

  it("requires evidence for Amazon verification kinds only", () => {
    expect(requiresAttachment("amazon_purchase")).toBe(true);
    expect(requiresAttachment("amazon_review")).toBe(true);
    expect(requiresAttachment("general_message")).toBe(false);
  });

  it("accepts configured media under 10MB and rejects executable names", () => {
    expect(isAllowedMimeType("application/pdf")).toBe(true);
    expect(isSafeFileName("evidence.exe")).toBe(false);
    expect(validateAttachment({
      fileName: "evidence.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1024
    })).toEqual([]);
    expect(validateAttachment({
      fileName: "evidence.exe",
      mimeType: "application/octet-stream",
      sizeBytes: 11 * 1024 * 1024
    })).toHaveLength(3);
  });
});
