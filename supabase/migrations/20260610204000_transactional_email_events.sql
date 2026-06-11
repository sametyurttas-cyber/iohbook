create table public.email_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  provider text not null,
  recipient text not null,
  subject text not null,
  status text not null check (status in ('queued', 'sent', 'failed', 'skipped')),
  order_id uuid references public.orders(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  provider_message_id text,
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index email_events_event_type_idx on public.email_events(event_type);
create index email_events_order_id_idx on public.email_events(order_id);
create index email_events_profile_id_idx on public.email_events(profile_id);
create index email_events_recipient_idx on public.email_events(recipient);
create index email_events_status_idx on public.email_events(status);
create index email_events_created_at_idx on public.email_events(created_at desc);

alter table public.email_events enable row level security;

create policy email_events_staff_select
  on public.email_events for select
  using (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]));

comment on policy email_events_staff_select on public.email_events is
  'Owner and admin operations staff can audit transactional email delivery logs.';

create policy email_events_staff_insert
  on public.email_events for insert
  with check (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]));

comment on policy email_events_staff_insert on public.email_events is
  'Staff initiated operational emails can be logged from authenticated admin flows.';
