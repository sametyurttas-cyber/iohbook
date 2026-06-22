-- Read-only aggregates for the admin operations dashboard.
-- Functions are service-role only and also verify the acting staff profile.

create or replace function public.get_admin_dashboard_metrics(
  p_actor_profile_id uuid
)
returns table (
  total_users bigint,
  new_users_7d bigint,
  paid_orders bigint,
  total_revenue_minor bigint,
  total_ioh_distributed bigint,
  pending_verifications bigint,
  total_downloads bigint,
  visitors_today bigint,
  page_views_24h bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.staff_roles sr
    where sr.profile_id = p_actor_profile_id
      and sr.revoked_at is null
      and sr.role in ('owner', 'admin_ops')
  ) then
    raise exception 'admin_dashboard_forbidden' using errcode = '42501';
  end if;

  return query
  select
    (select count(*) from public.profiles),
    (select count(*) from public.profiles where created_at >= now() - interval '7 days'),
    (select count(*) from public.orders where status in ('paid', 'fulfilled', 'completed')),
    coalesce((
      select sum(total_minor)
      from public.orders
      where status in ('paid', 'fulfilled', 'completed')
    ), 0)::bigint,
    coalesce((
      select sum(greatest(amount, 0))
      from public.ioh_point_ledger
    ), 0)::bigint,
    (select count(*) from public.verification_submissions where status in ('pending', 'under_review')),
    coalesce((select sum(download_count) from public.entitlements), 0)::bigint,
    (
      select count(distinct coalesce(profile_id::text, anonymous_id))
      from public.analytics_events
      where event_name = 'page_view'
        and created_at >= date_trunc('day', now())
    ),
    (
      select count(*)
      from public.analytics_events
      where event_name = 'page_view'
        and created_at >= now() - interval '24 hours'
    );
end;
$$;

create or replace function public.get_admin_dashboard_series(
  p_actor_profile_id uuid,
  p_days integer default 30
)
returns table (
  day date,
  page_views bigint,
  new_users bigint,
  paid_orders bigint,
  revenue_minor bigint,
  ioh_points bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.staff_roles sr
    where sr.profile_id = p_actor_profile_id
      and sr.revoked_at is null
      and sr.role in ('owner', 'admin_ops')
  ) then
    raise exception 'admin_dashboard_forbidden' using errcode = '42501';
  end if;

  if p_days < 1 or p_days > 90 then
    raise exception 'admin_dashboard_invalid_range' using errcode = '22023';
  end if;

  return query
  with days as (
    select generate_series(
      current_date - (p_days - 1),
      current_date,
      interval '1 day'
    )::date as day
  )
  select
    d.day,
    coalesce(
      (select r.page_views::bigint from public.analytics_daily_rollups r where r.day = d.day),
      (select count(*) from public.analytics_events e where e.event_name = 'page_view' and e.created_at >= d.day and e.created_at < d.day + 1),
      0
    )::bigint,
    (select count(*) from public.profiles p where p.created_at >= d.day and p.created_at < d.day + 1),
    (select count(*) from public.orders o where o.status in ('paid', 'fulfilled', 'completed') and o.paid_at >= d.day and o.paid_at < d.day + 1),
    coalesce((select sum(o.total_minor) from public.orders o where o.status in ('paid', 'fulfilled', 'completed') and o.paid_at >= d.day and o.paid_at < d.day + 1), 0)::bigint,
    coalesce((select sum(greatest(l.amount, 0)) from public.ioh_point_ledger l where l.created_at >= d.day and l.created_at < d.day + 1), 0)::bigint
  from days d
  order by d.day;
end;
$$;

create or replace function public.get_admin_dashboard_top_pages(
  p_actor_profile_id uuid,
  p_limit integer default 10
)
returns table (
  path text,
  views bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.staff_roles sr
    where sr.profile_id = p_actor_profile_id
      and sr.revoked_at is null
      and sr.role in ('owner', 'admin_ops')
  ) then
    raise exception 'admin_dashboard_forbidden' using errcode = '42501';
  end if;

  return query
  select e.path, count(*)::bigint as views
  from public.analytics_events e
  where e.event_name = 'page_view'
    and e.created_at >= now() - interval '30 days'
  group by e.path
  order by views desc, e.path
  limit least(greatest(p_limit, 1), 50);
end;
$$;

revoke all on function public.get_admin_dashboard_metrics(uuid) from public, anon, authenticated;
revoke all on function public.get_admin_dashboard_series(uuid, integer) from public, anon, authenticated;
revoke all on function public.get_admin_dashboard_top_pages(uuid, integer) from public, anon, authenticated;

grant execute on function public.get_admin_dashboard_metrics(uuid) to service_role;
grant execute on function public.get_admin_dashboard_series(uuid, integer) to service_role;
grant execute on function public.get_admin_dashboard_top_pages(uuid, integer) to service_role;
