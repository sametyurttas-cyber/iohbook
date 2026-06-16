alter table public.profiles
  add column if not exists admin_notes text;

create or replace function public.adjust_ioh_points_manually(
  p_profile_id uuid,
  p_amount integer,
  p_reason_text text,
  p_actor_profile_id uuid,
  p_metadata jsonb default '{}'::jsonb
)
returns table(ledger_id uuid, balance integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
  v_new_balance integer;
  v_ledger_id uuid;
  v_reason public.ioh_points_reason;
begin
  if p_amount = 0 then
    raise exception 'ioh_points_manual_amount_required' using errcode = 'P0001';
  end if;

  if length(trim(coalesce(p_reason_text, ''))) < 3 then
    raise exception 'ioh_points_manual_reason_required' using errcode = 'P0001';
  end if;

  insert into public.ioh_point_balances (profile_id)
  values (p_profile_id)
  on conflict (profile_id) do nothing;

  select ioh_point_balances.balance
  into v_balance
  from public.ioh_point_balances
  where ioh_point_balances.profile_id = p_profile_id
  for update;

  v_new_balance := coalesce(v_balance, 0) + p_amount;

  if v_new_balance < 0 then
    raise exception 'ioh_points_negative_balance' using errcode = 'P0001';
  end if;

  v_reason := case
    when p_amount > 0 then 'manual_adjustment_credit'::public.ioh_points_reason
    else 'manual_adjustment_debit'::public.ioh_points_reason
  end;

  insert into public.ioh_point_ledger (
    profile_id,
    amount,
    reason,
    metadata
  )
  values (
    p_profile_id,
    p_amount,
    v_reason,
    coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object(
      'admin_reason',
      trim(p_reason_text),
      'actor_profile_id',
      p_actor_profile_id
    )
  )
  returning id into v_ledger_id;

  update public.ioh_point_balances
  set balance = v_new_balance,
      lifetime_earned = case
        when p_amount > 0 then ioh_point_balances.lifetime_earned + p_amount
        else ioh_point_balances.lifetime_earned
      end,
      lifetime_spent = case
        when p_amount < 0 then ioh_point_balances.lifetime_spent + abs(p_amount)
        else ioh_point_balances.lifetime_spent
      end,
      updated_at = now()
  where profile_id = p_profile_id
  returning ioh_point_balances.balance into v_balance;

  insert into public.audit_logs (
    actor_profile_id,
    action,
    entity_type,
    entity_id,
    before_data,
    after_data,
    metadata
  )
  values (
    p_actor_profile_id,
    case
      when p_amount > 0 then 'admin_user.points_added'
      else 'admin_user.points_deducted'
    end,
    'profile',
    p_profile_id,
    jsonb_build_object('balance', v_balance - p_amount),
    jsonb_build_object('balance', v_balance, 'ledger_id', v_ledger_id),
    coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object(
      'amount',
      p_amount,
      'reason',
      trim(p_reason_text)
    )
  );

  ledger_id := v_ledger_id;
  balance := v_balance;
  return next;
end;
$$;

comment on column public.profiles.admin_notes is
  'Internal admin-only CRM notes. Never shown to customers.';

comment on function public.adjust_ioh_points_manually(uuid, integer, text, uuid, jsonb) is
  'Writes manual IOH point adjustments with non-negative balance protection. Admin action must be authorized by server code before calling.';

revoke all on function public.adjust_ioh_points_manually(uuid, integer, text, uuid, jsonb) from public;
grant execute on function public.adjust_ioh_points_manually(uuid, integer, text, uuid, jsonb) to service_role;
