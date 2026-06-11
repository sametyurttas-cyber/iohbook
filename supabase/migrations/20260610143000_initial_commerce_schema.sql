create extension if not exists pgcrypto;

create type public.staff_role as enum ('owner', 'admin_ops', 'editor', 'fulfillment');
create type public.address_type as enum ('shipping', 'billing');
create type public.content_page_status as enum ('draft', 'published', 'archived');
create type public.collection_kind as enum ('series', 'campaign', 'theme', 'universe');
create type public.product_status as enum ('draft', 'active', 'archived');
create type public.product_type as enum ('book', 'bundle', 'digital', 'claimable');
create type public.variant_format as enum ('standard', 'signed', 'limited', 'boxed', 'preorder', 'ebook', 'claimable');
create type public.fulfillment_type as enum ('physical', 'digital', 'claimable', 'hybrid');
create type public.stock_policy as enum ('track', 'continue', 'deny', 'unlimited');
create type public.media_kind as enum ('cover', 'gallery', 'banner', 'download_preview', 'certificate');
create type public.cart_status as enum ('active', 'converted', 'abandoned');
create type public.order_status as enum ('draft', 'pending_payment', 'paid', 'fulfillment', 'completed', 'cancelled', 'refunded');
create type public.payment_status as enum ('initiated', 'pending', 'authorized', 'paid', 'failed', 'cancelled', 'refunded');
create type public.shipment_status as enum ('pending', 'preparing', 'shipped', 'delivered', 'returned', 'cancelled');
create type public.discount_type as enum ('percent', 'fixed_amount', 'free_shipping');
create type public.discount_status as enum ('draft', 'active', 'paused', 'expired', 'archived');
create type public.entitlement_status as enum ('pending', 'active', 'revoked', 'expired');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  locale text not null default 'tr',
  marketing_email_opt_in boolean not null default false,
  marketing_sms_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff_roles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.staff_role not null,
  granted_by uuid references public.profiles(id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  type public.address_type not null,
  full_name text not null,
  phone text,
  country_code char(2) not null default 'TR',
  city text not null,
  district text,
  postal_code text,
  line1 text not null,
  line2 text,
  company_name text,
  tax_no text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  status public.content_page_status not null default 'draft',
  excerpt text,
  body jsonb not null default '{}'::jsonb,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  kind public.collection_kind not null default 'series',
  description text,
  accent_color text,
  sort_order integer not null default 0,
  status public.content_page_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references public.collections(id) on delete set null,
  slug text not null unique,
  title text not null,
  subtitle text,
  type public.product_type not null default 'book',
  status public.product_status not null default 'draft',
  description text,
  short_description text,
  seo_title text,
  seo_description text,
  requires_shipping boolean not null default true,
  is_digital boolean not null default false,
  is_claimable boolean not null default false,
  is_limited boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_fulfillment_flags check (
    (type = 'digital' and is_digital = true)
    or (type = 'claimable' and is_claimable = true)
    or type in ('book', 'bundle')
  )
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  title text not null,
  edition_label text,
  format public.variant_format not null default 'standard',
  fulfillment_type public.fulfillment_type not null default 'physical',
  price_minor integer not null,
  compare_at_minor integer,
  currency char(3) not null default 'TRY',
  weight_grams integer,
  stock_policy public.stock_policy not null default 'track',
  lead_time_days integer not null default 0,
  max_per_order integer,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_price_non_negative check (price_minor >= 0),
  constraint product_variants_compare_non_negative check (compare_at_minor is null or compare_at_minor >= 0),
  constraint product_variants_max_per_order_positive check (max_per_order is null or max_per_order > 0)
);

