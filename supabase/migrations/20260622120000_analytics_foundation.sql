-- Privacy-safe analytics storage. Browser clients write through the validated
-- application endpoint; direct table writes remain unavailable.

create table public.analytics_sessions (
  id uuid primary key,
  anonymous_id text not null check (char_length(anonymous_id) between 16 and 80),
  profile_id uuid references public.profiles(id) on delete set null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  entry_path text not null check (char_length(entry_path) <= 500),
  last_path text not null check (char_length(last_path) <= 500),
  referrer text check (referrer is null or char_length(referrer) <= 255),
  utm_source text check (utm_source is null or char_length(utm_source) <= 120),
  utm_medium text check (utm_medium is null or char_length(utm_medium) <= 120),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 160),
  device_type text check (device_type in ('desktop', 'mobile', 'tablet', 'unknown')),
  page_view_count integer not null default 0 check (page_view_count >= 0)
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null check (event_name in (
    'page_view',
    'signup',
    'login',
    'product_view',
    'book_view',
    'add_to_cart',
    'checkout_started',
    'order_paid',
    'download_started',
    'download_completed',
    'amazon_verification_submitted',
    'amazon_verification_approved',
    'ioh_points_awarded',
    'encyclopedia_view'
  )),
  profile_id uuid references public.profiles(id) on delete set null,
  anonymous_id text check (anonymous_id is null or char_length(anonymous_id) between 16 and 80),
  session_id uuid references public.analytics_sessions(id) on delete set null,
  path text not null check (char_length(path) between 1 and 500),
  route_group text check (route_group is null or char_length(route_group) <= 80),
  referrer text check (referrer is null or char_length(referrer) <= 255),
  utm_source text check (utm_source is null or char_length(utm_source) <= 120),
  utm_medium text check (utm_medium is null or char_length(utm_medium) <= 120),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 160),
  utm_content text check (utm_content is null or char_length(utm_content) <= 160),
  utm_term text check (utm_term is null or char_length(utm_term) <= 160),
  device_type text check (device_type in ('desktop', 'mobile', 'tablet', 'unknown')),
  user_agent_hash text check (user_agent_hash is null or char_length(user_agent_hash) = 64),
  country text check (country is null or country ~ '^[A-Z]{2}$'),
  city text check (city is null or char_length(city) <= 100),
  metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(metadata) = 'object'
    and octet_length(metadata::text) <= 4096
  ),
  created_at timestamptz not null default now(),
  check (profile_id is not null or anonymous_id is not null)
);

create table public.analytics_daily_rollups (
  day date primary key,
  page_views integer not null default 0 check (page_views >= 0),
  unique_visitors integer not null default 0 check (unique_visitors >= 0),
  signups integer not null default 0 check (signups >= 0),
  orders_paid integer not null default 0 check (orders_paid >= 0),
  revenue_minor bigint not null default 0 check (revenue_minor >= 0),
  downloads integer not null default 0 check (downloads >= 0),
  amazon_submissions integer not null default 0 check (amazon_submissions >= 0),
  ioh_points_awarded bigint not null default 0 check (ioh_points_awarded >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index analytics_events_created_at_idx
  on public.analytics_events (created_at desc);
create index analytics_events_name_created_at_idx
  on public.analytics_events (event_name, created_at desc);
create index analytics_events_profile_created_at_idx
  on public.analytics_events (profile_id, created_at desc)
  where profile_id is not null;
create index analytics_events_anonymous_created_at_idx
  on public.analytics_events (anonymous_id, created_at desc)
  where anonymous_id is not null;
create index analytics_events_path_created_at_idx
  on public.analytics_events (path, created_at desc);
create index analytics_sessions_anonymous_last_seen_idx
  on public.analytics_sessions (anonymous_id, last_seen_at desc);
create index analytics_sessions_profile_last_seen_idx
  on public.analytics_sessions (profile_id, last_seen_at desc)
  where profile_id is not null;

alter table public.analytics_events enable row level security;
alter table public.analytics_sessions enable row level security;
alter table public.analytics_daily_rollups enable row level security;

create policy analytics_events_staff_select
  on public.analytics_events for select
  to authenticated
  using (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]));

