import { createSupabaseServerClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS, type StorageBucket } from "@/features/media/storage-config";
import { requireStaff } from "@/features/auth/queries";
import type { StaffRole } from "@/types/database";

export async function getPublicMediaUrl(path: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = supabase.storage.from(STORAGE_BUCKETS.publicMedia).getPublicUrl(path);

  return data.publicUrl;
}

export async function createSignedStorageUrl(input: {
  bucket: Exclude<StorageBucket, "public-media">;
  path: string;
  expiresInSeconds?: number;
  allowedRoles?: StaffRole[];
}) {
  const staff = await requireStaff(input.allowedRoles ?? ["owner", "admin_ops"]);

  if (!staff) {
    throw new Error("Staff role required to create signed storage URLs.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(input.bucket)
    .createSignedUrl(input.path, input.expiresInSeconds ?? 60 * 5);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}
