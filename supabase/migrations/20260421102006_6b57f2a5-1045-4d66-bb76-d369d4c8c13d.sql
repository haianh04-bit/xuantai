-- Public buckets serve files via the public URL endpoint without needing a SELECT RLS policy.
-- Removing broad SELECT policies on storage.objects prevents anonymous LIST/enumeration,
-- while individual file fetches via getPublicUrl continue to work.

DROP POLICY IF EXISTS "Public read product-images objects" ON storage.objects;
DROP POLICY IF EXISTS "Public read product-videos objects" ON storage.objects;
