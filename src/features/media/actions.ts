"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/features/auth/queries";
import {
  buildMediaStoragePath,
  isPublicImageMimeType,
  PUBLIC_MEDIA_MAX_BYTES,
  STORAGE_BUCKETS
} from "@/features/media/storage-config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { captureError, logInfo, logWarning } from "@/lib/observability";
import type { ProductMediaKind } from "@/types/database";

type UploadProductMediaResult =
  | {
      ok: true;
      mediaId: string;
      path: string;
      publicUrl: string | null;
    }
  | {
      ok: false;
      error: string;
    };

export async function uploadProductMedia(
  formData: FormData
): Promise<UploadProductMediaResult> {
  const staff = await requireStaff(["owner", "admin_ops", "editor"]);

  if (!staff) {
    logWarning("media.upload.rejected", {
      reason: "staff_required"
    });
    return { error: "Staff role required.", ok: false };
  }

  const file = formData.get("file");
  const productId = String(formData.get("product_id") ?? "").trim() || null;
  const variantId = String(formData.get("variant_id") ?? "").trim() || null;
  const kind = (String(formData.get("kind") ?? "gallery") || "gallery") as ProductMediaKind;
  const altText = String(formData.get("alt_text") ?? "").trim() || null;
  const bucket = String(formData.get("bucket") ?? STORAGE_BUCKETS.publicMedia);

  if (!(file instanceof File)) {
    logWarning("media.upload.rejected", {
      reason: "missing_file"
    });
    return { error: "File is required.", ok: false };
  }

  if (!productId && !variantId) {
    logWarning("media.upload.rejected", {
      reason: "missing_owner"
    });
    return { error: "product_id or variant_id is required for metadata.", ok: false };
  }

  if (bucket !== STORAGE_BUCKETS.publicMedia && bucket !== STORAGE_BUCKETS.adminUploads) {
    return { error: "Product media uploads must use public-media or admin-uploads.", ok: false };
  }

  if (!isPublicImageMimeType(file.type)) {
    logWarning("media.upload.rejected", {
      mime_type: file.type,
      reason: "invalid_mime"
    });
    return { error: "Only JPEG, PNG, WebP, and AVIF images are allowed.", ok: false };
  }

  if (file.size > PUBLIC_MEDIA_MAX_BYTES) {
    logWarning("media.upload.rejected", {
      file_size: file.size,
      reason: "file_too_large"
    });
    return { error: "Image must be 10MB or smaller.", ok: false };
  }

  const folder = kind === "cover" ? "covers" : kind === "banner" ? "banners" : "gallery";
  const ownerId = productId ?? variantId ?? undefined;
  const storagePath = buildMediaStoragePath({
    filename: file.name,
    folder,
    ownerId
  });

  const supabase = await createSupabaseServerClient();
  const upload = await supabase.storage.from(bucket).upload(storagePath, file, {
    cacheControl: bucket === STORAGE_BUCKETS.publicMedia ? "31536000" : "3600",
    contentType: file.type,
    upsert: false
  });

  if (upload.error) {
    captureError(upload.error, {
      bucket,
      operation: "media.storage_upload",
      product_id: productId,
      variant_id: variantId
    });
    return { error: upload.error.message, ok: false };
  }

  const insert = await supabase
    .from("product_media")
    .insert({
      alt_text: altText,
      kind,
      product_id: productId,
      storage_bucket: bucket,
      storage_path: storagePath,
      variant_id: variantId
    })
    .select("id, storage_bucket, storage_path")
    .single();

  if (insert.error) {
    await supabase.storage.from(bucket).remove([storagePath]);
    captureError(insert.error, {
      bucket,
      operation: "media.metadata_insert",
      product_id: productId,
      storage_path: storagePath,
      variant_id: variantId
    });
    return { error: insert.error.message, ok: false };
  }

  const publicUrl =
    bucket === STORAGE_BUCKETS.publicMedia
      ? supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl
      : null;

  logInfo("media.upload.succeeded", {
    bucket,
    media_id: insert.data.id,
    product_id: productId,
    storage_path: storagePath,
    variant_id: variantId
  });

  revalidatePath("/admin");
  revalidatePath("/books");

  return {
    mediaId: insert.data.id,
    ok: true,
    path: storagePath,
    publicUrl
  };
}
