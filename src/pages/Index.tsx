import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import ProductReviews from "@/components/ProductReviews";
import CustomerPolicy from "@/components/CustomerPolicy";
import OrderForm from "@/components/OrderForm";
import StickyOrderButton from "@/components/StickyOrderButton";
import { useProduct } from "@/hooks/useProduct";

const ADMIN_KEY = "is_admin";

const Index = () => {
  const { data: product, isLoading, error } = useProduct();
  const [searchParams] = useSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (searchParams.get("admin") === "1") {
      localStorage.setItem(ADMIN_KEY, "1");
    }
    if (searchParams.get("admin") === "0") {
      localStorage.removeItem(ADMIN_KEY);
    }
    setIsAdmin(localStorage.getItem(ADMIN_KEY) === "1");
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-background flex justify-center py-10">

      {/* KHỐI CHÍNH */}
      <div className="w-full max-w-[1400px] bg-background rounded-3xl shadow-xl border border-border overflow-hidden">


        {/* CONTENT */}
        <section className="p-6 lg:p-10">
          {isLoading && (
            <div className="text-center py-20 text-muted-foreground">
              Đang tải sản phẩm...
            </div>
          )}

          {error && (
            <div className="text-center py-20 text-destructive">
              Lỗi tải sản phẩm
            </div>
          )}

          {product && (
            <>
              <div className="max-w-2xl mx-auto flex flex-col gap-10">
                <ProductGallery
                  images={product.images}
                  name={product.name}
                />
                <ProductInfo product={product} />
                <ProductReviews />
                <OrderForm product={product} />
                <CustomerPolicy />
              </div>
            </>
          )}
        </section>
        <footer className="bg-[#0b1020] border-t border-white/10 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-12">

            {/* TOP */}
            <div className="grid md:grid-cols-3 gap-10">

              {/* BRAND */}
              <div className="space-y-4">
                <h3 className="text-3xl font-extrabold text-white">
                  Tổng Kho Anh Thu
                </h3>

                <p className="text-sm leading-7 text-gray-400">
                  Chuyên cung cấp các sản phẩm chất lượng,
                  giao hàng toàn quốc, hỗ trợ khách hàng
                  nhanh chóng và uy tín.
                </p>
              </div>

              {/* CONTACT */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white uppercase">
                  Liên Hệ
                </h4>

                <div className="space-y-3 text-gray-400 text-sm">

                  <p>
                    📍 123 Nguyễn Văn Linh, Quận 1, TP.HCM
                  </p>

                  <p>
                    📞 Hotline: 0395 169 375
                  </p>
                </div>
              </div>

              {/* POLICY */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white uppercase">
                  Chính Sách
                </h4>

                <div className="space-y-3 text-gray-400 text-sm">

                  <p>✔️ Kiểm tra hàng trước khi thanh toán</p>

                  <p>✔️ Hỗ trợ đổi trả nếu lỗi sản phẩm</p>

                  <p>✔️ Giao hàng toàn quốc</p>

                  <p>✔️ Hỗ trợ khách hàng 24/7</p>
                </div>
              </div>
            </div>

            {/* LINE */}
            <div className="w-full h-px bg-white/10 my-8" />

            {/* BOTTOM */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">

              <p className="text-sm text-gray-500">
                © 2026 Shop Bán Hàng. All rights reserved.
              </p>
            </div>
          </div>
        </footer>

      </div>
      {product && <StickyOrderButton />}
    </main>
  );
};

export default Index;
