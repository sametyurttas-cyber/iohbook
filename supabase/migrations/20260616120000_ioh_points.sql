create type public.ioh_points_reason as enum ('signup_bonus', 'book_order_reward');

create table public.ioh_point_balances (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  balance integer not null default 0,
  lifetime_earned integer not null default 0,
  lifetime_spent integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ioh_point_balances_non_negative check (
    balance >= 0 and lifetime_earned >= 0 and lifetime_spent >= 0
  )
);

create table public.ioh_point_ledger (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  amount integer not null,
  reason public.ioh_points_reason not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint ioh_point_ledger_amount_non_zero check (amount <> 0),
  constraint ioh_point_ledger_book_order_has_order check (
    reason <> 'book_order_reward' or order_id is not null
  )
);

create unique index ioh_point_ledger_signup_bonus_once_idx
  on public.ioh_point_ledger(profile_id)
  where reason = 'signup_bonus';

create unique index ioh_point_ledger_book_order_reward_once_idx
  on public.ioh_point_ledger(order_id)
  where reason = 'book_order_reward' and order_id is not null;

create index ioh_point_ledger_profile_created_idx
  on public.ioh_point_ledger(profile_id, created_at desc);

create index ioh_point_ledger_order_id_idx
  on public.ioh_point_ledger(order_id);

create trigger ioh_point_balances_set_updated_at
  before update on public.ioh_point_balances
  for each row execute function public.set_updated_at();

alter table public.ioh_point_balances enable row level security;
alter table public.ioh_point_ledger enable row level security;

create policy ioh_point_balances_select_own
  on public.ioh_point_balances for select
  using (profile_id = auth.uid());
comment on policy ioh_point_balances_select_own on public.ioh_point_balances is
  'Customers can read their own IOH point balance.';

create policy ioh_point_balances_staff_select
  on public.ioh_point_balances for select
  using (public.is_staff(array['owner','admin_ops','fulfillment']::public.staff_role[]));
comment on policy ioh_point_balances_staff_select on public.ioh_point_balances is
  'Operational staff can read IOH point balances for support.';

create policy ioh_point_ledger_select_own
  on public.ioh_point_ledger for select
  using (profile_id = auth.uid());
comment on policy ioh_point_ledger_select_own on public.ioh_point_ledger is
  'Customers can read their own IOH point ledger.';

create policy ioh_point_ledger_staff_select
  on public.ioh_point_ledger for select
  using (public.is_staff(array['owner','admin_ops','fulfillment']::public.staff_role[]));
comment on policy ioh_point_ledger_staff_select on public.ioh_point_ledger is
  'Operational staff can inspect IOH point ledger rows for support.';

create or replace function public.award_ioh_points(
  p_profile_id uuid,
  p_amount integer,
  p_reason public.ioh_points_reason,
  p_order_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns table(ledger_id uuid, applied boolean, balance integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ledger_id uuid;
  v_balance integer;
begin
  if p_amount <= 0 then
    raise exception 'ioh_points_amount_must_be_positive' using errcode = 'P0001';
  end if;

  if p_reason = 'book_order_reward' and p_order_id is null then
    raise exception 'ioh_points_order_required' using errcode = 'P0001';
  end if;

  insert into public.ioh_point_balances (profile_id)
  values (p_profile_id)
  on conflict (profile_id) do nothing;

  begin
    insert into public.ioh_point_ledger (
      profile_id,
      order_id,
      amount,
      reason,
      metadata
    )
    values (
      p_profile_id,
      p_order_id,
      p_amount,
      p_reason,
      coalesce(p_metadata, '{}'::jsonb)
    )
    returning id into v_ledger_id;
  exception when unique_violation then
    select ioh_point_balances.balance
    into v_balance
    from public.ioh_point_balances
    where ioh_point_balances.profile_id = p_profile_id;

    ledger_id := null;
    applied := false;
    balance := coalesce(v_balance, 0);
    return next;
    return;
  end;

  update public.ioh_point_balances
  set balance = ioh_point_balances.balance + p_amount,
      lifetime_earned = ioh_point_balances.lifetime_earned + p_amount,
      updated_at = now()
  where profile_id = p_profile_id
  returning ioh_point_balances.balance into v_balance;

  ledger_id := v_ledger_id;
  applied := true;
  balance := v_balance;
  return next;
end;
$$;

comment on function public.award_ioh_points(uuid, integer, public.ioh_points_reason, uuid, jsonb) is
  'Atomically writes an IOH point ledger row and updates balance. Unique indexes make signup and order rewards idempotent.';

revoke all on function public.award_ioh_points(uuid, integer, public.ioh_points_reason, uuid, jsonb) from public;
grant execute on function public.award_ioh_points(uuid, integer, public.ioh_points_reason, uuid, jsonb) to service_role;
