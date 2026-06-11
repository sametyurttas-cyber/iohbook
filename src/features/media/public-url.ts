import { STORAGE_BUCKETS } from "@/features/media/storage-config";

export function getPublicMediaUrlFromPath(path: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    return null;
  }

  const encodedPath = path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${url}/storage/v1/object/public/${STORAGE_BUCKETS.publicMedia}/${encodedPath}`;
}
