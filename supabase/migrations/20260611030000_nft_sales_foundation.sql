alter type public.product_type add value if not exists 'nft';

alter table public.nft_collections
  add column if not exists product_id uuid references public.products(id) on delete set null;

alter table public.nft_items
  add column if not exists product_id uuid references public.products(id) on delete set null,
  add column if not exists variant_id uuid references public.product_variants(id) on delete set null,
  add column if not exists fulfillment_status text not null default 'manual_pending';

create index if not exists nft_collections_product_id_idx
  on public.nft_collections(product_id);

create index if not exists nft_items_product_id_idx
  on public.nft_items(product_id);

create index if not exists nft_items_variant_id_idx
  on public.nft_items(variant_id);

comment on column public.nft_items.fulfillment_status is
  'Manual NFT delivery state. This does not mint automatically.';
