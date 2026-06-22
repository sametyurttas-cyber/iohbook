import type { SubmissionKind } from "@/types/database";

export const VERIFICATION_ALLOWED_BOOK_SLUGS = [
  "godcode",
  "codewar",
  "sysgod"
] as const;

export type VerificationBookSlug = (typeof VERIFICATION_ALLOWED_BOOK_SLUGS)[number];

export const VERIFICATION_REWARDS: Record<
  SubmissionKind,
  { amount: number; reason: "amazon_purchase_verification" | "amazon_review_verification" | null }
> = {
  amazon_purchase: { amount: 30, reason: "amazon_purchase_verification" },
  amazon_review: { amount: 250, reason: "amazon_review_verification" },
  general_message: { amount: 0, reason: null }
} as const;

export const VERIFICATION_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"
] as const;

export const VERIFICATION_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const VERIFICATION_BUCKET = "verification-attachments";

export const VERIFICATION_LAUNCH_REVIEW_BONUS = {
  enabled: false,
  firstApprovedReviewsLimit: 100,
  bonusAmount: 1000
} as const;

export function isAllowedBookSlug(slug: string | null | undefined): slug is VerificationBookSlug {
  if (!slug) {
    return false;
  }

  return (VERIFICATION_ALLOWED_BOOK_SLUGS as readonly string[]).includes(slug);
}

export function getVerificationRewardConfig(kind: SubmissionKind) {
  return VERIFICATION_REWARDS[kind];
}
