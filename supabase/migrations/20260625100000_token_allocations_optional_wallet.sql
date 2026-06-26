alter table public.token_allocations
  alter column wallet_address drop not null,
  alter column normalized_address drop not null;

comment on column public.token_allocations.wallet_address is
  'Optional wallet address. Token sale purchase can be completed without a wallet; manual delivery may request it later.';

comment on column public.token_allocations.normalized_address is
  'Optional normalized wallet address. Null means the customer has not linked a delivery wallet yet.';
