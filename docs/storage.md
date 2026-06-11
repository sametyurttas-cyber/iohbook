# Supabase Storage

## Buckets

| Bucket | Public | Purpose |
|---|---:|---|
| `public-media` | yes | Storefront covers, gallery images, banners, public campaign media |
| `admin-uploads` | no | Private admin working files and unpublished media |
| `private-exports` | no | CSV/PDF/JSON/ZIP operational exports |
| `digital-deliveries` | no | Future ebook and private digital delivery source files |

Bucket creation and storage RLS policies live in:

```text
supabase/migrations/20260610161000_storage_buckets_policies.sql
```

## Public Media Upload Flow

1. Staff user opens `/admin/media`.
2. Staff selects an image file.
3. Server action validates:
   - active staff role: `owner`, `admin_ops`, or `editor`
   - bucket: `public-media` or `admin-uploads`
   - MIME: JPEG, PNG, WebP, or AVIF
   - max size: 10 MB
   - metadata owner: `product_id` or `variant_id`
4. File is uploaded to Supabase Storage with a stable path:
   - `covers/{productId}/YYYY/MM/{uuid}-{filename}`
   - `gallery/{productId}/YYYY/MM/{uuid}-{filename}`
   - `banners/{productId}/YYYY/MM/{uuid}-{filename}`
5. A `product_media` metadata row is inserted.
6. If metadata insert fails, the uploaded object is removed to avoid orphan files.

## URL Rules

- `public-media` uses public URLs through `getPublicMediaUrl`.
- Private buckets use signed URLs through `createSignedStorageUrl`.
- Signed URL creation requires a staff role by default.
- Future customer digital downloads should use a separate entitlement-aware helper.

## Smoke Test

After Supabase env values are configured and migrations are applied:

1. Create or sign in as a user.
2. Grant that user an active staff role, preferably `owner`, using Supabase SQL editor.
3. Create a test product row.
4. Visit `/admin/media`.
5. Upload a small WebP, PNG, AVIF, or JPEG cover image with the test `product_id`.
6. Confirm:
   - the object exists under `public-media`
   - a `product_media` row exists
   - the returned public URL renders the image
   - non-staff users cannot upload to the bucket

This repository cannot run the live upload smoke test without a configured Supabase project and local Node/package-manager access.
