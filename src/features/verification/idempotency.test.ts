import { describe, expect, it } from "vitest";
import {
  collapseDuplicateSubmissions,
  createVerificationRecordId,
  isValidVerificationRequestId
} from "@/features/verification/idempotency";
import type { VerificationSubmission } from "@/types/database";

function submission(overrides: Partial<VerificationSubmission>): VerificationSubmission {
  return {
    admin_notes: null,
    amazon_order_id: null,
    amazon_profile_name: null,
    amazon_review_url: null,
    body: "Ayni mesaj",
    book_slug: "godcode",
    created_at: "2026-06-22T10:00:00.000Z",
    id: "submission-1",
    kind: "amazon_purchase",
    profile_id: "profile-1",
    rejection_reason: null,
    reward_amount: 0,
    reward_ledger_id: null,
    reward_reason: null,
    rewarded_at: null,
    reviewed_at: null,
    reviewed_by: null,
    status: "pending",
    title: "GODCODE dogrulamasi",
    updated_at: "2026-06-22T10:00:00.000Z",
    ...overrides
  };
}

describe("verification request idempotency", () => {
  it("derives the same UUID for a retried request", () => {
    const first = createVerificationRecordId("submission", "profile-1", "request-1");
    const second = createVerificationRecordId("submission", "profile-1", "request-1");

    expect(first).toBe(second);
    expect(isValidVerificationRequestId(first)).toBe(true);
  });

  it("collapses identical submissions created within two minutes", () => {
    const rows = [
      submission({ id: "latest", created_at: "2026-06-22T10:01:00.000Z" }),
      submission({ id: "middle", created_at: "2026-06-22T10:00:30.000Z" }),
      submission({ id: "first", created_at: "2026-06-22T10:00:00.000Z" })
    ];

    expect(collapseDuplicateSubmissions(rows).map((row) => row.id)).toEqual(["latest"]);
  });

  it("keeps distinct kinds, content and later submissions", () => {
    const rows = [
      submission({ id: "purchase" }),
      submission({ id: "review", kind: "amazon_review" }),
      submission({ id: "different", body: "Baska mesaj" }),
      submission({ id: "later", created_at: "2026-06-22T10:05:00.000Z" })
    ];

    expect(collapseDuplicateSubmissions(rows)).toHaveLength(4);
  });
});
