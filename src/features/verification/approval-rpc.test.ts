import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  resolve("supabase/migrations/20260621170000_verification_approval_hardening.sql"),
  "utf8"
);

describe("verification approval migration contract", () => {
  it("keeps authorization, point ledger, approval, reply and audit in one RPC", () => {
    expect(sql).toContain("role in ('owner', 'admin_ops')");
    expect(sql).toContain("insert into public.ioh_point_ledger");
    expect(sql).toContain("update public.verification_submissions");
    expect(sql).toContain("insert into public.submission_replies");
    expect(sql).toContain("'verification.approve'");
  });

  it("handles zero-point and rewarded approvals idempotently", () => {
    expect(sql).toContain("if v_submission.status = 'approved'");
    expect(sql).toContain("if v_submission.reward_amount = 0");
    expect(sql).toContain("v_submission.reward_ledger_id is not null");
    expect(sql).toContain("'already_approved'");
  });

  it("maps both database uniqueness boundaries to meaningful error codes", () => {
    expect(sql).toContain("verification_submissions_approved_unique_idx");
    expect(sql).toContain("'duplicate_book_reward'");
    expect(sql).toContain("verification_submissions_review_url_approved_unique_idx");
    expect(sql).toContain("'duplicate_review_url'");
  });
});
