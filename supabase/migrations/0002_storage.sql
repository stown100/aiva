-- AIVA — private storage buckets.
-- No storage RLS policies are created on purpose: only the server
-- (service role) reads and writes; the client gets short-lived signed URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  -- originals are re-encoded to JPEG by the server before upload
  ('originals', 'originals', false, 10485760, array['image/jpeg']),
  ('results', 'results', false, 20971520, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;
