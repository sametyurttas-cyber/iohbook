-- Amazon verification and message center infrastructure.
-- Tables: verification_submissions, submission_replies, verification_attachments.
-- Storage: verification-attachments (private).
-- RLS: customer owns their rows; staff roles have operational access.

-- ───────────────────────── Enums ─────────────────────────

create type public.submission_kind as enum (
  'amazon_purchase',
  'amazon_review',
  'general_message'
);

create type public.submission_status as enum (
  'pending',
  'under_review',
  'approved',
  'rejected',
  'responded',
  'closed'
);

-- Extend IOH point reasons for verification rewards.
alter type public.ioh_points_reason
  add value if not exists 'amazon_purchase_verification';

alter type public.ioh_points_reason
  add value if not exists 'amazon_review_verification';

-- ───────────────────────── verification_submissions ─────────────────────────

create table public.verification_submissions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind public.submission_kind not null,
  book_slug text,
  title text not null,
  body text,
  amazon_order_id text,
  amazon_review_url text,
  amazon_profile_name text,
  status public.submission_status not null default 'pending',
  reward_amount integer not null default 0,
  reward_reason text,
  reward_ledger_id uuid,
  rewarded_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  admin_notes text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint verification_submissions_reward_non_negative
    check (reward_amount >= 0),
  constraint verification_submissions_book_slug_valid
    check (book_slug is null or book_slug in ('godcode', 'codewar', 'sysgod')),
  constraint verification_submissions_purchase_has_order
    check (kind <> 'amazon_purchase' or amazon_order_id is not null),
  constraint verification_submissions_purchase_has_book
    check (kind <> 'amazon_purchase' or book_slug is not null),
  constraint verification_submissions_review_has_url
    check (kind <> 'amazon_review' or amazon_review_url is not null),
  constraint verification_submissions_review_has_book
    check (kind <> 'amazon_review' or book_slug is not null),
  constraint verification_submissions_message_has_body
    check (kind <> 'general_message' or body is not null or length(title) > 0)
);

create index verification_submissions_profile_idx
  on public.verification_submissions(profile_id);

create index verification_submissions_kind_idx
  on public.verification_submissions(kind);

create index verification_submissions_status_idx
  on public.verification_submissions(status);

create index verification_submissions_book_slug_idx
  on public.verification_submissions(book_slug);

create index verification_submissions_created_desc_idx
  on public.verification_submissions(created_at desc);

-- Idempotency: same user + book + kind can only be approved once.
-- Prevents double reward for the same book and verification type.
create unique index verification_submissions_approved_unique_idx
  on public.verification_submissions(profile_id, book_slug, kind)
  where status = 'approved'
    and kind in ('amazon_purchase', 'amazon_review')
    and book_slug is not null;

-- Idempotency: same review URL can only be approved once across all users.
-- Prevents multiple users from claiming the same Amazon review.
create unique index verification_submissions_review_url_approved_unique_idx
  on public.verification_submissions(amazon_review_url)
  where status = 'approved'
    and kind = 'amazon_review'
    and amazon_review_url is not null;

-- Idempotency: one reward ledger entry per submission.
create unique index verification_submissions_reward_ledger_unique_idx
  on public.verification_submissions(reward_ledger_id)
  where reward_ledger_id is not null;

create trigger verification_submissions_set_updated_at
  before update on public.verification_submissions
  for each row execute function public.set_updated_at();

-- ───────────────────────── submission_replies ─────────────────────────

