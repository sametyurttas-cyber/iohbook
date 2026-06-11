create table public.consent_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  email text,
  event_kind text not null check (event_kind in ('notice_acknowledgement', 'explicit_consent')),
  purpose text not null,
  document_slug text not null,
  document_version text not null default '2026-06-10',
  granted boolean not null,
  channel text not null default 'web',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index consent_events_profile_id_idx on public.consent_events(profile_id);
create index consent_events_order_id_idx on public.consent_events(order_id);
create index consent_events_email_idx on public.consent_events(email);
create index consent_events_kind_purpose_idx on public.consent_events(event_kind, purpose);
create index consent_events_created_at_idx on public.consent_events(created_at desc);

alter table public.consent_events enable row level security;

create policy consent_events_owner_select
  on public.consent_events for select
  using (profile_id = auth.uid());

comment on policy consent_events_owner_select on public.consent_events is
  'Customers can read consent and notice events tied to their own profile.';

create policy consent_events_staff_manage
  on public.consent_events for all
  using (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]))
  with check (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]));

comment on policy consent_events_staff_manage on public.consent_events is
  'Owner and admin operations staff can audit and manage legal consent records.';
