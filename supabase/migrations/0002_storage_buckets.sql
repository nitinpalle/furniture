-- =============================================================
-- Storage buckets and policies
-- =============================================================
-- Apply after 0001_initial_schema.sql.
-- These statements create the buckets and the policies that gate them.
-- =============================================================

-- ----- Bucket: products -----
-- Public read; authenticated write (admin uploads product images).
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

create policy "products_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'products');

create policy "products_bucket_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'products' and public.is_admin());

create policy "products_bucket_admin_update"
  on storage.objects for update
  using (bucket_id = 'products' and public.is_admin());

create policy "products_bucket_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'products' and public.is_admin());

-- ----- Bucket: series-heroes -----
-- Public read; authenticated write (collection cover images).
insert into storage.buckets (id, name, public)
values ('series-heroes', 'series-heroes', true)
on conflict (id) do nothing;

create policy "series_heroes_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'series-heroes');

create policy "series_heroes_bucket_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'series-heroes' and public.is_admin());

create policy "series_heroes_bucket_admin_update"
  on storage.objects for update
  using (bucket_id = 'series-heroes' and public.is_admin());

create policy "series_heroes_bucket_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'series-heroes' and public.is_admin());

-- ----- Bucket: spec-pdfs -----
-- Public read (downloadable spec sheets); authenticated write.
insert into storage.buckets (id, name, public)
values ('spec-pdfs', 'spec-pdfs', true)
on conflict (id) do nothing;

create policy "spec_pdfs_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'spec-pdfs');

create policy "spec_pdfs_bucket_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'spec-pdfs' and public.is_admin());

create policy "spec_pdfs_bucket_admin_update"
  on storage.objects for update
  using (bucket_id = 'spec-pdfs' and public.is_admin());

create policy "spec_pdfs_bucket_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'spec-pdfs' and public.is_admin());

-- ----- Bucket: catalogs -----
-- Private — admin-only (source PDFs from suppliers).
insert into storage.buckets (id, name, public)
values ('catalogs', 'catalogs', false)
on conflict (id) do nothing;

create policy "catalogs_bucket_admin_read"
  on storage.objects for select
  using (bucket_id = 'catalogs' and public.is_admin());

create policy "catalogs_bucket_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'catalogs' and public.is_admin());

create policy "catalogs_bucket_admin_update"
  on storage.objects for update
  using (bucket_id = 'catalogs' and public.is_admin());

create policy "catalogs_bucket_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'catalogs' and public.is_admin());
