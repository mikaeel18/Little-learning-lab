-- Run ONCE in Supabase > SQL Editor (in an empty editor). Creates the private file store.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-files', 'product-files', false, 26214400, array['application/pdf', 'application/zip'])
on conflict (id) do nothing;

create policy "admin adds product files" on storage.objects for insert
  with check (bucket_id = 'product-files' and public.is_admin());
create policy "admin sees product files" on storage.objects for select
  using (bucket_id = 'product-files' and public.is_admin());
create policy "admin removes product files" on storage.objects for delete
  using (bucket_id = 'product-files' and public.is_admin());