create table public.submission_replies (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.verification_submissions(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  is_staff boolean not null default false,
  body text not null,
  created_at timestamptz not null default now()
);

create index submission_replies_submission_created_idx
  on public.submission_replies(submission_id, created_at);

create index submission_replies_profile_idx
  on public.submission_replies(profile_id);

-- ───────────────────────── verification_attachments ─────────────────────────

create table public.verification_attachments (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.verification_submissions(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  bucket text not null default 'verification-attachments',
  path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes integer not null,
  created_at timestamptz not null default now(),
  constraint verification_attachments_size_positive
    check (size_bytes > 0)
);

create index verification_attachments_submission_idx
  on public.verification_attachments(submission_id);

create index verification_attachments_profile_idx
  on public.verification_attachments(profile_id);

create unique index verification_attachments_path_unique_idx
  on public.verification_attachments(path);

-- ───────────────────────── Storage bucket ─────────────────────────

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'verification-attachments',
    'verification-attachments',
    false,
    10485760,
    array['image/jpeg','image/png','image/webp','application/pdf']::text[]
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ───────────────────────── RLS: verification_submissions ─────────────────────────

alter table public.verification_submissions enable row level security;

create policy verification_submissions_select_own
  on public.verification_submissions for select
  using (profile_id = auth.uid());
comment on policy verification_submissions_select_own on public.verification_submissions is
  'Customers can read their own verification submissions.';

create policy verification_submissions_insert_own
  on public.verification_submissions for insert
  with check (profile_id = auth.uid());
comment on policy verification_submissions_insert_own on public.verification_submissions is
  'Customers can create verification submissions on their own behalf.';

create policy verification_submissions_update_own
  on public.verification_submissions for update
  using (profile_id = auth.uid() and status in ('pending', 'responded'))
  with check (profile_id = auth.uid() and status in ('pending', 'responded'));
comment on policy verification_submissions_update_own on public.verification_submissions is
  'Customers can update their own submissions only while pending or responded.';

create policy verification_submissions_staff_manage
  on public.verification_submissions for all
  using (public.is_staff(array['owner','admin_ops']::public.staff_role[]))
  with check (public.is_staff(array['owner','admin_ops']::public.staff_role[]));
comment on policy verification_submissions_staff_manage on public.verification_submissions is
  'Owners and admin_ops can manage all verification submissions.';

create policy verification_submissions_support_read
  on public.verification_submissions for select
  using (public.is_staff(array['support']::public.staff_role[]));
comment on policy verification_submissions_support_read on public.verification_submissions is
  'Support staff can read verification submissions but cannot modify them.';

-- ───────────────────────── RLS: submission_replies ─────────────────────────

alter table public.submission_replies enable row level security;

create policy submission_replies_select_own_submission
  on public.submission_replies for select
  using (
    exists (
      select 1 from public.verification_submissions
      where verification_submissions.id = submission_replies.submission_id
        and verification_submissions.profile_id = auth.uid()
    )
  );
comment on policy submission_replies_select_own_submission on public.submission_replies is
  'Customers can read replies on their own submissions.';

create policy submission_replies_insert_own
  on public.submission_replies for insert
  with check (
    profile_id = auth.uid()
    and is_staff = false
    and exists (
      select 1 from public.verification_submissions
      where verification_submissions.id = submission_replies.submission_id
        and verification_submissions.profile_id = auth.uid()
        and verification_submissions.status in ('pending', 'responded', 'under_review')
    )
  );
comment on policy submission_replies_insert_own on public.submission_replies is
  'Customers can reply on their own submissions when open.';

create policy submission_replies_staff_all
  on public.submission_replies for all
  using (public.is_staff(array['owner','admin_ops','support']::public.staff_role[]))
  with check (public.is_staff(array['owner','admin_ops','support']::public.staff_role[]));
comment on policy submission_replies_staff_all on public.submission_replies is
  'Owners, admin_ops and support can read and write submission replies.';

-- ───────────────────────── RLS: verification_attachments ─────────────────────────

alter table public.verification_attachments enable row level security;

create policy verification_attachments_select_own
  on public.verification_attachments for select
  using (profile_id = auth.uid());
comment on policy verification_attachments_select_own on public.verification_attachments is
  'Customers can read metadata for their own attachments.';

create policy verification_attachments_insert_own
  on public.verification_attachments for insert
  with check (profile_id = auth.uid());
comment on policy verification_attachments_insert_own on public.verification_attachments is
  'Customers can create attachment metadata on their own behalf.';

create policy verification_attachments_staff_select
  on public.verification_attachments for select
  using (public.is_staff(array['owner','admin_ops','support']::public.staff_role[]));
comment on policy verification_attachments_staff_select on public.verification_attachments is
  'Owners, admin_ops and support can read all attachment metadata.';

create policy verification_attachments_staff_delete
  on public.verification_attachments for delete
  using (public.is_staff(array['owner','admin_ops']::public.staff_role[]));
comment on policy verification_attachments_staff_delete on public.verification_attachments is
  'Owners and admin_ops can delete attachment metadata.';

-- Storage object access is intentionally server-only. Upload and signed URL
-- operations use the service-role client after ownership/staff authorization
-- has been verified against the RLS-protected application tables above.
