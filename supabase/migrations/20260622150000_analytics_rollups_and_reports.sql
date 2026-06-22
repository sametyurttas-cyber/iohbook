-- Daily analytics aggregation and read-only detail report for admin analytics.

create or replace function public.refresh_analytics_daily_rollups(
  p_days integer default 30
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows integer;
begin
  if p_days < 1 or p_days > 90 then
    raise exception 'analytics_rollup_invalid_range' using errcode = '22023';
  end if;

  with days as (
    select generate_series(
      current_date - (p_days - 1),
      current_date,
      interval '1 day'
    )::date as day
  ),
  event_totals as (
    select
      created_at::date as day,
      count(*) filter (where event_name = 'page_view')::integer as page_views,
      count(distinct coalesce(profile_id::text, anonymous_id))
        filter (where event_name = 'page_view')::integer as unique_visitors,
      count(*) filter (where event_name = 'signup')::integer as signups,
      count(*) filter (where event_name = 'download_completed')::integer as downloads,
      count(*) filter (where event_name = 'amazon_verification_submitted')::integer as amazon_submissions
    from public.analytics_events
    where created_at >= current_date - (p_days - 1)
      and created_at < current_date + 1
    group by created_at::date
  ),
  order_totals as (
    select
      paid_at::date as day,
      count(*)::integer as orders_paid,
      coalesce(sum(total_minor), 0)::bigint as revenue_minor
    from public.orders
    where status in ('paid', 'fulfilled', 'completed')
      and paid_at >= current_date - (p_days - 1)
      and paid_at < current_date + 1
    group by paid_at::date
  ),
  point_totals as (
    select
      created_at::date as day,
      coalesce(sum(greatest(amount, 0)), 0)::bigint as ioh_points_awarded
    from public.ioh_point_ledger
    where created_at >= current_date - (p_days - 1)
      and created_at < current_date + 1
    group by created_at::date
  )
  insert into public.analytics_daily_rollups (
    day,
    page_views,
    unique_visitors,
    signups,
    orders_paid,
    revenue_minor,
    downloads,
    amazon_submissions,
    ioh_points_awarded
  )
  select
    d.day,
    coalesce(e.page_views, 0),
    coalesce(e.unique_visitors, 0),
    coalesce(e.signups, 0),
    coalesce(o.orders_paid, 0),
    coalesce(o.revenue_minor, 0),
    coalesce(e.downloads, 0),
    coalesce(e.amazon_submissions, 0),
    coalesce(p.ioh_points_awarded, 0)
  from days d
  left join event_totals e on e.day = d.day
  left join order_totals o on o.day = d.day
  left join point_totals p on p.day = d.day
  on conflict (day) do update set
    page_views = excluded.page_views,
    unique_visitors = excluded.unique_visitors,
    signups = excluded.signups,
    orders_paid = excluded.orders_paid,
    revenue_minor = excluded.revenue_minor,
    downloads = excluded.downloads,
    amazon_submissions = excluded.amazon_submissions,
    ioh_points_awarded = excluded.ioh_points_awarded,
    updated_at = now();

  get diagnostics v_rows = row_count;
  return v_rows;
end;
$$;

create or replace function public.get_admin_analytics_report(
  p_actor_profile_id uuid,
  p_days integer default 30
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start_date date;
begin
  if not exists (
    select 1
    from public.staff_roles sr
    where sr.profile_id = p_actor_profile_id
      and sr.revoked_at is null
      and sr.role in ('owner', 'admin_ops', 'support')
  ) then
    raise exception 'admin_analytics_forbidden' using errcode = '42501';
  end if;

  if p_days not in (7, 30, 90) then
    raise exception 'admin_analytics_invalid_range' using errcode = '22023';
  end if;

  v_start_date := current_date - (p_days - 1);

  return jsonb_build_object(
    'summary', jsonb_build_object(
      'page_views', coalesce((select sum(page_views) from public.analytics_daily_rollups where day >= v_start_date), 0),
      'unique_visitors', coalesce((
        select count(distinct coalesce(profile_id::text, anonymous_id))
        from public.analytics_events
        where event_name = 'page_view'
          and created_at >= v_start_date
      ), 0),
      'signups', coalesce((select sum(signups) from public.analytics_daily_rollups where day >= v_start_date), 0),
      'orders_paid', coalesce((select sum(orders_paid) from public.analytics_daily_rollups where day >= v_start_date), 0),
      'revenue_minor', coalesce((select sum(revenue_minor) from public.analytics_daily_rollups where day >= v_start_date), 0),
      'downloads', coalesce((select sum(downloads) from public.analytics_daily_rollups where day >= v_start_date), 0)
    ),
    'series', coalesce((
      select jsonb_agg(jsonb_build_object(
        'day', r.day,
        'page_views', r.page_views,
        'unique_visitors', r.unique_visitors,
        'signups', r.signups,
        'orders_paid', r.orders_paid,
        'revenue_minor', r.revenue_minor,
        'downloads', r.downloads,
        'amazon_submissions', r.amazon_submissions,
        'ioh_points_awarded', r.ioh_points_awarded
      ) order by r.day)
      from public.analytics_daily_rollups r
      where r.day >= v_start_date
    ), '[]'::jsonb),
    'top_pages', coalesce((
      select jsonb_agg(to_jsonb(top_page) order by top_page.views desc, top_page.path)
      from (
        select e.path, count(*)::bigint as views
        from public.analytics_events e
        where e.event_name = 'page_view' and e.created_at >= v_start_date
        group by e.path
        order by views desc, e.path
        limit 20
      ) top_page
    ), '[]'::jsonb),
    'traffic_sources', coalesce((
      select jsonb_agg(to_jsonb(source_row) order by source_row.views desc, source_row.label)
      from (
        select coalesce(nullif(e.utm_source, ''), nullif(e.referrer, ''), 'direct') as label,
               count(*)::bigint as views
        from public.analytics_events e
        where e.event_name = 'page_view' and e.created_at >= v_start_date
        group by 1
        order by views desc, label
        limit 20
      ) source_row
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_agg(to_jsonb(device_row) order by device_row.views desc, device_row.label)
      from (
        select coalesce(e.device_type, 'unknown') as label, count(*)::bigint as views
        from public.analytics_events e
        where e.event_name = 'page_view' and e.created_at >= v_start_date
        group by 1
        order by views desc, label
      ) device_row
    ), '[]'::jsonb),
    'utm_campaigns', coalesce((
      select jsonb_agg(to_jsonb(campaign_row) order by campaign_row.views desc, campaign_row.label)
      from (
        select e.utm_campaign as label, count(*)::bigint as views
        from public.analytics_events e
        where e.event_name = 'page_view'
          and e.created_at >= v_start_date
          and e.utm_campaign is not null
        group by e.utm_campaign
        order by views desc, label
        limit 20
      ) campaign_row
    ), '[]'::jsonb),
    'referrers', coalesce((
      select jsonb_agg(to_jsonb(referrer_row) order by referrer_row.views desc, referrer_row.label)
      from (
        select e.referrer as label, count(*)::bigint as views
        from public.analytics_events e
        where e.event_name = 'page_view'
          and e.created_at >= v_start_date
          and e.referrer is not null
        group by e.referrer
        order by views desc, label
        limit 20
      ) referrer_row
    ), '[]'::jsonb),
    'funnel', coalesce((
      select jsonb_agg(jsonb_build_object('event_name', f.event_name, 'count', coalesce(c.count, 0)) order by f.position)
      from (values
        (1, 'page_view'),
        (2, 'signup'),
        (3, 'book_view'),
        (4, 'add_to_cart'),
        (5, 'checkout_started'),
        (6, 'order_paid'),
        (7, 'download_completed'),
        (8, 'amazon_verification_submitted')
      ) as f(position, event_name)
      left join (
        select e.event_name, count(*)::bigint as count
        from public.analytics_events e
        where e.created_at >= v_start_date
        group by e.event_name
      ) c on c.event_name = f.event_name
    ), '[]'::jsonb),
    'encyclopedia', coalesce((
      select jsonb_agg(to_jsonb(entity_row) order by entity_row.views desc, entity_row.entity_title)
      from (
        select
          e.metadata->>'entity_type' as entity_type,
          e.metadata->>'entity_slug' as entity_slug,
          e.metadata->>'entity_title' as entity_title,
          count(*)::bigint as views
        from public.analytics_events e
        where e.event_name = 'encyclopedia_view'
          and e.created_at >= v_start_date
          and e.metadata->>'entity_type' in ('character', 'city', 'faction')
        group by 1, 2, 3
        order by views desc, entity_title
        limit 30
      ) entity_row
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.refresh_analytics_daily_rollups(integer) from public, anon, authenticated;
revoke all on function public.get_admin_analytics_report(uuid, integer) from public, anon, authenticated;

grant execute on function public.refresh_analytics_daily_rollups(integer) to service_role;
grant execute on function public.get_admin_analytics_report(uuid, integer) to service_role;
