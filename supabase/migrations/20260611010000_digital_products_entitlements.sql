alter table public.product_variants
  add column if not exists digital_delivery_bucket text,
  add column if not exists digital_delivery_path text,
  add column if not exists digital_download_limit integer,
  add column if not exists digital_access_starts_at timestamptz,
  add column if not exists digital_access_expires_at timestamptz;

alter table public.product_variants
  add constraint product_variants_digital_delivery_limit_valid
  check (digital_download_limit is null or digital_download_limit >= 0);

create index if not exists product_variants_digital_delivery_idx
  on public.product_variants(fulfillment_type, digital_delivery_bucket, digital_delivery_path)
  where fulfillment_type in ('digital', 'hybrid');

create unique index if not exists entitlements_unique_order_item_variant_idx
  on public.entitlements(order_item_id, variant_id)
  where order_item_id is not null and variant_id is not null;

comment on column public.product_variants.digital_delivery_bucket is
  'Private storage bucket for digital delivery source files. Usually digital-deliveries.';
comment on column public.product_variants.digital_delivery_path is
  'Private storage path for the deliverable file used to create customer entitlements.';
comment on column public.product_variants.digital_download_limit is
  'Optional customer download limit copied to entitlements after successful payment.';
comment on column public.product_variants.digital_access_starts_at is
  'Optional future access start time copied to entitlements.';
comment on column public.product_variants.digital_access_expires_at is
  'Optional access expiry copied to entitlements.';
