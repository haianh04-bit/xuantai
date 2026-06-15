ALTER TABLE public.products ADD COLUMN IF NOT EXISTS videos jsonb NOT NULL DEFAULT '[]'::jsonb;

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-videos', 'product-videos', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "Public read product-videos" ON storage.objects FOR SELECT USING (bucket_id = 'product-videos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public upload product-videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-videos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public delete product-videos" ON storage.objects FOR DELETE USING (bucket_id = 'product-videos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;