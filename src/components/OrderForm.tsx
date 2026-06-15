import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import type { Product } from "@/hooks/useProduct";
import { calcTotal, getTier, formatVnd } from "@/lib/comboPrice";
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}
const orderSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập tên (ít nhất 2 ký tự)").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không hợp lệ"),
  address: z
    .string()
    .trim()
    .min(15, "Vui lòng nhập đầy đủ địa chỉ giao hàng")
    .max(200, "Địa chỉ quá dài")
    .refine(
      (value) => {
        const wordCount = value
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;

        return wordCount >= 4;
      },
      {
        message:
          "Vui lòng nhập đầy đủ thôn/xóm, xã/phường, huyện/quận, tỉnh/thành trước sáp nhập",
      }
    ),
  quantity: z.number().int().min(1).max(99),
  note: z.string().max(300).optional(),
});

const OrderForm = ({ product }: { product: Product }) => {
  useEffect(() => {
    window.fbq?.("track", "ViewContent", {
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
    });
  }, [product]);
  const tier = useMemo(() => getTier(product), [product]);
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [checkoutTracked, setCheckoutTracked] = useState(false);

  const total = useMemo(() => calcTotal(product, quantity), [quantity, product]);
  const unitPrice = useMemo(() => Math.round(total / Math.max(quantity, 1)), [total, quantity]);
  const trackCheckout = () => {
    if (checkoutTracked) return;

    window.fbq?.("track", "InitiateCheckout", {
      value: total,
      currency: "VND",
      content_name: product.name,
      content_ids: [product.id],
      content_type: "product",
      num_items: quantity,
    });

    setCheckoutTracked(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = orderSchema.safeParse({
      ...form,
      quantity,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((i) => {
        fieldErrors[i.path[0] as string] = i.message;
      });

      setErrors(fieldErrors);

      toast({
        title: "Vui lòng kiểm tra lại thông tin",
        variant: "destructive",
      });

      return;
    }

    try {
      setErrors({});
      setSubmitting(true);

      const { error } = await supabase
        .from("orders")
        .insert({
          product_id: product.id,
          product_name: product.name,
          customer_name: result.data.name,
          customer_phone: result.data.phone,
          customer_address: result.data.address,
          quantity: result.data.quantity,
          price: unitPrice,
          total,
          note: result.data.note || null,
        });

      if (error) {
        throw error;
      }

      window.fbq?.("track", "Purchase", {
        value: total,
        currency: "VND",
        content_name: product.name,
        content_ids: [product.id],
        content_type: "product",
        num_items: quantity,
      });

      toast({
        title: "Đặt hàng thành công! 🎉",
        description: `Cảm ơn ${result.data.name}, shop sẽ liên hệ qua ${result.data.phone}.`,
      });

      setForm({
        name: "",
        phone: "",
        address: "",
        note: "",
      });

      setQuantity(1);

    } catch (error: any) {
      toast({
        title: "Lỗi gửi đơn hàng",
        description:
          error?.message || "Có lỗi xảy ra, vui lòng thử lại",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      id="order-form"
      onSubmit={handleSubmit}
      className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-soft space-y-6 sticky top-6"
    >
      <div>
        <h2 className="font-serif text-3xl mb-1">Đặt hàng nhanh</h2>
        <p className="text-sm text-muted-foreground">Điền thông tin — shop gọi xác nhận trong 5 phút.</p>
      </div>

      {/* Quantity */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Số lượng</Label>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-11 hover:bg-muted transition-smooth"
              aria-label="Giảm"
            >
              <Minus className="w-4 h-4 mx-auto" />
            </button>

            <span className="w-12 text-center font-semibold">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(3, q + 1))}
              className="w-10 h-11 hover:bg-muted transition-smooth"
              aria-label="Tăng"
            >
              <Plus className="w-4 h-4 mx-auto" />
            </button>
          </div>

          {/* lấy trực tiếp giá theo số lượng */}
          <span className="text-sm text-muted-foreground">
            {formatVnd(
              quantity === 1
                ? tier.p1
                : quantity === 2
                  ? tier.p2
                  : tier.p3
            )}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { qty: 1, price: tier.p1, label: "1 chiếc" },
            { qty: 2, price: tier.p2, label: "2 chiếc" },
            { qty: 3, price: tier.p3, label: "3 chiếc" },
          ].map((t) => (
            <button
              type="button"
              key={t.qty}
              onClick={() => setQuantity(t.qty)}
              className={`rounded-xl border p-2 text-center transition-smooth ${quantity === t.qty
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
                }`}
            >
              <div className="text-xs text-muted-foreground">
                {t.label}
              </div>

              {/* hiển thị đúng giá nhập */}
              <div className="flex flex-col items-center gap-1 mt-1">
                <span className="text-sm font-bold">
                  {formatVnd(t.price)}
                </span>

                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">
                  Freeship
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Customer info */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-semibold">Họ và tên</Label>
          <Input
            id="name"
            placeholder="Nguyễn Văn A"
            value={form.name}
            maxLength={80}
            onFocus={trackCheckout}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="h-11 rounded-xl"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-sm font-semibold">Số điện thoại</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="0912 345 678"
            value={form.phone}
            maxLength={15}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="h-11 rounded-xl"
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address" className="text-sm font-semibold">Địa chỉ giao hàng</Label>
          <Textarea
            id="address"
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành (lưu ý: là địa chỉ cũ trước sát nhập)"
            value={form.address}
            maxLength={200}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="min-h-[80px] rounded-xl resize-none"
          />
          {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Tạm tính</span>
        <span className="text-2xl font-bold text-gradient">{formatVnd(total)}</span>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-hero hover:opacity-90 hover:shadow-pop transition-smooth border-0"
      >
        <ShoppingBag className="w-5 h-5 mr-2" />
        {submitting ? "Đang gửi..." : "Đặt hàng ngay"}
      </Button>
    </form>
  );
};

export default OrderForm;
