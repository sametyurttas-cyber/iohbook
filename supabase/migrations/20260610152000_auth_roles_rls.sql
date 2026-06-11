create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_staff(allowed_roles public.staff_role[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_roles
    where staff_roles.profile_id = auth.uid()
      and staff_roles.revoked_at is null
      and (allowed_roles is null or staff_roles.role = any(allowed_roles))
  );
$$;

comment on function public.handle_new_user() is
  'Bootstraps public.profiles when Supabase Auth creates a user.';
comment on function public.is_staff(public.staff_role[]) is
  'Checks whether the current auth.uid has an active staff role, optionally limited to the given roles.';

alter table public.profiles enable row level security;
alter table public.staff_roles enable row level security;
alter table public.addresses enable row level security;
alter table public.content_pages enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_media enable row level security;
alter table public.inventory_items enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_attempts enable row level security;
alter table public.fulfillment_shipments enable row level security;
alter table public.discount_rules enable row level security;
alter table public.entitlements enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_select_own
  on public.profiles for select
  using (id = auth.uid());
comment on policy profiles_select_own on public.profiles is
  'Customers can read only their own profile.';

create policy profiles_insert_own
  on public.profiles for insert
  with check (id = auth.uid());
comment on policy profiles_insert_own on public.profiles is
  'Authenticated users may create their own profile if bootstrap did not already do it.';

create policy profiles_update_own
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());
comment on policy profiles_update_own on public.profiles is
  'Customers can update only their own profile.';

create policy profiles_staff_select
  on public.profiles for select
  using (public.is_staff(array['owner','admin_ops','fulfillment']::public.staff_role[]));
comment on policy profiles_staff_select on public.profiles is
  'Operational staff can read customer profiles needed for support and fulfillment.';

create policy profiles_owner_update
  on public.profiles for update
  using (public.is_staff(array['owner']::public.staff_role[]))
  with check (public.is_staff(array['owner']::public.staff_role[]));
comment on policy profiles_owner_update on public.profiles is
  'Owners can update profiles for account support operations.';

create policy staff_roles_select_own
  on public.staff_roles for select
  using (profile_id = auth.uid() and revoked_at is null);
comment on policy staff_roles_select_own on public.staff_roles is
  'Staff users can see their own active roles.';

create policy staff_roles_select_staff_admins
  on public.staff_roles for select
  using (public.is_staff(array['owner','admin_ops']::public.staff_role[]));
comment on policy staff_roles_select_staff_admins on public.staff_roles is
  'Owners and admin ops can inspect role assignments.';

create policy staff_roles_owner_manage
  on public.staff_roles for all
  using (public.is_staff(array['owner']::public.staff_role[]))
  with check (public.is_staff(array['owner']::public.staff_role[]));
comment on policy staff_roles_owner_manage on public.staff_roles is
  'Only owners can grant, update, or revoke staff roles.';

create policy addresses_manage_own
  on public.addresses for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());
comment on policy addresses_manage_own on public.addresses is
  'Customers can create, read, update, and delete their own addresses.';

create policy addresses_staff_select
  on public.addresses for select
  using (public.is_staff(array['owner','admin_ops','fulfillment']::public.staff_role[]));
comment on policy addresses_staff_select on public.addresses is
  'Operations staff can read addresses for order fulfillment and support.';

create policy content_pages_public_published
  on public.content_pages for select
  using (status = 'published');
comment on policy content_pages_public_published on public.content_pages is
  'Anyone can read published content pages.';

create policy content_pages_staff_manage
  on public.content_pages for all
  using (public.is_staff(array['owner','admin_ops','editor']::public.staff_role[]))
  with check (public.is_staff(array['owner','admin_ops','editor']::public.staff_role[]));
comment on policy content_pages_staff_manage on public.content_pages is
  'Editorial and admin staff can manage CMS pages.';

create policy collections_public_published
  on public.collections for select
  using (status = 'published');
comment on policy collections_public_published on public.collections is
  'Anyone can read published collections.';

