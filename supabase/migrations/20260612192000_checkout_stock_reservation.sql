create or replace function public.commit_checkout_payment_start(
  p_order jsonb,
  p_order_items jsonb,
  p_consent_events jsonb,
  p_payment_attempt jsonb,
  p_profile_marketing jsonb default '{}'::jsonb
)
returns table(order_id uuid, order_number text, payment_attempt_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid := coalesce((p_order->>'id')::uuid, gen_random_uuid());
  v_profile_id uuid := nullif(p_order->>'profile_id', '')::uuid;
  v_cart_id uuid := nullif(p_order->>'cart_id', '')::uuid;
  v_payment_attempt_id uuid;
  v_reserved_count integer;
  v_tracked_count integer;
begin
  insert into public.orders (
    id,
    billing_address,
    cart_id,
    currency,
    customer_email,
    customer_name,
    discount_minor,
    legal_acceptance,
    order_number,
    profile_id,
    shipping_address,
    shipping_minor,
    status,
    subtotal_minor,
    tax_minor,
    total_minor
  )
  values (
    v_order_id,
    coalesce(p_order->'billing_address', 'null'::jsonb),
    v_cart_id,
    (p_order->>'currency')::char(3),
    p_order->>'customer_email',
    nullif(p_order->>'customer_name', ''),
    coalesce((p_order->>'discount_minor')::integer, 0),
    coalesce(p_order->'legal_acceptance', '{}'::jsonb),
    p_order->>'order_number',
    v_profile_id,
    coalesce(p_order->'shipping_address', 'null'::jsonb),
    coalesce((p_order->>'shipping_minor')::integer, 0),
    'pending_payment',
    coalesce((p_order->>'subtotal_minor')::integer, 0),
    coalesce((p_order->>'tax_minor')::integer, 0),
    coalesce((p_order->>'total_minor')::integer, 0)
  );

  insert into public.consent_events (
    document_slug,
    document_version,
    email,
    event_kind,
    granted,
    metadata,
    order_id,
    profile_id,
    purpose
  )
  select
    item.document_slug,
    item.document_version,
    item.email,
    item.event_kind,
    item.granted,
    coalesce(item.metadata, '{}'::jsonb),
    v_order_id,
    v_profile_id,
    item.purpose
  from jsonb_to_recordset(coalesce(p_consent_events, '[]'::jsonb)) as item(
    document_slug text,
    document_version text,
    email text,
    event_kind text,
    granted boolean,
    metadata jsonb,
    purpose text
  );

  -- Stok rezervasyonu: stok takipli varyantlarda atomik kontrol + reserve
  with requested as (
    select (i->>'variant_id')::uuid as variant_id,
           (i->>'quantity')::integer as quantity
    from jsonb_array_elements(p_order_items) as i
  ),
  tracked as (
    select r.variant_id, r.quantity
    from requested r
    join public.product_variants pv on pv.id = r.variant_id
    where pv.stock_policy = 'track'
  ),
  reserved_rows as (
    update public.inventory_items inv
    set reserved = inv.reserved + t.quantity,
        updated_at = now()
    from tracked t
    where inv.variant_id = t.variant_id
      and inv.on_hand - inv.reserved >= t.quantity
    returning inv.variant_id
  )
  select
    (select count(*) from tracked),
    (select count(*) from reserved_rows)
  into v_tracked_count, v_reserved_count;

  if v_reserved_count <> v_tracked_count then
    raise exception 'insufficient_stock' using errcode = 'P0001';
  end if;

  insert into public.order_items (
    fulfillment_type,
    order_id,
    product_snapshot,
    quantity,
    total_minor,
    unit_price_minor,
    variant_id,
    variant_snapshot
  )
  select
    item.fulfillment_type,
    v_order_id,
    item.product_snapshot,
    item.quantity,
    item.total_minor,
    item.unit_price_minor,
    item.variant_id,
    item.variant_snapshot
  from jsonb_to_recordset(p_order_items) as item(
    fulfillment_type public.fulfillment_type,
    product_snapshot jsonb,
    quantity integer,
    total_minor integer,
    unit_price_minor integer,
    variant_id uuid,
    variant_snapshot jsonb
  );

  insert into public.payment_attempts (
    amount_minor,
    currency,
    failure_message,
    failure_reason,
    order_id,
    provider,
    provider_reference,
    provider_status,
    provider_token,
    raw_response,
    request_payload,
    response_payload,
    status
  )
  values (
    (p_payment_attempt->>'amount_minor')::integer,
    (p_payment_attempt->>'currency')::char(3),
    nullif(p_payment_attempt->>'failure_message', ''),
    nullif(p_payment_attempt->>'failure_reason', ''),
    v_order_id,
    p_payment_attempt->>'provider',
    nullif(p_payment_attempt->>'provider_reference', ''),
    nullif(p_payment_attempt->>'provider_status', ''),
    nullif(p_payment_attempt->>'provider_token', ''),
    coalesce(p_payment_attempt->'raw_response', '{}'::jsonb),
    coalesce(p_payment_attempt->'request_payload', '{}'::jsonb),
    coalesce(p_payment_attempt->'response_payload', '{}'::jsonb),
    (p_payment_attempt->>'status')::public.payment_status
  )
  returning id into v_payment_attempt_id;

  if v_profile_id is not null and p_profile_marketing ? 'marketing_email_opt_in' then
    update public.profiles
    set
      marketing_email_opt_in = (p_profile_marketing->>'marketing_email_opt_in')::boolean,
      marketing_sms_opt_in = (p_profile_marketing->>'marketing_sms_opt_in')::boolean
    where id = v_profile_id;
  end if;

  order_id := v_order_id;
  order_number := p_order->>'order_number';
  payment_attempt_id := v_payment_attempt_id;
  return next;
end;
$$;

create or replace function public.release_order_reservation(p_order_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.inventory_items inv
  set reserved = greatest(inv.reserved - oi.quantity, 0), updated_at = now()
  from public.order_items oi
  join public.product_variants pv on pv.id = oi.variant_id
  where oi.order_id = p_order_id
    and pv.stock_policy = 'track'
    and inv.variant_id = oi.variant_id;
$$;

create or replace function public.commit_order_stock(p_order_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.inventory_items inv
  set on_hand = greatest(inv.on_hand - oi.quantity, 0),
      reserved = greatest(inv.reserved - oi.quantity, 0),
      updated_at = now()
  from public.order_items oi
  join public.product_variants pv on pv.id = oi.variant_id
  where oi.order_id = p_order_id
    and pv.stock_policy = 'track'
    and inv.variant_id = oi.variant_id;
$$;
