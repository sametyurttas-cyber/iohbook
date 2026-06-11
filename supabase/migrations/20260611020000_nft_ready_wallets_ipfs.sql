create type public.wallet_provider as enum ('metamask', 'walletconnect');
create type public.wallet_link_status as enum ('pending', 'verified', 'revoked');
create type public.claim_reservation_status as enum ('reserved', 'claimed', 'expired', 'revoked');

create table public.wallet_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  provider public.wallet_provider not null,
  chain_id integer,
  wallet_address text not null,
  normalized_address text not null,
  nonce text not null,
  message text not null,
  signature text,
  status public.wallet_link_status not null default 'pending',
  verified_at timestamptz,
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wallet_links_address_lowercase check (normalized_address = lower(normalized_address))
);

create unique index wallet_links_profile_active_address_idx
  on public.wallet_links(profile_id, normalized_address)
  where revoked_at is null;

create index wallet_links_profile_id_idx on public.wallet_links(profile_id);
create index wallet_links_status_idx on public.wallet_links(status);
create index wallet_links_normalized_address_idx on public.wallet_links(normalized_address);

create table public.nft_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  chain_id integer,
  contract_address text,
  contract_standard text not null default 'ERC721',
  status public.content_page_status not null default 'draft',
  cover_bucket text,
  cover_path text,
  ipfs_metadata_cid text,
  pinata_group_id text,
  mint_enabled boolean not null default false,
  legal_approved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nft_collections_no_mint_without_legal check (
    mint_enabled = false or legal_approved_at is not null
  )
);

create table public.nft_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.nft_collections(id) on delete cascade,
  token_id text,
  title text not null,
  description text,
  image_bucket text,
  image_path text,
  image_ipfs_uri text,
  metadata_ipfs_uri text,
  attributes jsonb not null default '[]'::jsonb,
  status public.content_page_status not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index nft_items_collection_id_idx on public.nft_items(collection_id);
create index nft_items_status_idx on public.nft_items(status);

create table public.claim_reservations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  wallet_link_id uuid references public.wallet_links(id) on delete set null,
  collection_id uuid references public.nft_collections(id) on delete cascade,
  nft_item_id uuid references public.nft_items(id) on delete set null,
  wallet_address text,
  normalized_address text,
  status public.claim_reservation_status not null default 'reserved',
  allowlist_reason text,
  reserved_at timestamptz not null default now(),
  claim_opens_at timestamptz,
  expires_at timestamptz,
  claimed_at timestamptz,
  claim_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index claim_reservations_profile_id_idx on public.claim_reservations(profile_id);
create index claim_reservations_collection_id_idx on public.claim_reservations(collection_id);
create index claim_reservations_status_idx on public.claim_reservations(status);
create index claim_reservations_normalized_address_idx on public.claim_reservations(normalized_address);

create trigger wallet_links_set_updated_at
  before update on public.wallet_links
  for each row execute function public.set_updated_at();

create trigger nft_collections_set_updated_at
  before update on public.nft_collections
  for each row execute function public.set_updated_at();

create trigger nft_items_set_updated_at
  before update on public.nft_items
  for each row execute function public.set_updated_at();

create trigger claim_reservations_set_updated_at
  before update on public.claim_reservations
  for each row execute function public.set_updated_at();

alter table public.wallet_links enable row level security;
alter table public.nft_collections enable row level security;
alter table public.nft_items enable row level security;
alter table public.claim_reservations enable row level security;

create policy wallet_links_select_own
  on public.wallet_links for select
  using (profile_id = auth.uid());

create policy wallet_links_staff_manage
  on public.wallet_links for all
  using (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]))
  with check (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]));

create policy nft_collections_public_read_published
  on public.nft_collections for select
  using (status = 'published');

create policy nft_collections_staff_manage
  on public.nft_collections for all
  using (public.is_staff(array['owner', 'admin_ops', 'editor']::public.staff_role[]))
  with check (public.is_staff(array['owner', 'admin_ops', 'editor']::public.staff_role[]));

create policy nft_items_public_read_published
  on public.nft_items for select
  using (
    status = 'published'
    and exists (
      select 1 from public.nft_collections
      where nft_collections.id = nft_items.collection_id
      and nft_collections.status = 'published'
    )
  );

create policy nft_items_staff_manage
  on public.nft_items for all
  using (public.is_staff(array['owner', 'admin_ops', 'editor']::public.staff_role[]))
  with check (public.is_staff(array['owner', 'admin_ops', 'editor']::public.staff_role[]));

create policy claim_reservations_select_own
  on public.claim_reservations for select
  using (profile_id = auth.uid());

create policy claim_reservations_staff_manage
  on public.claim_reservations for all
  using (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]))
  with check (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]));

comment on table public.wallet_links is
  'Verified wallet links for NFT-ready identity. No payment or mint action is triggered here.';
comment on table public.nft_collections is
  'NFT-ready collection metadata and IPFS preparation. mint_enabled is blocked until legal approval.';
comment on table public.claim_reservations is
  'Reservation/allowlist model for future claim flows. Does not mint or sell tokens.';
