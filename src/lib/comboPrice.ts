import type { Product } from "@/hooks/useProduct";

export type Tier = {
  p1: number;
  p2: number;
  p3: number;
};

export const getTier = (product: Product): Tier => {
  return {
    // lấy trực tiếp giá nhập trong database
    p1: product.price_1 ?? 0,
    p2: product.price_2 ?? 0,
    p3: product.price_3 ?? 0,
  };
};

/**
 * Giá theo số lượng:
 *  - 1 chiếc  -> price_1
 *  - 2 chiếc  -> price_2
 *  - 3+ chiếc -> price_3
 */
export const calcTotal = (
  product: Product,
  qty: number
): number => {
  const { p1, p2, p3 } = getTier(product);

  if (qty <= 0) return 0;

  if (qty === 1) return p1;

  if (qty === 2) return p2;

  // từ 3 chiếc trở lên lấy luôn giá price_3
  return p3;
};

export const formatVnd = (n: number) =>
  n.toLocaleString("vi-VN") + "₫";