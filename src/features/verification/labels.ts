import type { SubmissionKind, SubmissionStatus } from "@/types/database";
import styles from "@/features/account/account-scene.module.css";

export const SUBMISSION_KIND_LABELS: Record<SubmissionKind, string> = {
  amazon_purchase: "Amazon Satın Alma",
  amazon_review: "Amazon Yorum",
  general_message: "Genel Mesaj"
};

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: "Beklemede",
  under_review: "İnceleniyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  responded: "Yanıtlandı",
  closed: "Kapandı"
};

export function statusBadgeClass(status: SubmissionStatus): string {
  if (status === "approved") return styles.badgeGold;
  if (status === "rejected") return styles.badgeRed;
  if (status === "responded") return styles.badgeBlue;
  if (status === "closed") return "";
  if (status === "under_review") return styles.badgeBlue;
  return "";
}

export function kindBadgeClass(kind: SubmissionKind): string {
  if (kind === "amazon_purchase") return styles.badgeGold;
  if (kind === "amazon_review") return styles.badgeBlue;
  return "";
}

export function canUserReply(status: SubmissionStatus): boolean {
  return status === "pending" || status === "under_review" || status === "responded";
}
