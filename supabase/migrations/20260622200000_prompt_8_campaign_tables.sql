-- Create email_batches table
create table public.email_batches (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  template_key text,
  subject text not null,
  body_html text not null,
  body_text text not null,
  segment_key text not null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'sending', 'completed', 'failed', 'cancelled')),
  total_recipients integer not null default 0,
  sent_count integer not null default 0,
  failed_count integer not null default 0,
  skipped_count integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  scheduled_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now() not null
);

-- Create email_batch_recipients table
create table public.email_batch_recipients (
  id uuid default gen_random_uuid() primary key,
  batch_id uuid references public.email_batches(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete set null,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'skipped')),
  error_message text,
  provider_message_id text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.email_batches enable row level security;
alter table public.email_batch_recipients enable row level security;

-- Policies for email_batches
create policy email_batches_staff_all
  on public.email_batches for all
  using (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]));

create policy email_batches_support_select
  on public.email_batches for select
  using (public.is_staff(array['support']::public.staff_role[]));

-- Policies for email_batch_recipients
create policy email_batch_recipients_staff_all
  on public.email_batch_recipients for all
  using (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]));

create policy email_batch_recipients_support_select
  on public.email_batch_recipients for select
  using (public.is_staff(array['support']::public.staff_role[]));

-- Indexes
create index email_batches_status_idx on public.email_batches(status);
create index email_batch_recipients_batch_id_idx on public.email_batch_recipients(batch_id);
create index email_batch_recipients_status_idx on public.email_batch_recipients(status);
