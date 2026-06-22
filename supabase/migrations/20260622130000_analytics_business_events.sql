-- Extend the analytics vocabulary and add a service-role-only writer for
-- server-side business events that do not belong to a browser session.

alter table public.analytics_events
  drop constraint if exists analytics_events_event_name_check;

alter table public.analytics_events
  add constraint analytics_events_event_name_check check (event_name in (
    'page_view',
    'signup',
    'login',
    'profile_completed',
    'product_view',
    'book_view',
    'add_to_cart',
    'checkout_started',
    'order_paid',
    'download_started',
    'download_completed',
    'download_failed',
    'amazon_verification_submitted',
    'amazon_verification_approved',
    'amazon_verification_rejected',
    'ioh_points_awarded',
    'encyclopedia_view'
  ));

create or replace function public.record_business_analytics_event(
  p_event_id uuid,
  p_event_name text,
  p_profile_id uuid,
  p_anonymous_id text,
  p_path text,
  p_route_group text,
  p_metadata jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted_id uuid;
begin
  insert into public.analytics_events (
    id,
    event_name,
    profile_id,
    anonymous_id,
    session_id,
    path,
    route_group,
    metadata
  ) values (
    p_event_id,
    p_event_name,
    p_profile_id,
    p_anonymous_id,
    null,
    p_path,
    p_route_group,
    coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict (id) do nothing
  returning id into v_inserted_id;

  return v_inserted_id is not null;
end;
$$;

revoke all on function public.record_business_analytics_event(
  uuid, text, uuid, text, text, text, jsonb
) from public, anon, authenticated;
grant execute on function public.record_business_analytics_event(
  uuid, text, uuid, text, text, text, jsonb
) to service_role;

