update public.carts c
set status = 'abandoned'
where c.status = 'active'
  and exists (
    select 1 from public.carts c2
    where c2.status = 'active'
      and c2.id <> c.id
      and ((c2.profile_id is not null and c2.profile_id = c.profile_id)
        or (c2.anonymous_id is not null and c2.anonymous_id = c.anonymous_id))
      and c2.created_at > c.created_at
  );

create unique index if not exists carts_one_active_per_profile_idx
  on public.carts(profile_id) where status = 'active' and profile_id is not null;

create unique index if not exists carts_one_active_per_anon_idx
  on public.carts(anonymous_id) where status = 'active' and anonymous_id is not null;
