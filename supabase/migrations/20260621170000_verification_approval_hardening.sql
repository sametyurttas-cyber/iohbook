-- Harden Amazon verification approval authorization, idempotency and rollback behavior.

-- Customers use replies for follow-up. Removing direct row updates prevents
-- reward/reviewer fields from being tampered with through the public API.
drop policy if exists verification_submissions_update_own
  on public.verification_submissions;

create or replace function public.approve_verification_submission(
  p_submission_id uuid,
  p_actor_profile_id uuid,
  p_reward_amount integer default 0,
  p_admin_note text default null
)
returns table(
  approved boolean,
  ledger_id uuid,
  balance integer,
  error_code text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_submission record;
  v_ledger_id uuid;
  v_balance integer;
  v_expected_reward integer;
  v_reward_reason public.ioh_points_reason;
  v_constraint_name text;
begin
  if not exists (
    select 1
    from public.staff_roles
    where profile_id = p_actor_profile_id
      and role in ('owner', 'admin_ops')
      and revoked_at is null
  ) then
    return query select false, null::uuid, null::integer, 'forbidden'::text;
    return;
  end if;

  if p_reward_amount < 0 then
    return query select false, null::uuid, null::integer, 'negative_reward'::text;
    return;
  end if;

  select *
    into v_submission
    from public.verification_submissions
    where id = p_submission_id
    for update;

  if not found then
    return query select false, null::uuid, null::integer, 'submission_not_found'::text;
    return;
  end if;

  if v_submission.status = 'approved' then
    if v_submission.reward_amount = 0 then
      return query select true, null::uuid, null::integer, 'already_approved'::text;
      return;
    end if;

    if v_submission.reward_ledger_id is not null then
      select b.balance into v_balance
      from public.ioh_point_balances b
      where b.profile_id = v_submission.profile_id;

      return query
        select true, v_submission.reward_ledger_id, coalesce(v_balance, 0), 'already_approved'::text;
      return;
    end if;

    return query select false, null::uuid, null::integer, 'approved_reward_incomplete'::text;
    return;
  end if;

  if v_submission.status in ('rejected', 'closed') then
    return query select false, null::uuid, null::integer, 'submission_not_open'::text;
    return;
  end if;

  v_expected_reward := case v_submission.kind
    when 'amazon_purchase' then 30
    when 'amazon_review' then 250
    else 0
  end;

  if p_reward_amount <> v_expected_reward and nullif(btrim(p_admin_note), '') is null then
    return query select false, null::uuid, null::integer, 'custom_reward_note_required'::text;
    return;
  end if;

  if v_submission.kind = 'amazon_purchase' then
    v_reward_reason := 'amazon_purchase_verification'::public.ioh_points_reason;
  elsif v_submission.kind = 'amazon_review' then
    v_reward_reason := 'amazon_review_verification'::public.ioh_points_reason;
  else
    v_reward_reason := 'manual_adjustment_credit'::public.ioh_points_reason;
  end if;

  begin
    if p_reward_amount > 0 then
      insert into public.ioh_point_balances (profile_id)
      values (v_submission.profile_id)
      on conflict (profile_id) do nothing;

      insert into public.ioh_point_ledger (
        profile_id,
        amount,
        reason,
        metadata
      )
      values (
        v_submission.profile_id,
        p_reward_amount,
        v_reward_reason,
        jsonb_build_object(
          'source', 'verification_approval',
          'submission_id', p_submission_id,
          'book_slug', v_submission.book_slug,
          'admin_note', p_admin_note
        )
      )
      returning id into v_ledger_id;

      update public.ioh_point_balances b
      set balance = b.balance + p_reward_amount,
          lifetime_earned = b.lifetime_earned + p_reward_amount,
          updated_at = now()
      where b.profile_id = v_submission.profile_id
      returning b.balance into v_balance;
    else
      v_ledger_id := null;
      v_balance := null;
    end if;

    update public.verification_submissions
    set status = 'approved',
        reward_amount = p_reward_amount,
        reward_reason = case when p_reward_amount > 0 then v_reward_reason::text else null end,
        reward_ledger_id = v_ledger_id,
        rewarded_at = now(),
        reviewed_by = p_actor_profile_id,
        reviewed_at = now(),
        admin_notes = coalesce(nullif(btrim(p_admin_note), ''), admin_notes),
        updated_at = now()
    where id = p_submission_id;

    insert into public.submission_replies (
      submission_id,
      profile_id,
      is_staff,
      body
    )
    values (
      p_submission_id,
      p_actor_profile_id,
      true,
      case
        when p_reward_amount > 0 then
          'Dogrulamaniz onaylandi. Hesabiniza ' || p_reward_amount || ' IOH puan islendi.'
        else
          'Talebiniz onaylandi.'
      end
    );

    insert into public.audit_logs (
      actor_profile_id,
      action,
      entity_type,
      entity_id,
      metadata
    )
    values (
      p_actor_profile_id,
      'verification.approve',
      'verification_submission',
      p_submission_id,
      jsonb_build_object(
        'reward_amount', p_reward_amount,
        'ledger_id', v_ledger_id,
        'kind', v_submission.kind::text,
        'book_slug', v_submission.book_slug,
        'profile_id', v_submission.profile_id,
        'admin_note', p_admin_note
      )
    );
  exception
    when unique_violation then
      get stacked diagnostics v_constraint_name = constraint_name;

      if v_constraint_name = 'verification_submissions_approved_unique_idx' then
        return query select false, null::uuid, null::integer, 'duplicate_book_reward'::text;
        return;
      elsif v_constraint_name = 'verification_submissions_review_url_approved_unique_idx' then
        return query select false, null::uuid, null::integer, 'duplicate_review_url'::text;
        return;
      end if;

      return query select false, null::uuid, null::integer, 'ledger_conflict'::text;
      return;
  end;

  return query select true, v_ledger_id, v_balance, null::text;
end;
$$;

comment on function public.approve_verification_submission(uuid, uuid, integer, text) is
  'Atomically approves a verification submission after owner/admin_ops authorization. Point ledger, balance, submission, reply and audit writes roll back together; repeated approvals are idempotent.';

revoke all on function public.approve_verification_submission(uuid, uuid, integer, text) from public;
grant execute on function public.approve_verification_submission(uuid, uuid, integer, text) to service_role;
