-- Allows fulfillment staff to read payment status while operating orders.
create policy payment_attempts_fulfillment_select
on public.payment_attempts
for select
using (public.is_staff(array['owner', 'admin_ops', 'fulfillment']::public.staff_role[]));