create table public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  kind public.media_kind not null default 'gallery',
  storage_bucket text not null default 'public-media',
  storage_path text not null,
  alt_text text,
  width integer,
  height integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_media_owner_required check (product_id is not null or variant_id is not null)
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null unique references public.product_variants(id) on delete cascade,
  on_hand integer not null default 0,
  reserved integer not null default 0,
  safety_stock integer not null default 0,
  warehouse_location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_counts_non_negative check (on_hand >= 0 and reserved >= 0 and safety_stock >= 0),
  constraint inventory_reserved_not_above_on_hand check (reserved <= on_hand)
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  anonymous_id text,
  status public.cart_status not null default 'active',
  currency char(3) not null default 'TRY',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint carts_owner_required check (profile_id is not null or anonymous_id is not null)
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity integer not null,
  unit_price_minor integer not null,
  currency char(3) not null default 'TRY',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_items_quantity_positive check (quantity > 0),
  constraint cart_items_price_non_negative check (unit_price_minor >= 0),
  constraint cart_items_unique_variant unique (cart_id, variant_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  profile_id uuid references public.profiles(id) on delete set null,
  cart_id uuid references public.carts(id) on delete set null,
  status public.order_status not null default 'draft',
  currency char(3) not null default 'TRY',
  subtotal_minor integer not null default 0,
  discount_minor integer not null default 0,
  shipping_minor integer not null default 0,
  tax_minor integer not null default 0,
  total_minor integer not null default 0,
  customer_email text not null,
  customer_name text,
  shipping_address jsonb,
  billing_address jsonb,
  legal_acceptance jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_amounts_non_negative check (
    subtotal_minor >= 0
    and discount_minor >= 0
    and shipping_minor >= 0
    and tax_minor >= 0
    and total_minor >= 0
  )
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_snapshot jsonb not null,
  variant_snapshot jsonb not null,
  quantity integer not null,
  unit_price_minor integer not null,
  total_minor integer not null,
  fulfillment_type public.fulfillment_type not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_amounts_non_negative check (unit_price_minor >= 0 and total_minor >= 0)
);

create table public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'iyzico',
  provider_token text,
  provider_transaction_id text,
  status public.payment_status not null default 'initiated',
  amount_minor integer not null,
  currency char(3) not null default 'TRY',
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb not null default '{}'::jsonb,
  failure_code text,
  failure_message text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_attempts_amount_non_negative check (amount_minor >= 0)
);

create table public.fulfillment_shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text,
  tracking_number text,
  tracking_url text,
  status public.shipment_status not null default 'pending',
  shipped_at timestamptz,
  delivered_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.discount_rules (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  title text not null,
  type public.discount_type not null,
  status public.discount_status not null default 'draft',
  value_minor integer,
  percent_off numeric(5,2),
  currency char(3) not null default 'TRY',
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer,
  per_customer_limit integer,
  minimum_order_minor integer,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint discount_rules_value_valid check (
    (type = 'percent' and percent_off is not null and percent_off > 0 and percent_off <= 100)
    or (type in ('fixed_amount', 'free_shipping') and (value_minor is null or value_minor >= 0))
  ),
  constraint discount_rules_limits_positive check (
    (usage_limit is null or usage_limit > 0)
    and (per_customer_limit is null or per_customer_limit > 0)
    and (minimum_order_minor is null or minimum_order_minor >= 0)
  )
);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  kind public.fulfillment_type not null,
  status public.entitlement_status not null default 'pending',
  storage_bucket text,
  storage_path text,
  claim_reference text,
  download_limit integer,
  download_count integer not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint entitlements_download_counts_valid check (
    download_count >= 0 and (download_limit is null or download_limit >= 0)
  )
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index staff_roles_profile_id_idx on public.staff_roles(profile_id);
create index staff_roles_role_idx on public.staff_roles(role);
create unique index staff_roles_unique_active_idx
  on public.staff_roles(profile_id, role)
  where revoked_at is null;

create index addresses_profile_id_idx on public.addresses(profile_id);
create index addresses_type_idx on public.addresses(type);

create index content_pages_status_idx on public.content_pages(status);
create index content_pages_published_at_idx on public.content_pages(published_at);

create index collections_kind_idx on public.collections(kind);
create index collections_status_idx on public.collections(status);
create index collections_sort_order_idx on public.collections(sort_order);

create index products_collection_id_idx on public.products(collection_id);
create index products_status_idx on public.products(status);
create index products_type_idx on public.products(type);
create index products_published_at_idx on public.products(published_at);

