-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  original_price INTEGER,
  description TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Open policies (no auth requested by user)
CREATE POLICY "Anyone can view products"
ON public.products FOR SELECT USING (true);

CREATE POLICY "Anyone can insert products"
ON public.products FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update products"
ON public.products FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete products"
ON public.products FOR DELETE USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can upload product images"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anyone can update product images"
ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can delete product images"
ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

-- Seed default product
INSERT INTO public.products (name, price, original_price, description, sizes, colors, images)
VALUES (
  'Hoodie Oversized Cloud',
  590000,
  890000,
  'Form rộng tự do, chất nỉ bông cotton 380gsm mềm mịn. Thiết kế tối giản, dễ phối — item must-have cho tủ đồ mùa lạnh.',
  '["S","M","L","XL"]'::jsonb,
  '[{"name":"Cream","value":"hsl(40 60% 90%)"},{"name":"Black","value":"hsl(0 0% 12%)"},{"name":"Coral","value":"hsl(12 95% 65%)"},{"name":"Lavender","value":"hsl(270 60% 75%)"}]'::jsonb,
  '[]'::jsonb
);