-- Allow support role to read email templates and events
create policy email_templates_support_select
  on public.email_templates for select
  using (public.is_staff(array['support']::public.staff_role[]));

create policy email_events_support_select
  on public.email_events for select
  using (public.is_staff(array['support']::public.staff_role[]));
