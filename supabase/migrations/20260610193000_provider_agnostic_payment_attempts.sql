alter table public.payment_attempts
  add column if not exists provider_reference text,
  add column if not exists provider_status text,
  add column if not exists raw_response jsonb not null default '{}'::jsonb,
  add column if not exists failure_reason text;

update public.payment_attempts
set
  provider_reference = coalesce(provider_reference, provider_token, provider_transaction_id),
  provider_status = coalesce(provider_status, status::text),
  raw_response = case
    when raw_response = '{}'::jsonb then response_payload
    else raw_response
  end,
  failure_reason = coalesce(failure_reason, failure_message)
where provider_reference is null
   or provider_status is null
   or raw_response = '{}'::jsonb
   or failure_reason is null;

create index if not exists payment_attempts_provider_reference_idx
  on public.payment_attempts(provider, provider_reference)
  where provider_reference is not null;

create index if not exists payment_attempts_provider_status_idx
  on public.payment_attempts(provider, provider_status)
  where provider_status is not null;

comment on column public.payment_attempts.provider is
  'Stable provider id such as iyzico, shopier, or bank_transfer.';
comment on column public.payment_attempts.provider_reference is
  'Provider-facing session token, payment token, transfer reference, or external checkout reference.';
comment on column public.payment_attempts.provider_status is
  'Raw provider lifecycle status, kept separate from the normalized payment_status enum.';
comment on column public.payment_attempts.raw_response is
  'Last raw provider response or normalized provider event payload for auditing and reconciliation.';
comment on column public.payment_attempts.verified_at is
  'Backend verification timestamp. Browser redirects are not enough to set this.';
comment on column public.payment_attempts.failure_reason is
  'Provider-agnostic failure reason shown in support/admin workflows.';