create policy collections_staff_manage
  on public.collections for all
  using (public.is_staff(array['owner','admin_ops','editor']::public.staff_role[]))
  with check (public.is_staff(array['owner','admin_ops','editor']::public.staff_role[]));
comment on policy collections_staff_manage on public.collections is
  'Staff can manage collection and campaign records.';

create policy products_public_active
  on public.products for select
  using (status = 'active' and published_at is not null and published_at <= now());
comment on policy products_public_active on public.products is
  'Anyone can read active, published products.';

create policy products_staff_manage
  on public.products for all
  using (public.is_staff(array['owner','admin_ops','editor']::public.staff_role[]))
  with check (public.is_staff(array['owner','admin_ops','editor']::public.staff_role[]));
comment on policy products_staff_manage on public.products is
  'Staff can create and manage product records.';

create policy product_variants_public_active
  on public.product_variants for select
  using (
    active = true
    and exists (
      select 1
      from public.products
      where products.id = product_variants.product_id
        and products.status = 'active'
        and products.published_at is not null
        and products.published_at <= now()
    )
  );
comment on policy product_variants_public_active on public.product_variants is
  'Anyone can read active variants for published products.';

create policy product_variants_staff_manage
  on public.product_variants for all
  using (public.is_staff(array['owner','admin_ops','editor']::public.staff_role[]))
  with check (public.is_staff(array['owner','admin_ops','editor']::public.staff_role[]));
comment on policy product_variants_staff_manage on public.product_variants is
  'Staff can manage sellable variants.';

create policy product_media_public_visible
  on public.product_media for select
  using (
    exists (
      select 1
      from public.products
      where products.id = product_media.product_id
        and products.status = 'active'
        and products.published_at is not null
        and products.published_at <= now()
    )
    or exists (
      select 1
      from public.product_variants
      join public.products on products.id = product_variants.product_id
      where product_variants.id = product_media.variant_id
        and product_variants.active = true
        and products.status = 'active'
        and products.published_at is not null
        and products.published_at <= now()
    )
  );
comment on policy product_media_public_visible on public.product_media is
  'Anyone can read media attached to published products or active published variants.';

create policy product_media_staff_manage
  on public.product_media for all
  using (public.is_staff(array['owner','admin_ops','editor']::public.staff_role[]))
  with check (public.is_staff(array['owner','admin_ops','editor']::public.staff_role[]));
comment on policy product_media_staff_manage on public.product_media is
  'Staff can manage product media metadata.';

create policy inventory_items_public_read
  on public.inventory_items for select
  using (
    exists (
      select 1
      from public.product_variants
      join public.products on products.id = product_variants.product_id
      where product_variants.id = inventory_items.variant_id
        and product_variants.active = true
        and products.status = 'active'
        and products.published_at is not null
        and products.published_at <= now()
    )
  );
comment on policy inventory_items_public_read on public.inventory_items is
  'Anyone can read stock summary for active published variants.';

create policy inventory_items_staff_manage
  on public.inventory_items for all
  using (public.is_staff(array['owner','admin_ops','fulfillment']::public.staff_role[]))
  with check (public.is_staff(array['owner','admin_ops','fulfillment']::public.staff_role[]));
comment on policy inventory_items_staff_manage on public.inventory_items is
  'Operations staff can manage inventory records.';

create policy carts_manage_own
  on public.carts for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());
comment on policy carts_manage_own on public.carts is
  'Authenticated customers can manage their own carts.';

create policy carts_staff_select
  on public.carts for select
  using (public.is_staff(array['owner','admin_ops']::public.staff_role[]));
comment on policy carts_staff_select on public.carts is
  'Admin staff can inspect carts for support and conversion analysis.';

create policy cart_items_manage_own_cart
  on public.cart_items for all
  using (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
        and carts.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.carts
      where carts.id = cart_items.cart_id
        and carts.profile_id = auth.uid()
    )
  );
comment on policy cart_items_manage_own_cart on public.cart_items is
  'Customers can manage line items only in their own cart.';

