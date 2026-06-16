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
          Bàn học thông minh 2 trong 1 là giải pháp hoàn hảo cho không gian học tập của bé.
          Với thiết kế sáng tạo, sản phẩm kết hợp giữa bàn học và giá đỡ sách, giúp bé duy trì tư thế ngồi đúng cách, bảo vệ cột sống và thị lực.
          Mặt bàn rộng rãi, có thể điều chỉnh độ nghiêng phù hợp với nhu cầu học tập, trong khi giá đỡ sách giúp giữ sách vở gọn gàng và dễ dàng tiếp cận.
          Sản phẩm được làm từ chất liệu nhựa ABS an toàn, bền bỉ và dễ dàng vệ sinh, là lựa chọn lý tưởng để tạo nên môi trường học tập thoải mái và hiệu quả cho bé.
        </p>
        {/* info list */}
        <div className="space-y-4">
          {[
            "Kích thước mặt bàn: 37 x 47 cm.",
            "Kích thước giá đỡ sách: 21 x 30,5 cm.",
            "Màu sắc: xanh dương.",
            "Chất liệu : Nhựa ABS Nguyên sinh an toàn cho trẻ.",
            "Giá kẹp sách có thể điểu chỉnh độ nghiêng phù hợp với trẻ.",
            "Giá đỡ chống gù có thể điều chỉnh chiều cao từ 9.5 - 15cm.",
            "Sản phẩm Bàn học thông minh 2 trong 1 giúp điều chỉnh tư thế ngồi cho bé, chuẩn Khoa học về khoảng cách ngồi và góc nhìn."
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
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8">

        {/* title */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-red-500 uppercase tracking-wide mb-6">
          Công Dụng:
        </h2>

        {/* list */}
        <div className="space-y-5">

          {[
            {
              title: "THIẾT KẾ CÔNG THÁI HỌC GIÚP CHỐNG CẬN - CHỐNG GÙ:",
              desc: "Giá đỡ giúp bé duy trì tư thế ngồi đúng cách, bảo vệ cột sống và thị lực.",
            },
            {
              title: "DÙNG ĐƯỢC TRONG NHIỀU HOẠT ĐỘNG HỌC TẬP CỦA BÉ:",
              desc: "Không chỉ dùng để đọc sách, giá đỡ còn hỗ trợ bé khi học vẽ, làm bài tập hoặc xem video học tập, giúp bé dễ dàng tiếp cận tài liệu học tập một cách thuận tiện.",
            },
            {
              title: "ĐƯỢC NHIỀU CHUYÊN GIA HÀNG ĐẦU THẾ GIỚI KHUYÊN DÙNG",
              desc: "Kiểu dáng thiết kế độc quyền từ quá trình nghiên cứu tư thế ngồi của trẻ em, được nhiều chuyên gia hàng đầu thế giới khuyên dùng để bảo vệ sức khỏe cho bé.",
            },
            {
              title: "DÁNG NGỒI THOẢI MÁI KHÔNG BỊ MỎI HAY KHÓ CHỊU:",
              desc: "Tỷ lệ vàng 3:7, tay phải chiếm diện tích lớn hơn để tạo sự thoải mái, tự nhiên cho bé khi ngồi học trong thời gian dài mà không bị mỏi hay khó chịu.",
            },
            {
              title: "Dùng được cho nhiêu lứa tuổi:",
              desc: "Giá đỡ có thể điều chỉnh độ nghiêng và chiều cao phù hợp với nhiều lứa tuổi khác nhau, giúp bé sử dụng sản phẩm trong nhiều năm liền.",
            }
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