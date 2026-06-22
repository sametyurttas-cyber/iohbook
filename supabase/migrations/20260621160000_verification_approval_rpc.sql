-- Amazon verification approval + IOH point reward integration.
-- Adds approve_verification_submission RPC for atomic, idempotent approval.

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
  v_duplicate_count integer;
  v_url_duplicate_count integer;
begin
  -- Lock the submission row.
  select *
    into v_submission
    from public.verification_submissions
    where id = p_submission_id
    for update;

  if not found then
    error_code := 'submission_not_found';
    approved := false;
    ledger_id := null;
    balance := null;
    return next;
    return;
  end if;

  -- Idempotency: already approved with a ledger entry.
  if v_submission.status = 'approved' and v_submission.reward_ledger_id is not null then
    select ioh_point_balances.balance
      into v_balance
      from public.ioh_point_balances
      where ioh_point_balances.profile_id = v_submission.profile_id;

    approved := true;
    ledger_id := v_submission.reward_ledger_id;
    balance := coalesce(v_balance, 0);
    error_code := 'already_approved';
    return next;
    return;
  end if;

  -- Cannot approve rejected or closed submissions.
  if v_submission.status in ('rejected', 'closed') then
    error_code := 'submission_not_open';
    approved := false;
    ledger_id := null;
    balance := null;
    return next;
    return;
  end if;

  -- Idempotency: same user + same book + same kind already approved.
  if v_submission.kind in ('amazon_purchase', 'amazon_review') and v_submission.book_slug is not null then
    select count(*) into v_duplicate_count
      from public.verification_submissions
      where profile_id = v_submission.profile_id
        and book_slug = v_submission.book_slug
        and kind = v_submission.kind
        and status = 'approved'
        and id <> p_submission_id;

    if v_duplicate_count > 0 then
      error_code := 'duplicate_book_reward';
      approved := false;
      ledger_id := null;
      balance := null;
      return next;
      return;
    end if;
  end if;

  -- Idempotency: same review URL already approved.
  if v_submission.kind = 'amazon_review' and v_submission.amazon_review_url is not null then
    select count(*) into v_url_duplicate_count
      from public.verification_submissions
      where amazon_review_url = v_submission.amazon_review_url
        and kind = 'amazon_review'
        and status = 'approved'
        and id <> p_submission_id;

    if v_url_duplicate_count > 0 then
      error_code := 'duplicate_review_url';
      approved := false;
      ledger_id := null;
      balance := null;
      return next;
      return;
    end if;
  end if;

  -- Award IOH points if amount > 0.
  if p_reward_amount > 0 then
    -- Determine the correct reason.
    begin
      if v_submission.kind = 'amazon_purchase' then
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
          'amazon_purchase_verification'::public.ioh_points_reason,
          jsonb_build_object(
            'source', 'verification_approval',
            'submission_id', p_submission_id,
            'book_slug', v_submission.book_slug,
            'admin_note', p_admin_note
          )
        )
        returning id into v_ledger_id;
      elsif v_submission.kind = 'amazon_review' then
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
          'amazon_review_verification'::public.ioh_points_reason,
          jsonb_build_object(
            'source', 'verification_approval',
            'submission_id', p_submission_id,
            'book_slug', v_submission.book_slug,
            'admin_note', p_admin_note
          )
        )
        returning id into v_ledger_id;
      else
        -- general_message or unknown: use manual_adjustment_credit.
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
          'manual_adjustment_credit'::public.ioh_points_reason,
          jsonb_build_object(
            'source', 'verification_approval',
            'submission_id', p_submission_id,
            'admin_note', p_admin_note
          )
        )
        returning id into v_ledger_id;
      end if;

      -- Update balance.
      update public.ioh_point_balances
        set balance = ioh_point_balances.balance + p_reward_amount,
            lifetime_earned = ioh_point_balances.lifetime_earned + p_reward_amount,
            updated_at = now()
        where profile_id = v_submission.profile_id
        returning ioh_point_balances.balance into v_balance;

    exception when unique_violation then
      -- Ledger unique constraint hit — should not happen but handle gracefully.
      error_code := 'ledger_conflict';
      approved := false;
      ledger_id := null;
      balance := null;
      return next;
      return;
    end;
  else
    v_ledger_id := null;
    v_balance := null;
  end if;

  -- Update submission to approved.
  update public.verification_submissions
    set status = 'approved',
        reward_amount = p_reward_amount,
        reward_ledger_id = v_ledger_id,
        rewarded_at = now(),
        reviewed_by = p_actor_profile_id,
        reviewed_at = now(),
        admin_notes = coalesce(p_admin_note, admin_notes),
        updated_at = now()
    where id = p_submission_id;

  -- Insert automatic reply to the user.
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
        'Dogrulamaniz onaylandi.'
    end
  );

  -- Write audit log.
  insert into public.audit_logs (
    actor_profile_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    p_actor_profile_id,
    'verification_approve',
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

  approved := true;
  ledger_id := v_ledger_id;
  balance := v_balance;
  error_code := null;
  return next;
end;
$$;

comment on function public.approve_verification_submission(uuid, uuid, integer, text) is
  'Atomically approves a verification submission, awards IOH points, writes an automatic reply, and logs an audit entry. Idempotent: already-approved submissions with a ledger entry return safely.';

revoke all on function public.approve_verification_submission(uuid, uuid, integer, text) from public;
grant execute on function public.approve_verification_submission(uuid, uuid, integer, text) to service_role;