create policy cart_items_staff_select
  on public.cart_items for select
  using (public.is_staff(array['owner','admin_ops']::public.staff_role[]));
comment on policy cart_items_staff_select on public.cart_items is
  'Admin staff can inspect cart items for support.';

create policy orders_select_own
  on public.orders for select
  using (profile_id = auth.uid());
comment on policy orders_select_own on public.orders is
  'Customers can read their own orders.';

create policy orders_staff_manage
  on public.orders for all
  using (public.is_staff(array['owner','admin_ops','fulfillment']::public.staff_role[]))
  with check (public.is_staff(array['owner','admin_ops','fulfillment']::public.staff_role[]));
comment on policy orders_staff_manage on public.orders is
  'Operations staff can manage order lifecycle records.';

create policy order_items_select_own_order
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.profile_id = auth.uid()
    )
  );
comment on policy order_items_select_own_order on public.order_items is
  'Customers can read items belonging to their own orders.';

create policy order_items_staff_manage
  on public.order_items for all
  using (public.is_staff(array['owner','admin_ops','fulfillment']::public.staff_role[]))
  with check (public.is_staff(array['owner','admin_ops','fulfillment']::public.staff_role[]));
comment on policy order_items_staff_manage on public.order_items is
  'Operations staff can manage order item records.';

create policy payment_attempts_staff_manage
  on public.payment_attempts for all
  using (public.is_staff(array['owner','admin_ops']::public.staff_role[]))
  with check (public.is_staff(array['owner','admin_ops']::public.staff_role[]));
comment on policy payment_attempts_staff_manage on public.payment_attempts is
  'Only admin staff can inspect or manage payment attempts; customers do not read provider payloads.';

create policy fulfillment_shipments_select_own_order
  on public.fulfillment_shipments for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = fulfillment_shipments.order_id
        and orders.profile_id = auth.uid()
    )
  );
comment on policy fulfillment_shipments_select_own_order on public.fulfillment_shipments is
  'Customers can read shipment records for their own orders.';

create policy fulfillment_shipments_staff_manage
  on public.fulfillment_shipments for all
  using (public.is_staff(array['owner','admin_ops','fulfillment']::public.staff_role[]))
  with check (public.is_staff(array['owner','admin_ops','fulfillment']::public.staff_role[]));
comment on policy fulfillment_shipments_staff_manage on public.fulfillment_shipments is
  'Fulfillment staff can create and update shipment records.';

create policy discount_rules_public_active
  on public.discount_rules for select
  using (
    status = 'active'
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );
comment on policy discount_rules_public_active on public.discount_rules is
  'Anyone can read currently active discount rules for checkout validation.';

create policy discount_rules_staff_manage
  on public.discount_rules for all
  using (public.is_staff(array['owner','admin_ops']::public.staff_role[]))
  with check (public.is_staff(array['owner','admin_ops']::public.staff_role[]));
comment on policy discount_rules_staff_manage on public.discount_rules is
  'Admin staff can manage discount rules.';

create policy entitlements_select_own
  on public.entitlements for select
  using (profile_id = auth.uid());
comment on policy entitlements_select_own on public.entitlements is
  'Customers can read their own digital or claimable entitlements.';

create policy entitlements_staff_manage
  on public.entitlements for all
  using (public.is_staff(array['owner','admin_ops']::public.staff_role[]))
  with check (public.is_staff(array['owner','admin_ops']::public.staff_role[]));
comment on policy entitlements_staff_manage on public.entitlements is
  'Admin staff can create and revoke entitlement records.';

create policy audit_logs_staff_insert
  on public.audit_logs for insert
  with check (public.is_staff() and actor_profile_id = auth.uid());
comment on policy audit_logs_staff_insert on public.audit_logs is
  'Staff can write audit entries for their own admin actions.';

create policy audit_logs_staff_select
  on public.audit_logs for select
  using (public.is_staff(array['owner','admin_ops']::public.staff_role[]));
comment on policy audit_logs_staff_select on public.audit_logs is
  'Owners and admin ops can review audit history.';
