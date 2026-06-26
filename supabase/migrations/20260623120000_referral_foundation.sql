do $$
begin
  if not exists (select 1 from pg_type where typname = 'referral_status') then
    create type public.referral_status as enum ('pending', 'qualified', 'rewarded', 'rejected');
  end if;
end $$;

alter type public.ioh_points_reason add value if not exists 'referral_referrer_reward';
alter type public.ioh_points_reason add value if not exists 'referral_referred_reward';

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint referral_codes_code_format check (code = upper(code) and code ~ '^[A-Z0-9]{6,16}$')
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_profile_id uuid not null references public.profiles(id) on delete cascade,
  referred_profile_id uuid not null references public.profiles(id) on delete cascade,
  referral_code text not null,
  status public.referral_status not null default 'pending',
  qualified_at timestamptz,
  rewarded_at timestamptz,
  referrer_reward_ledger_id uuid references public.ioh_point_ledger(id) on delete set null,
  referred_reward_ledger_id uuid references public.ioh_point_ledger(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint referrals_no_self_invite check (referrer_profile_id <> referred_profile_id)
);

create unique index if not exists referral_codes_profile_id_key
  on public.referral_codes(profile_id);

create unique index if not exists referral_codes_code_key
  on public.referral_codes(code);

create unique index if not exists referrals_referred_profile_id_key
  on public.referrals(referred_profile_id);

create unique index if not exists referrals_referrer_reward_ledger_id_key
  on public.referrals(referrer_reward_ledger_id)
  where referrer_reward_ledger_id is not null;

create unique index if not exists referrals_referred_reward_ledger_id_key
  on public.referrals(referred_reward_ledger_id)
  where referred_reward_ledger_id is not null;

create index if not exists referrals_referrer_profile_id_idx
  on public.referrals(referrer_profile_id, created_at desc);

create index if not exists referrals_status_idx
  on public.referrals(status);

drop trigger if exists referral_codes_set_updated_at on public.referral_codes;
create trigger referral_codes_set_updated_at
  before update on public.referral_codes
  for each row execute function public.set_updated_at();

drop trigger if exists referrals_set_updated_at on public.referrals;
create trigger referrals_set_updated_at
  before update on public.referrals
  for each row execute function public.set_updated_at();

alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;

drop policy if exists referral_codes_select_own on public.referral_codes;
create policy referral_codes_select_own
  on public.referral_codes for select
  using (profile_id = auth.uid());

drop policy if exists referral_codes_staff_select on public.referral_codes;
create policy referral_codes_staff_select
  on public.referral_codes for select
  using (public.is_staff(array['owner','admin_ops','support']::public.staff_role[]));

drop policy if exists referrals_select_own on public.referrals;
create policy referrals_select_own
  on public.referrals for select
  using (referrer_profile_id = auth.uid() or referred_profile_id = auth.uid());

drop policy if exists referrals_staff_select on public.referrals;
create policy referrals_staff_select
  on public.referrals for select
  using (public.is_staff(array['owner','admin_ops','support']::public.staff_role[]));

create or replace function public.record_referral_signup(
  p_referred_profile_id uuid,
  p_referral_code text
)
returns table(created boolean, referral_id uuid, status public.referral_status)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(coalesce(p_referral_code, '')));
  v_referrer_profile_id uuid;
  v_existing public.referrals%rowtype;
  v_inserted public.referrals%rowtype;
begin
  if v_code = '' or v_code !~ '^[A-Z0-9]{6,16}$' then
    return query select false, null::uuid, null::public.referral_status;
    return;
  end if;

  select rc.profile_id
  into v_referrer_profile_id
  from public.referral_codes rc
  where rc.code = v_code;

  if v_referrer_profile_id is null then
    return query select false, null::uuid, null::public.referral_status;
    return;
  end if;

  if v_referrer_profile_id = p_referred_profile_id then
    return query select false, null::uuid, 'rejected'::public.referral_status;
    return;
  end if;

  select *
  into v_existing
  from public.referrals r
  where r.referred_profile_id = p_referred_profile_id;

  if found then
    return query select false, v_existing.id, v_existing.status;
    return;
  end if;

  begin
    insert into public.referrals (
      referrer_profile_id,
      referred_profile_id,
      referral_code,
      status
    )
    values (
      v_referrer_profile_id,
      p_referred_profile_id,
      v_code,
      'pending'
    )
    returning * into v_inserted;
  exception when unique_violation then
    select *
    into v_existing
    from public.referrals r
    where r.referred_profile_id = p_referred_profile_id;

    return query select false, v_existing.id, v_existing.status;
    return;
  end;

  return query select true, v_inserted.id, v_inserted.status;
end;
$$;

