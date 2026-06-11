insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'public-media',
    'public-media',
    true,
    10485760,
    array['image/jpeg','image/png','image/webp','image/avif']::text[]
  ),
  (
    'admin-uploads',
    'admin-uploads',
    false,
    10485760,
    array['image/jpeg','image/png','image/webp','image/avif','application/pdf']::text[]
  ),
  (
    'private-exports',
    'private-exports',
    false,
    52428800,
    array['text/csv','application/pdf','application/json','application/zip']::text[]
  ),
  (
    'digital-deliveries',
    'digital-deliveries',
    false,
    104857600,
    array['application/pdf','application/epub+zip','application/zip']::text[]
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy storage_public_media_read
  on storage.objects for select
  using (bucket_id = 'public-media');

create policy storage_public_media_staff_insert
  on storage.objects for insert
  with check (
    bucket_id = 'public-media'
    and public.is_staff(array['owner','admin_ops','editor']::public.staff_role[])
  );

create policy storage_public_media_staff_update
  on storage.objects for update
  using (
    bucket_id = 'public-media'
    and public.is_staff(array['owner','admin_ops','editor']::public.staff_role[])
  )
  with check (
    bucket_id = 'public-media'
    and public.is_staff(array['owner','admin_ops','editor']::public.staff_role[])
  );

create policy storage_public_media_staff_delete
  on storage.objects for delete
  using (
    bucket_id = 'public-media'
    and public.is_staff(array['owner','admin_ops','editor']::public.staff_role[])
  );

create policy storage_admin_uploads_staff_read
  on storage.objects for select
  using (
    bucket_id = 'admin-uploads'
    and public.is_staff(array['owner','admin_ops','editor','fulfillment']::public.staff_role[])
  );

create policy storage_admin_uploads_staff_insert
  on storage.objects for insert
  with check (
    bucket_id = 'admin-uploads'
    and public.is_staff(array['owner','admin_ops','editor','fulfillment']::public.staff_role[])
  );

create policy storage_admin_uploads_staff_update
  on storage.objects for update
  using (
    bucket_id = 'admin-uploads'
    and public.is_staff(array['owner','admin_ops','editor','fulfillment']::public.staff_role[])
  )
  with check (
    bucket_id = 'admin-uploads'
    and public.is_staff(array['owner','admin_ops','editor','fulfillment']::public.staff_role[])
  );

create policy storage_admin_uploads_staff_delete
  on storage.objects for delete
  using (
    bucket_id = 'admin-uploads'
    and public.is_staff(array['owner','admin_ops','editor','fulfillment']::public.staff_role[])
  );

create policy storage_private_exports_staff_read
  on storage.objects for select
  using (
    bucket_id = 'private-exports'
    and public.is_staff(array['owner','admin_ops']::public.staff_role[])
  );

create policy storage_private_exports_staff_insert
  on storage.objects for insert
  with check (
    bucket_id = 'private-exports'
    and public.is_staff(array['owner','admin_ops']::public.staff_role[])
  );

create policy storage_private_exports_staff_delete
  on storage.objects for delete
  using (
    bucket_id = 'private-exports'
    and public.is_staff(array['owner','admin_ops']::public.staff_role[])
  );

create policy storage_digital_deliveries_staff_read
  on storage.objects for select
  using (
    bucket_id = 'digital-deliveries'
    and public.is_staff(array['owner','admin_ops']::public.staff_role[])
  );

create policy storage_digital_deliveries_staff_insert
  on storage.objects for insert
  with check (
    bucket_id = 'digital-deliveries'
    and public.is_staff(array['owner','admin_ops']::public.staff_role[])
  );

create policy storage_digital_deliveries_staff_update
  on storage.objects for update
  using (
    bucket_id = 'digital-deliveries'
    and public.is_staff(array['owner','admin_ops']::public.staff_role[])
  )
  with check (
    bucket_id = 'digital-deliveries'
    and public.is_staff(array['owner','admin_ops']::public.staff_role[])
  );

create policy storage_digital_deliveries_staff_delete
  on storage.objects for delete
  using (
    bucket_id = 'digital-deliveries'
    and public.is_staff(array['owner','admin_ops']::public.staff_role[])
  );
