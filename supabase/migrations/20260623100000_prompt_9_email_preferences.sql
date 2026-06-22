-- Create email_preferences table
create table public.email_preferences (
  profile_id uuid references public.profiles(id) on delete cascade primary key,
  transactional_enabled boolean not null default true,
  marketing_enabled boolean not null default true,
  product_updates_enabled boolean not null default true,
  community_enabled boolean not null default true,
  amazon_rewards_enabled boolean not null default true,
  updated_at timestamp with time zone default now() not null
);

-- Create email_unsubscribe_tokens table
create table public.email_unsubscribe_tokens (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  token_hash text not null unique,
  category text not null,
  expires_at timestamp with time zone,
  used_at timestamp with time zone,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.email_preferences enable row level security;
alter table public.email_unsubscribe_tokens enable row level security;

-- Policies for email_preferences
create policy email_preferences_staff_all
  on public.email_preferences for all
  using (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]));

create policy email_preferences_support_select
  on public.email_preferences for select
  using (public.is_staff(array['support']::public.staff_role[]));

create policy email_preferences_user_select
  on public.email_preferences for select
  using (auth.uid() = profile_id);

create policy email_preferences_user_update
  on public.email_preferences for update
  using (auth.uid() = profile_id);

-- Policies for email_unsubscribe_tokens (staff-only select, no public write/read)
create policy email_unsubscribe_tokens_staff_all
  on public.email_unsubscribe_tokens for all
  using (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]));

create policy email_unsubscribe_tokens_support_select
  on public.email_unsubscribe_tokens for select
  using (public.is_staff(array['support']::public.staff_role[]));

-- Trigger function to automatically insert default email preferences when a profile is created
create or replace function public.handle_new_profile_preferences()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.email_preferences (
    profile_id,
    marketing_enabled
  )
  values (
    new.id,
    new.marketing_email_opt_in
  )
  on conflict (profile_id) do nothing;
  return new;
end;
$$;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute function public.handle_new_profile_preferences();

-- Set updated_at trigger for email_preferences
create trigger email_preferences_set_updated_at
  before update on public.email_preferences
  for each row execute function public.set_updated_at();

-- Backfill preferences for existing profiles
insert into public.email_preferences (profile_id, marketing_enabled)
select id, marketing_email_opt_in from public.profiles
on conflict (profile_id) do update
set marketing_enabled = excluded.marketing_enabled;
