with digital_book_variants as (
  select *
  from (
    values
      ('godcode', 'IOH-GODCODE-PDF', 'PDF', 45000, 'ebooks/godcode.pdf', 0),
      ('sysgod', 'IOH-SYSGOD-PDF', 'PDF', 65000, 'ebooks/sysgod.pdf', 1),
      ('codewar', 'IOH-CODEWAR-PDF', 'PDF', 90000, 'ebooks/codewar.pdf', 2)
  ) as seed(slug, sku, title, price_minor, digital_delivery_path, sort_order)
)
insert into public.product_variants (
  product_id,
  sku,
  title,
  format,
  fulfillment_type,
  price_minor,
  currency,
  stock_policy,
  lead_time_days,
  max_per_order,
  sort_order,
  digital_delivery_bucket,
  digital_delivery_path,
  digital_download_limit,
  active,
  metadata
)
select
  p.id,
  seed.sku,
  seed.title,
  'digital_pdf'::public.variant_format,
  'digital'::public.fulfillment_type,
  seed.price_minor,
  'TRY',
  'unlimited'::public.stock_policy,
  0,
  3,
  seed.sort_order,
  'digital-deliveries',
  seed.digital_delivery_path,
  5,
  true,
  jsonb_build_object('mvp_delivery', 'private_signed_url')
from digital_book_variants seed
join public.products p on p.slug = seed.slug
where p.type = 'book'
on conflict (sku) do update
set
  active = true,
  digital_delivery_bucket = excluded.digital_delivery_bucket,
  digital_delivery_path = excluded.digital_delivery_path,
  digital_download_limit = excluded.digital_download_limit,
  format = excluded.format,
  fulfillment_type = excluded.fulfillment_type,
  lead_time_days = 0,
  max_per_order = excluded.max_per_order,
  metadata = public.product_variants.metadata || excluded.metadata,
  price_minor = excluded.price_minor,
  stock_policy = excluded.stock_policy,
  title = excluded.title,
  updated_at = now();