create policy analytics_sessions_staff_select
  on public.analytics_sessions for select
  to authenticated
  using (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]));

create policy analytics_daily_rollups_staff_select
  on public.analytics_daily_rollups for select
  to authenticated
  using (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]));

revoke all on public.analytics_events from anon, authenticated;
revoke all on public.analytics_sessions from anon, authenticated;
revoke all on public.analytics_daily_rollups from anon, authenticated;
grant select on public.analytics_events to authenticated;
grant select on public.analytics_sessions to authenticated;
grant select on public.analytics_daily_rollups to authenticated;

create or replace function public.record_analytics_event(
  p_event_id uuid,
  p_event_name text,
  p_profile_id uuid,
  p_anonymous_id text,
  p_session_id uuid,
  p_path text,
  p_route_group text,
  p_referrer text,
  p_utm_source text,
  p_utm_medium text,
  p_utm_campaign text,
  p_utm_content text,
  p_utm_term text,
  p_device_type text,
  p_user_agent_hash text,
  p_country text,
  p_city text,
  p_metadata jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted_id uuid;
begin
  if exists (
    select 1
    from public.analytics_sessions
    where id = p_session_id
      and anonymous_id <> p_anonymous_id
  ) then
    raise exception 'analytics_session_owner_mismatch' using errcode = 'P0001';
  end if;

  insert into public.analytics_sessions (
    id,
    anonymous_id,
    profile_id,
    first_seen_at,
    last_seen_at,
    entry_path,
    last_path,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    device_type,
    page_view_count
  ) values (
    p_session_id,
    p_anonymous_id,
    p_profile_id,
    now(),
    now(),
    p_path,
    p_path,
    p_referrer,
    p_utm_source,
    p_utm_medium,
    p_utm_campaign,
    p_device_type,
    0
  )
  on conflict (id) do update set
    profile_id = coalesce(analytics_sessions.profile_id, excluded.profile_id),
    last_seen_at = now(),
    last_path = excluded.last_path,
    referrer = coalesce(analytics_sessions.referrer, excluded.referrer),
    utm_source = coalesce(analytics_sessions.utm_source, excluded.utm_source),
    utm_medium = coalesce(analytics_sessions.utm_medium, excluded.utm_medium),
    utm_campaign = coalesce(analytics_sessions.utm_campaign, excluded.utm_campaign),
    device_type = coalesce(excluded.device_type, analytics_sessions.device_type);

  insert into public.analytics_events (
    id,
    event_name,
    profile_id,
    anonymous_id,
    session_id,
    path,
    route_group,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    device_type,
    user_agent_hash,
    country,
    city,
    metadata
  ) values (
    p_event_id,
    p_event_name,
    p_profile_id,
    p_anonymous_id,
    p_session_id,
    p_path,
    p_route_group,
    p_referrer,
    p_utm_source,
    p_utm_medium,
    p_utm_campaign,
    p_utm_content,
    p_utm_term,
    p_device_type,
    p_user_agent_hash,
    p_country,
    p_city,
    coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict (id) do nothing
  returning id into v_inserted_id;

  if v_inserted_id is null then
    return false;
  end if;

  if p_event_name = 'page_view' then
    update public.analytics_sessions
    set page_view_count = page_view_count + 1
    where id = p_session_id;
  end if;

  return true;
end;
$$;

revoke all on function public.record_analytics_event(
  uuid, text, uuid, text, uuid, text, text, text, text, text, text, text, text,
  text, text, text, text, jsonb
) from public, anon, authenticated;
grant execute on function public.record_analytics_event(
  uuid, text, uuid, text, uuid, text, text, text, text, text, text, text, text,
  text, text, text, text, jsonb
) to service_role;

create trigger analytics_daily_rollups_set_updated_at
before update on public.analytics_daily_rollups
for each row execute function public.set_updated_at();

