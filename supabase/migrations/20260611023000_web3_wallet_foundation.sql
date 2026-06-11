create table public.web3_networks (
  chain_id integer primary key,
  slug text not null unique,
  display_name text not null,
  rpc_url_env_key text,
  block_explorer_url text,
  native_currency_symbol text not null default 'ETH',
  enabled boolean not null default false,
  supports_nft_claim boolean not null default false,
  supports_nft_sales boolean not null default false,
  supports_token_distribution boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint web3_networks_no_live_features_by_default check (
    supports_nft_claim = false
    and supports_nft_sales = false
    and supports_token_distribution = false
  )
);

insert into public.web3_networks (
  chain_id,
  slug,
  display_name,
  block_explorer_url,
  native_currency_symbol,
  enabled,
  metadata
) values
  (1, 'ethereum-mainnet', 'Ethereum Mainnet', 'https://etherscan.io', 'ETH', false, '{"purpose":"future-production-review"}'::jsonb),
  (11155111, 'ethereum-sepolia', 'Ethereum Sepolia', 'https://sepolia.etherscan.io', 'ETH', true, '{"purpose":"testnet-wallet-verification"}'::jsonb),
  (137, 'polygon-mainnet', 'Polygon Mainnet', 'https://polygonscan.com', 'MATIC', false, '{"purpose":"future-nft-claim-review"}'::jsonb)
on conflict (chain_id) do nothing;

create table public.user_wallets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  provider public.wallet_provider not null,
  chain_id integer references public.web3_networks(chain_id) on delete set null,
  wallet_address text not null,
  normalized_address text not null,
  label text,
  is_primary boolean not null default false,
  first_verified_wallet_link_id uuid references public.wallet_links(id) on delete set null,
  last_verified_wallet_link_id uuid references public.wallet_links(id) on delete set null,
  verified_at timestamptz not null default now(),
  last_seen_at timestamptz,
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_wallets_address_lowercase check (normalized_address = lower(normalized_address)),
  constraint user_wallets_no_live_feature_grant check (
    coalesce(metadata->>'claim_enabled', 'false') = 'false'
    and coalesce(metadata->>'sale_enabled', 'false') = 'false'
    and coalesce(metadata->>'token_distribution_enabled', 'false') = 'false'
  )
);

create unique index user_wallets_one_active_owner_per_address_idx
  on public.user_wallets(normalized_address)
  where revoked_at is null;

create unique index user_wallets_one_active_address_per_profile_idx
  on public.user_wallets(profile_id, normalized_address)
  where revoked_at is null;

create unique index user_wallets_one_primary_per_profile_idx
  on public.user_wallets(profile_id)
  where is_primary = true and revoked_at is null;

create index user_wallets_profile_id_idx on public.user_wallets(profile_id);
create index user_wallets_chain_id_idx on public.user_wallets(chain_id);

alter table public.wallet_links
  add column if not exists expires_at timestamptz,
  add column if not exists user_wallet_id uuid references public.user_wallets(id) on delete set null;

create index wallet_links_expires_at_idx on public.wallet_links(expires_at);
create index wallet_links_user_wallet_id_idx on public.wallet_links(user_wallet_id);

create trigger web3_networks_set_updated_at
  before update on public.web3_networks
  for each row execute function public.set_updated_at();

create trigger user_wallets_set_updated_at
  before update on public.user_wallets
  for each row execute function public.set_updated_at();

alter table public.web3_networks enable row level security;
alter table public.user_wallets enable row level security;

create policy web3_networks_public_read_enabled
  on public.web3_networks for select
  using (enabled = true);

create policy web3_networks_staff_manage
  on public.web3_networks for all
  using (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]))
  with check (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]));

create policy wallet_links_insert_own
  on public.wallet_links for insert
  with check (profile_id = auth.uid());

create policy wallet_links_update_own_pending
  on public.wallet_links for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy user_wallets_select_own
  on public.user_wallets for select
  using (profile_id = auth.uid());

create policy user_wallets_insert_own
  on public.user_wallets for insert
  with check (profile_id = auth.uid());

create policy user_wallets_update_own
  on public.user_wallets for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy user_wallets_staff_manage
  on public.user_wallets for all
  using (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]))
  with check (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]));

comment on table public.web3_networks is
  'Web3 chain configuration. Live claim, sale, and token distribution switches are locked off in this foundation phase.';
comment on table public.user_wallets is
  'Verified wallet ownership records for customer identity. These records do not authorize minting, sales, transfers, or token distribution.';
comment on column public.wallet_links.expires_at is
  'Expiry for one-time wallet verification messages.';
