import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProductColor {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  price_1: number | null;
  price_2: number | null;
  price_3: number | null;
  description: string | null;
  images: string[];
  videos: string[];
  sizes: string[];
  colors: ProductColor[];
}

const mapProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  price: row.price,
  original_price: row.original_price,
  price_1: row.price_1 ?? null,
  price_2: row.price_2 ?? null,
  price_3: row.price_3 ?? null,
  description: row.description,
  images: Array.isArray(row.images) ? row.images : [],
  videos: Array.isArray((row as any).videos) ? (row as any).videos : [],
  sizes: Array.isArray(row.sizes) ? row.sizes : [],
  colors: Array.isArray(row.colors) ? row.colors : [],
});

export const PRODUCT_QUERY_KEY = ["product"] as const;

export const useProduct = () => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEY,
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? mapProduct(data) : null;
    },
  });
};
