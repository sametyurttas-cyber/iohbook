create type public.token_campaign_status as enum ('draft', 'active', 'paused', 'ended');
create type public.token_allocation_status as enum ('pending', 'approved', 'sent', 'cancelled', 'refunded');

create table public.token_sale_campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  token_symbol text not null,
  total_sale_limit numeric(36, 8) not null,
  per_user_limit numeric(36, 8),
  price_minor integer not null,
  currency text not null default 'USD',
  starts_at timestamptz,
  ends_at timestamptz,
  status public.token_campaign_status not null default 'draft',
  bonus_bps integer not null default 0,
  legal_approved_at timestamptz,
  sales_enabled boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint token_sale_campaigns_price_non_negative check (price_minor >= 0),
  constraint token_sale_campaigns_bonus_range check (bonus_bps >= 0 and bonus_bps <= 10000),
  constraint token_sale_campaigns_sales_need_approval check (
    sales_enabled = false or legal_approved_at is not null
  )
);

create table public.token_sale_packages (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.token_sale_campaigns(id) on delete cascade,
  title text not null,
  token_amount numeric(36, 8) not null,
  price_minor integer not null,
  currency text not null default 'USD',
  max_quantity_per_order integer,
  sort_order integer not null default 0,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint token_sale_packages_amount_positive check (token_amount > 0),
  constraint token_sale_packages_price_non_negative check (price_minor >= 0)
);

create table public.token_allocations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.token_sale_campaigns(id) on delete restrict,
  package_id uuid references public.token_sale_packages(id) on delete set null,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  payment_attempt_id uuid references public.payment_attempts(id) on delete set null,
  wallet_id uuid references public.user_wallets(id) on delete set null,
  wallet_address text not null,
  normalized_address text not null,
  token_symbol text not null,
  token_amount numeric(36, 8) not null,
  bonus_amount numeric(36, 8) not null default 0,
  total_amount numeric(36, 8) not null,
  unit_price_minor integer not null,
  total_price_minor integer not null,
  currency text not null,
  status public.token_allocation_status not null default 'pending',
  manual_transfer_tx_hash text,
  sent_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint token_allocations_amount_positive check (token_amount > 0),
  constraint token_allocations_total_amount_positive check (total_amount > 0)
);

create index token_sale_campaigns_status_idx on public.token_sale_campaigns(status);
create index token_sale_campaigns_sales_enabled_idx on public.token_sale_campaigns(sales_enabled);
create index token_sale_packages_campaign_id_idx on public.token_sale_packages(campaign_id);
create index token_allocations_campaign_id_idx on public.token_allocations(campaign_id);
create index token_allocations_profile_id_idx on public.token_allocations(profile_id);
create index token_allocations_order_id_idx on public.token_allocations(order_id);
create index token_allocations_status_idx on public.token_allocations(status);
create index token_allocations_normalized_address_idx on public.token_allocations(normalized_address);

create trigger token_sale_campaigns_set_updated_at
  before update on public.token_sale_campaigns
  for each row execute function public.set_updated_at();

create trigger token_sale_packages_set_updated_at
  before update on public.token_sale_packages
  for each row execute function public.set_updated_at();

create trigger token_allocations_set_updated_at
  before update on public.token_allocations
  for each row execute function public.set_updated_at();

alter table public.token_sale_campaigns enable row level security;
alter table public.token_sale_packages enable row level security;
alter table public.token_allocations enable row level security;

create policy token_sale_campaigns_public_active
  on public.token_sale_campaigns for select
  using (status = 'active' and sales_enabled = true);

create policy token_sale_campaigns_staff_manage
  on public.token_sale_campaigns for all
  using (public.is_staff(array['owner','admin_ops']::public.staff_role[]))
  with check (public.is_staff(array['owner','admin_ops']::public.staff_role[]));

create policy token_sale_packages_public_active
  on public.token_sale_packages for select
  using (
    active = true
    and exists (
      select 1 from public.token_sale_campaigns
      where token_sale_campaigns.id = token_sale_packages.campaign_id
      and token_sale_campaigns.status = 'active'
      and token_sale_campaigns.sales_enabled = true
    )
  );

create policy token_sale_packages_staff_manage
  on public.token_sale_packages for all
  using (public.is_staff(array['owner','admin_ops']::public.staff_role[]))
  with check (public.is_staff(array['owner','admin_ops']::public.staff_role[]));

create policy token_allocations_select_own
  on public.token_allocations for select
  using (profile_id = auth.uid());

create policy token_allocations_staff_manage
  on public.token_allocations for all
  using (public.is_staff(array['owner','admin_ops']::public.staff_role[]))
  with check (public.is_staff(array['owner','admin_ops']::public.staff_role[]));

comment on table public.token_sale_campaigns is
  'Token sale campaign configuration. sales_enabled requires legal_approved_at.';
comment on table public.token_allocations is
  'Manual token allocations after fiat payment verification. No automatic token transfer is performed.';
