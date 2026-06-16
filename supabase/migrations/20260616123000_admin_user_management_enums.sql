alter type public.staff_role add value if not exists 'support';

alter type public.ioh_points_reason add value if not exists 'manual_adjustment_credit';
alter type public.ioh_points_reason add value if not exists 'manual_adjustment_debit';
