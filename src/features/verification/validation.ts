import type { SubmissionKind } from "@/types/database";
import {
  VERIFICATION_ALLOWED_BOOK_SLUGS,
  VERIFICATION_ALLOWED_MIME_TYPES,
  VERIFICATION_MAX_FILE_SIZE_BYTES,
  isAllowedBookSlug
} from "@/features/verification/config";

export type ValidationErrorCode =
  | "kind_required"
  | "title_required"
  | "body_required"
  | "book_slug_required"
  | "book_slug_invalid"
  | "amazon_order_id_required"
  | "amazon_review_url_required"
  | "amazon_review_url_invalid"
  | "attachment_required"
  | "attachment_mime_type_invalid"
  | "attachment_size_exceeded"
  | "attachment_filename_invalid";

export type ValidationError = {
  code: ValidationErrorCode;
  field: string;
  message: string;
};

export type SubmissionInput = {
  kind: SubmissionKind;
  title: string;
  body?: string;
  bookSlug?: string;
  amazonOrderId?: string;
  amazonReviewUrl?: string;
  amazonProfileName?: string;
};

export type AttachmentInput = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

const DANGEROUS_EXTENSIONS = [".exe", ".bat", ".cmd", ".sh", ".js", ".html", ".svg"];
const URL_PROTOCOLS = ["https:", "http:"];

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 128);
}

export function isAllowedMimeType(mimeType: string): boolean {
  return (VERIFICATION_ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function isSafeFileName(fileName: string): boolean {
  if (!fileName || fileName.length === 0 || fileName.length > 256) {
    return false;
  }

  const lower = fileName.toLowerCase();
  const hasDangerousExtension = DANGEROUS_EXTENSIONS.some((ext) => lower.endsWith(ext));

  if (hasDangerousExtension) {
    return false;
  }

  return !fileName.includes("..") && !fileName.includes("/") && !fileName.includes("\\");
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return URL_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function validateSubmission(input: SubmissionInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.kind) {
    errors.push({ code: "kind_required", field: "kind", message: "Talep turu zorunlu." });
    return errors;
  }

  if (!input.title || input.title.trim().length === 0) {
    errors.push({ code: "title_required", field: "title", message: "Baslik zorunlu." });
  }

  if (input.kind === "amazon_purchase") {
    if (!input.bookSlug) {
      errors.push({ code: "book_slug_required", field: "book_slug", message: "Kitap secimi zorunlu." });
    } else if (!isAllowedBookSlug(input.bookSlug)) {
      errors.push({ code: "book_slug_invalid", field: "book_slug", message: "Gecersiz kitap." });
    }

    if (!input.amazonOrderId || input.amazonOrderId.trim().length === 0) {
      errors.push({ code: "amazon_order_id_required", field: "amazon_order_id", message: "Amazon siparis numarasi zorunlu." });
    }
  }

  if (input.kind === "amazon_review") {
    if (!input.bookSlug) {
      errors.push({ code: "book_slug_required", field: "book_slug", message: "Kitap secimi zorunlu." });
    } else if (!isAllowedBookSlug(input.bookSlug)) {
      errors.push({ code: "book_slug_invalid", field: "book_slug", message: "Gecersiz kitap." });
    }

    if (!input.amazonReviewUrl || input.amazonReviewUrl.trim().length === 0) {
      errors.push({ code: "amazon_review_url_required", field: "amazon_review_url", message: "Amazon yorum linki zorunlu." });
    } else if (!isValidUrl(input.amazonReviewUrl)) {
      errors.push({ code: "amazon_review_url_invalid", field: "amazon_review_url", message: "Gecersiz URL formati." });
    }
  }

  if (input.kind === "general_message") {
    if (!input.body || input.body.trim().length === 0) {
      errors.push({ code: "body_required", field: "body", message: "Mesaj icerigi zorunlu." });
    }
  }

  return errors;
}

export function validateAttachment(input: AttachmentInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isSafeFileName(input.fileName)) {
    errors.push({
      code: "attachment_filename_invalid",
      field: "file_name",
      message: "Gecersiz veya guvenli olmayan dosya adi."
    });
  }

  if (!isAllowedMimeType(input.mimeType)) {
    errors.push({
      code: "attachment_mime_type_invalid",
      field: "mime_type",
      message: `Izin verilen tipler: ${VERIFICATION_ALLOWED_MIME_TYPES.join(", ")}`
    });
  }

  if (input.sizeBytes > VERIFICATION_MAX_FILE_SIZE_BYTES) {
    errors.push({
      code: "attachment_size_exceeded",
      field: "size_bytes",
      message: `Maksimum dosya boyutu ${VERIFICATION_MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`
    });
  }

  if (input.sizeBytes <= 0) {
    errors.push({
      code: "attachment_size_exceeded",
      field: "size_bytes",
      message: "Dosya bos olamaz."
    });
  }

  return errors;
}

export function requiresAttachment(kind: SubmissionKind): boolean {
  return kind === "amazon_purchase" || kind === "amazon_review";
}

export function getAllowedBookSlugs(): readonly string[] {
  return VERIFICATION_ALLOWED_BOOK_SLUGS;
}
