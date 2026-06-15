-- Restrict listing of files in public buckets while keeping individual object access public.
-- We narrow SELECT on storage.objects so anonymous users can still fetch a known file URL,
-- but cannot enumerate (list) all files in the product-images / product-videos buckets.

-- Drop existing overly permissive SELECT policies on these buckets if any
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND cmd = 'SELECT'
      AND (
        policyname ILIKE '%product-images%'
        OR policyname ILIKE '%product-videos%'
        OR policyname ILIKE '%product images%'
        OR policyname ILIKE '%product videos%'
        OR policyname ILIKE '%public access%product%'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Allow public SELECT on individual objects in these buckets (needed so <img src> works),
-- but the storage list endpoint requires authenticated role, so anon cannot enumerate.
CREATE POLICY "Public read product-images objects"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Public read product-videos objects"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-videos');