create or replace function public.qualify_referral_after_email_verified(
  p_profile_id uuid
)
returns table(email_verified boolean, qualified boolean, referral_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email_verified boolean := false;
  v_referral public.referrals%rowtype;
begin
  select (u.email_confirmed_at is not null)
  into v_email_verified
  from auth.users u
  where u.id = p_profile_id;

  v_email_verified := coalesce(v_email_verified, false);

  if not v_email_verified then
    return query select false, false, null::uuid;
    return;
  end if;

  select *
  into v_referral
  from public.referrals r
  where r.referred_profile_id = p_profile_id;

  if not found then
    return query select true, false, null::uuid;
    return;
  end if;

  if v_referral.status = 'pending' then
    update public.referrals r
    set status = 'qualified',
        qualified_at = coalesce(r.qualified_at, now()),
        updated_at = now()
    where r.id = v_referral.id
    returning * into v_referral;
  end if;

  return query select true, v_referral.status in ('qualified', 'rewarded'), v_referral.id;
end;
$$;

create or replace function public.award_referral_if_eligible(
  p_profile_id uuid
)
returns table(
  applied boolean,
  referral_id uuid,
  referred_ledger_id uuid,
  referrer_ledger_id uuid,
  status public.referral_status
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email_verified boolean := false;
  v_referral public.referrals%rowtype;
  v_referred_ledger_id uuid;
  v_referrer_ledger_id uuid;
begin
  select (u.email_confirmed_at is not null)
  into v_email_verified
  from auth.users u
  where u.id = p_profile_id;

  if not coalesce(v_email_verified, false) then
    return query select false, null::uuid, null::uuid, null::uuid, null::public.referral_status;
    return;
  end if;

  select *
  into v_referral
  from public.referrals r
  where r.referred_profile_id = p_profile_id
  for update;

  if not found then
    return query select false, null::uuid, null::uuid, null::uuid, null::public.referral_status;
    return;
  end if;

  if v_referral.status = 'rewarded' then
    return query select
      false,
      v_referral.id,
      v_referral.referred_reward_ledger_id,
      v_referral.referrer_reward_ledger_id,
      v_referral.status;
    return;
  end if;

  if v_referral.status = 'rejected' then
    return query select false, v_referral.id, null::uuid, null::uuid, v_referral.status;
    return;
  end if;

  insert into public.ioh_point_balances(profile_id)
    values (v_referral.referrer_profile_id)
    on conflict (profile_id) do nothing;

  insert into public.ioh_point_balances(profile_id)
    values (v_referral.referred_profile_id)
    on conflict (profile_id) do nothing;

  insert into public.ioh_point_ledger(profile_id, amount, reason, metadata)
  values (
    v_referral.referrer_profile_id,
    100,
    'referral_referrer_reward'::public.ioh_points_reason,
    jsonb_build_object('source', 'referral', 'referral_id', v_referral.id, 'referred_profile_id', v_referral.referred_profile_id)
  )
  returning id into v_referrer_ledger_id;

  insert into public.ioh_point_ledger(profile_id, amount, reason, metadata)
  values (
    v_referral.referred_profile_id,
    100,
    'referral_referred_reward'::public.ioh_points_reason,
    jsonb_build_object('source', 'referral', 'referral_id', v_referral.id, 'referrer_profile_id', v_referral.referrer_profile_id)
  )
  returning id into v_referred_ledger_id;

  update public.ioh_point_balances b
  set balance = b.balance + 100,
      lifetime_earned = b.lifetime_earned + 100,
      updated_at = now()
  where b.profile_id in (v_referral.referrer_profile_id, v_referral.referred_profile_id);

  update public.referrals r
  set status = 'rewarded',
      qualified_at = coalesce(r.qualified_at, now()),
      rewarded_at = now(),
      referrer_reward_ledger_id = v_referrer_ledger_id,
      referred_reward_ledger_id = v_referred_ledger_id,
      updated_at = now()
  where r.id = v_referral.id
  returning * into v_referral;

  insert into public.audit_logs(actor_profile_id, action, entity_type, entity_id, metadata)
  values (
    null,
    'referral.reward',
    'referral',
    v_referral.id,
    jsonb_build_object(
      'referrer_profile_id', v_referral.referrer_profile_id,
      'referred_profile_id', v_referral.referred_profile_id,
      'referrer_reward_ledger_id', v_referrer_ledger_id,
      'referred_reward_ledger_id', v_referred_ledger_id
    )
  );

  return query select true, v_referral.id, v_referred_ledger_id, v_referrer_ledger_id, v_referral.status;
exception when unique_violation then
  select *
  into v_referral
  from public.referrals r
  where r.referred_profile_id = p_profile_id;

  return query select
    false,
    v_referral.id,
    v_referral.referred_reward_ledger_id,
    v_referral.referrer_reward_ledger_id,
    v_referral.status;
end;
$$;
