import { createHash } from "node:crypto";
import type { VerificationSubmission } from "@/types/database";

const REQUEST_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;

export function isValidVerificationRequestId(value: string) {
  return REQUEST_ID_PATTERN.test(value);
}

export function createVerificationRecordId(namespace: string, ...parts: string[]) {
  const hash = createHash("sha256").update([namespace, ...parts].join(":"))
    .digest("hex")
    .slice(0, 32)
    .split("");
  hash[12] = "5";
  hash[16] = ((Number.parseInt(hash[16], 16) & 0x3) | 0x8).toString(16);
  const value = hash.join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

function normalized(value: string | null) {
  return value?.trim().toLocaleLowerCase("tr-TR") ?? "";
}

function submissionFingerprint(submission: VerificationSubmission) {
  return JSON.stringify([
    submission.profile_id,
    submission.kind,
    submission.status,
    normalized(submission.book_slug),
    normalized(submission.amazon_order_id),
    normalized(submission.amazon_review_url),
    normalized(submission.title),
    normalized(submission.body)
  ]);
}

export function collapseDuplicateSubmissions<T extends VerificationSubmission>(submissions: T[]) {
  const latestByFingerprint = new Map<string, number>();

  return submissions.filter((submission) => {
    const fingerprint = submissionFingerprint(submission);
    const createdAt = Date.parse(submission.created_at);
    const latest = latestByFingerprint.get(fingerprint);

    if (
      latest !== undefined &&
      Number.isFinite(createdAt) &&
      Math.abs(latest - createdAt) <= DUPLICATE_WINDOW_MS
    ) {
      return false;
    }

    latestByFingerprint.set(fingerprint, createdAt);
    return true;
  });
}
