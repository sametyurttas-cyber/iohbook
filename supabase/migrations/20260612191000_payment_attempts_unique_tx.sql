create unique index if not exists payment_attempts_provider_tx_unique
  on public.payment_attempts (provider, provider_transaction_id)
  where provider_transaction_id is not null;
