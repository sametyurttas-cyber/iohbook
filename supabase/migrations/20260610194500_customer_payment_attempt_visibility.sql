create policy payment_attempts_select_own_order
  on public.payment_attempts for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = payment_attempts.order_id
        and orders.profile_id = auth.uid()
    )
  );

comment on policy payment_attempts_select_own_order on public.payment_attempts is
  'Customers can read payment attempt status for their own orders, without write access.';
