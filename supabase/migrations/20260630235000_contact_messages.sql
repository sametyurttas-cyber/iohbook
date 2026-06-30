-- Create contact_messages table to store support tickets and contact signals
create table public.contact_messages (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null check (char_length(name) >= 2 and char_length(name) <= 100),
    email text not null check (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$'),
    purpose text not null check (purpose in ('press', 'partnership', 'support', 'tech', 'other')),
    subject text check (char_length(subject) <= 200),
    message text not null check (char_length(message) >= 10 and char_length(message) <= 5000),
    status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
    admin_notes text check (char_length(admin_notes) <= 10000),
    user_id uuid references public.profiles(id) on delete set null,
    ip_address text
);

-- Enable RLS
alter table public.contact_messages enable row level security;

-- Policies:
-- 1. Anyone (anonymous or authenticated) can insert contact messages.
create policy "contact_messages_insert_public"
on public.contact_messages
for insert
with check (true);

-- 2. Only staff members with role owner or admin_ops can select.
create policy "contact_messages_select_staff"
on public.contact_messages
for select
using (public.is_staff(array['owner','admin_ops']::public.staff_role[]));

-- 3. Only staff members with role owner or admin_ops can update.
create policy "contact_messages_update_staff"
on public.contact_messages
for update
using (public.is_staff(array['owner','admin_ops']::public.staff_role[]))
with check (public.is_staff(array['owner','admin_ops']::public.staff_role[]));

-- 4. Only staff members with role owner or admin_ops can delete.
create policy "contact_messages_delete_staff"
on public.contact_messages
for delete
using (public.is_staff(array['owner','admin_ops']::public.staff_role[]));

-- Indexes for performance
create index contact_messages_status_idx on public.contact_messages(status);
create index contact_messages_purpose_idx on public.contact_messages(purpose);
create index contact_messages_created_at_idx on public.contact_messages(created_at desc);
