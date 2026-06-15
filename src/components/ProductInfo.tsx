import {
  Truck,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";

import type { Product } from "@/hooks/useProduct";

import {
  getTier,
  formatVnd as formatPrice,
} from "@/lib/comboPrice";


const ProductInfo = ({
  product,
}: {
  product: Product;
}) => {
  const tier = getTier(product);

  const scrollToOrder = () => {
    document
      .getElementById("order-form")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <div className="space-y-6">

      {/* TITLE */}
      <div className="space-y-3">

        <h1 className="font-serif text-4xl md:text-5xl leading-tight tracking-tight">
          {product.name}
        </h1>

        {product.description && (
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        )}
      </div>

      {/* PRICE */}
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold text-foreground">
          {formatPrice(tier.p1)}
        </span>

        <span className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-bold mb-1.5">
          Miễn ship
        </span>
      </div>

      {/* COMBO */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
          Combo ưu đãi
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            {
              label: "1 chiếc",
              total: tier.p1,
            },
            {
              label: "2 chiếc",
              total: tier.p2,
            },
            {
              label: "3 chiếc",
              total: tier.p3,
            },
          ].map((t) => (
            <div
              key={t.label}
              className="text-center rounded-xl border border-border p-3"
            >
              <div className="text-xs text-muted-foreground">
                {t.label}
              </div>

              <div className="flex flex-col items-center gap-1 mt-1">
                <span className="text-base font-bold">
                  {formatPrice(t.total)}
                </span>

                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">
                  Freeship
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BENEFITS */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: Truck,
            label: "Free ship",
            sub: "Toàn quốc",
          },
          {
            icon: ShieldCheck,
            label: "Đổi trả",
            sub: "7 ngày",
          },
          {
            icon: Sparkles,
            label: "Chính hãng",
            sub: "100%",
          },
        ].map(({ icon: Icon, label, sub }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card p-3 text-center"
          >
            <Icon className="w-5 h-5 mx-auto mb-1.5 text-primary" />

            <div className="text-xs font-semibold">
              {label}
            </div>

            <div className="text-[10px] text-muted-foreground">
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* PRODUCT INFO */}
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8">

        {/* title */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-orange-500 text-center uppercase tracking-wide mb-6">
          Thông Tin Sản Phẩm
        </h2>

        {/* description */}
        <p className="text-lg leading-10 text-foreground mb-6">
          Bút điện tử với thiết kế như một cây bút
          thông thường, dễ dàng mang theo bên mình.
          Sản phẩm phát ra tia điện mạnh hình chữ
          "X", kích hoạt nhanh chỉ với 1 chạm,
          giúp bạn đối phó hiệu quả trong các tình
          huống nguy hiểm.
        </p>

        {/* info list */}
        <div className="space-y-4">

          {[
            "Kích thước: 15,5cm",
            "Trọng lượng: 55 g",
            "Dung lượng pin: 3000 mA",
            "Sạc: chân sạc Type C",
            "Có khả năng chống rơi, chống gãy, chống va đập, độ bền cao.",
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3"
            >
              {/* icon */}
              <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              {/* text */}
              <p className="text-xl leading-9 text-foreground">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* HANDLE SITUATIONS VIDEO */}
      {product.videos &&
        product.videos.length > 0 && (
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-8">

            {/* TITLE */}
            <h2 className="text-2xl md:text-4xl font-extrabold text-red-600 text-center uppercase tracking-wide">
              Các Tình Huống Xử Lý
            </h2>

            {/* VIDEO LIST */}
            <div className="space-y-10">

              {product.videos.map((video, index) => (
                <div
                  key={index}
                  className="space-y-4"
                >
                  {/* VIDEO */}
                  <div className="overflow-hidden rounded-3xl border border-border bg-black shadow-2xl">

                    {video.includes("youtube") ||
                      video.includes("youtu.be") ? (
                      <iframe
                        src={video}
                        title={`Video ${index + 1}`}
                        allowFullScreen
                        className="w-full aspect-video"
                      />
                    ) : (
                      <video
                        controls
                        preload="metadata"
                        className="w-full aspect-video object-cover"
                      >
                        <source
                          src={video}
                          type="video/mp4"
                        />

                        Trình duyệt không hỗ trợ video.
                      </video>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      {/* USES */}
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8">

        {/* title */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-red-500 uppercase tracking-wide mb-6">
          Công Dụng:
        </h2>

        {/* list */}
        <div className="space-y-5">

          {[
            {
              title: "Tự vệ cá nhân:",
              desc: "Làm cho đối tượng tấn công bất ngờ, sợ hãi và mất kiểm soát tạm thời.",
            },
            {
              title: "Ngụy trang kín đáo:",
              desc: "Hình dáng như cây bút, không gây chú ý.",
            },
            {
              title: "Dễ sử dụng:",
              desc: "Kích hoạt nhanh chỉ bằng 1 nút bấm.",
            },
            {
              title: "Di động:",
              desc: "Gọn nhẹ, dễ mang trong túi hoặc ví.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3"
            >
              {/* dấu gạch */}
              <span className="text-2xl leading-none mt-1">
                -
              </span>

              {/* text */}
              <p className="text-xl leading-10 text-foreground">
                <span className="font-semibold">
                  {item.title}
                </span>{" "}
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ProductInfo;