ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS price_1 integer,
  ADD COLUMN IF NOT EXISTS price_2 integer,
  ADD COLUMN IF NOT EXISTS price_3 integer;

UPDATE public.products SET price_1 = price WHERE price_1 IS NULL;