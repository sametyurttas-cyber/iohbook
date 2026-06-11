export const STORAGE_BUCKETS = {
  publicMedia: "public-media",
  privateExports: "private-exports",
  digitalDeliveries: "digital-deliveries",
  adminUploads: "admin-uploads"
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif"
] as const;

export const ADMIN_UPLOAD_MIME_TYPES = [
  ...IMAGE_MIME_TYPES,
  "application/pdf"
] as const;

export const PUBLIC_MEDIA_MAX_BYTES = 10 * 1024 * 1024;

export function isPublicImageMimeType(type: string) {
  return IMAGE_MIME_TYPES.includes(type as (typeof IMAGE_MIME_TYPES)[number]);
}

export function sanitizeFilename(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();
  const basename = filename
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return [basename || "media", extension].filter(Boolean).join(".");
}

export function buildMediaStoragePath(input: {
  filename: string;
  folder: "covers" | "gallery" | "banners" | "admin";
  ownerId?: string;
}) {
  const date = new Date();
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const safeName = sanitizeFilename(input.filename);
  const prefix = input.ownerId ? `${input.folder}/${input.ownerId}` : input.folder;
  const unique = crypto.randomUUID();

  return `${prefix}/${yyyy}/${mm}/${unique}-${safeName}`;
}