create index product_variants_product_id_idx on public.product_variants(product_id);
create index product_variants_format_idx on public.product_variants(format);
create index product_variants_fulfillment_type_idx on public.product_variants(fulfillment_type);
create index product_variants_active_idx on public.product_variants(active);

create index product_media_product_id_idx on public.product_media(product_id);
create index product_media_variant_id_idx on public.product_media(variant_id);
create index product_media_kind_idx on public.product_media(kind);

create index inventory_items_variant_id_idx on public.inventory_items(variant_id);

create index carts_profile_id_idx on public.carts(profile_id);
create index carts_anonymous_id_idx on public.carts(anonymous_id);
create index carts_status_idx on public.carts(status);
create index carts_expires_at_idx on public.carts(expires_at);

create index cart_items_cart_id_idx on public.cart_items(cart_id);
create index cart_items_variant_id_idx on public.cart_items(variant_id);

create index orders_profile_id_idx on public.orders(profile_id);
create index orders_cart_id_idx on public.orders(cart_id);
create index orders_status_idx on public.orders(status);
create index orders_customer_email_idx on public.orders(customer_email);
create index orders_created_at_idx on public.orders(created_at desc);

create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_variant_id_idx on public.order_items(variant_id);
create index order_items_fulfillment_type_idx on public.order_items(fulfillment_type);

create index payment_attempts_order_id_idx on public.payment_attempts(order_id);
create unique index payment_attempts_provider_transaction_unique_idx
  on public.payment_attempts(provider, provider_transaction_id)
  where provider_transaction_id is not null;
create index payment_attempts_provider_token_idx on public.payment_attempts(provider_token);
create index payment_attempts_status_idx on public.payment_attempts(status);

create index fulfillment_shipments_order_id_idx on public.fulfillment_shipments(order_id);
create index fulfillment_shipments_status_idx on public.fulfillment_shipments(status);
create index fulfillment_shipments_tracking_number_idx on public.fulfillment_shipments(tracking_number);

create index discount_rules_code_idx on public.discount_rules(code);
create index discount_rules_status_idx on public.discount_rules(status);
create index discount_rules_window_idx on public.discount_rules(starts_at, ends_at);

create index entitlements_profile_id_idx on public.entitlements(profile_id);
create index entitlements_order_item_id_idx on public.entitlements(order_item_id);
create index entitlements_variant_id_idx on public.entitlements(variant_id);
create index entitlements_status_idx on public.entitlements(status);
create index entitlements_claim_reference_idx on public.entitlements(claim_reference);

create index audit_logs_actor_profile_id_idx on public.audit_logs(actor_profile_id);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);
create index audit_logs_action_idx on public.audit_logs(action);
create index audit_logs_created_at_idx on public.audit_logs(created_at desc);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger staff_roles_set_updated_at
  before update on public.staff_roles
  for each row execute function public.set_updated_at();

create trigger addresses_set_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

create trigger content_pages_set_updated_at
  before update on public.content_pages
  for each row execute function public.set_updated_at();

create trigger collections_set_updated_at
  before update on public.collections
  for each row execute function public.set_updated_at();

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

create trigger product_media_set_updated_at
  before update on public.product_media
  for each row execute function public.set_updated_at();

create trigger inventory_items_set_updated_at
  before update on public.inventory_items
  for each row execute function public.set_updated_at();

create trigger carts_set_updated_at
  before update on public.carts
  for each row execute function public.set_updated_at();

create trigger cart_items_set_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger order_items_set_updated_at
  before update on public.order_items
  for each row execute function public.set_updated_at();

create trigger payment_attempts_set_updated_at
  before update on public.payment_attempts
  for each row execute function public.set_updated_at();

create trigger fulfillment_shipments_set_updated_at
  before update on public.fulfillment_shipments
  for each row execute function public.set_updated_at();

create trigger discount_rules_set_updated_at
  before update on public.discount_rules
  for each row execute function public.set_updated_at();

create trigger entitlements_set_updated_at
  before update on public.entitlements
  for each row execute function public.set_updated_at();
