-- Update commit_token_sale_payment_start to ignore pending allocations older than 24 hours

create or replace function public.commit_token_sale_payment_start(
  p_order jsonb,
  p_order_item jsonb,
  p_payment_attempt jsonb,
  p_allocation jsonb,
  p_package_id uuid,
  p_quantity integer,
  p_profile_id uuid
)
returns table(order_id uuid, order_number text, order_item_id uuid, payment_attempt_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid := coalesce((p_order->>'id')::uuid, gen_random_uuid());
  v_order_item_id uuid;
  v_payment_attempt_id uuid;
  v_package public.token_sale_packages%rowtype;
  v_campaign public.token_sale_campaigns%rowtype;
  v_requested_total numeric(36, 8) := (p_allocation->>'total_amount')::numeric;
  v_campaign_allocated numeric(36, 8);
  v_user_allocated numeric(36, 8);
begin
  select *
    into v_package
  from public.token_sale_packages
  where id = p_package_id
    and active = true;

  if not found then
    raise exception 'token_sale_package_not_found' using errcode = 'P0001';
  end if;

  select *
    into v_campaign
  from public.token_sale_campaigns
  where id = v_package.campaign_id
  for update;

  if not found or v_campaign.status <> 'active' or v_campaign.sales_enabled is not true then
    raise exception 'token_sale_campaign_not_active' using errcode = 'P0001';
  end if;

  if v_campaign.starts_at is not null and v_campaign.starts_at > now() then
    raise exception 'token_sale_not_started' using errcode = 'P0001';
  end if;

  if v_campaign.ends_at is not null and v_campaign.ends_at < now() then
    raise exception 'token_sale_ended' using errcode = 'P0001';
  end if;

  if v_package.max_quantity_per_order is not null and p_quantity > v_package.max_quantity_per_order then
    raise exception 'token_sale_package_limit' using errcode = 'P0001';
  end if;

  -- Ignore pending allocations older than 24 hours
  select coalesce(sum(total_amount), 0)
    into v_campaign_allocated
  from public.token_allocations
  where campaign_id = v_campaign.id
    and (
      status in ('approved', 'sent')
      or (status = 'pending' and created_at > now() - interval '24 hours')
    );

  if v_campaign_allocated + v_requested_total > v_campaign.total_sale_limit then
    raise exception 'token_sale_total_limit_exceeded' using errcode = 'P0001';
  end if;

  if v_campaign.per_user_limit is not null then
    -- Ignore pending allocations older than 24 hours
    select coalesce(sum(total_amount), 0)
      into v_user_allocated
    from public.token_allocations
    where campaign_id = v_campaign.id
      and profile_id = p_profile_id
      and (
        status in ('approved', 'sent')
        or (status = 'pending' and created_at > now() - interval '24 hours')
      );

    if v_user_allocated + v_requested_total > v_campaign.per_user_limit then
      raise exception 'token_sale_user_limit_exceeded' using errcode = 'P0001';
    end if;
  end if;

  insert into public.orders (
    id,
    currency,
    customer_email,
    customer_name,
    discount_minor,
    legal_acceptance,
    order_number,
    profile_id,
    shipping_minor,
    status,
    subtotal_minor,
    tax_minor,
    total_minor
  )
  values (
    v_order_id,
    (p_order->>'currency')::char(3),
    p_order->>'customer_email',
    nullif(p_order->>'customer_name', ''),
    coalesce((p_order->>'discount_minor')::integer, 0),
    coalesce(p_order->'legal_acceptance', '{}'::jsonb),
    p_order->>'order_number',
    p_profile_id,
    coalesce((p_order->>'shipping_minor')::integer, 0),
    'pending_payment',
    coalesce((p_order->>'subtotal_minor')::integer, 0),
    coalesce((p_order->>'tax_minor')::integer, 0),
    coalesce((p_order->>'total_minor')::integer, 0)
  );

  insert into public.order_items (
    fulfillment_type,
    order_id,
    product_snapshot,
    quantity,
    total_minor,
    unit_price_minor,
    variant_snapshot
  )
  values (
    (p_order_item->>'fulfillment_type')::public.fulfillment_type,
    v_order_id,
    coalesce(p_order_item->'product_snapshot', '{}'::jsonb),
    (p_order_item->>'quantity')::integer,
    (p_order_item->>'total_minor')::integer,
    (p_order_item->>'unit_price_minor')::integer,
    coalesce(p_order_item->'variant_snapshot', '{}'::jsonb)
  )
  returning id into v_order_item_id;

  insert into public.payment_attempts (
    amount_minor,
    currency,
    order_id,
    provider,
    provider_reference,
    provider_status,
    raw_response,
    request_payload,
    response_payload,
    status
  )
  values (
    (p_payment_attempt->>'amount_minor')::integer,
    (p_payment_attempt->>'currency')::char(3),
    v_order_id,
    p_payment_attempt->>'provider',
    nullif(p_payment_attempt->>'provider_reference', ''),
    nullif(p_payment_attempt->>'provider_status', ''),
    coalesce(p_payment_attempt->'raw_response', '{}'::jsonb),
    coalesce(p_payment_attempt->'request_payload', '{}'::jsonb),
    coalesce(p_payment_attempt->'response_payload', '{}'::jsonb),
    (p_payment_attempt->>'status')::public.payment_status
  )
  returning id into v_payment_attempt_id;

  insert into public.token_allocations (
    bonus_amount,
    campaign_id,
    currency,
    metadata,
    normalized_address,
    order_id,
    package_id,
    payment_attempt_id,
    profile_id,
    status,
    token_amount,
    token_symbol,
    total_amount,
    total_price_minor,
    unit_price_minor,
    wallet_address,
    wallet_id
  )
  values (
    (p_allocation->>'bonus_amount')::numeric,
    v_campaign.id,
    p_allocation->>'currency',
    coalesce(p_allocation->'metadata', '{}'::jsonb) || jsonb_build_object('order_item_id', v_order_item_id),
    p_allocation->>'normalized_address',
    v_order_id,
    p_package_id,
    v_payment_attempt_id,
    p_profile_id,
    'pending',
    (p_allocation->>'token_amount')::numeric,
    v_campaign.token_symbol,
    v_requested_total,
    (p_allocation->>'total_price_minor')::integer,
    (p_allocation->>'unit_price_minor')::integer,
    p_allocation->>'wallet_address',
    nullif(p_allocation->>'wallet_id', '')::uuid
  );

  order_id := v_order_id;
  order_number := p_order->>'order_number';
  order_item_id := v_order_item_id;
  payment_attempt_id := v_payment_attempt_id;
  return next;
end;
$$;
