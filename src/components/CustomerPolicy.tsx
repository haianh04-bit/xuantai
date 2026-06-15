const CustomerPolicy = () => {
  return (
    <div className="rounded-3xl overflow-hidden border border-border shadow-xl">

      {/* HEADER */}
      <div className="bg-[#0b0f2a] text-white px-6 md:px-10 py-10">

        <h2 className="text-3xl md:text-5xl font-extrabold text-center uppercase leading-tight">
          Chính Sách Và Quyền Lợi
          <br />
          Của Khách Hàng
        </h2>

        <div className="w-full h-px bg-white/30 my-8" />

        <p className="text-center text-lg md:text-2xl leading-10 text-white/90 max-w-4xl mx-auto">
          Đối với chúng tôi, sản phẩm bán ra phải có
          chính sách và chế độ bảo hành, hậu mãi sau
          mua hàng rõ ràng!
        </p>
      </div>

      {/* CONTENT */}
      <div className="bg-white p-5 md:p-8 space-y-5">

        {[
          {
            title: "Giao Hàng Nhanh Trên Toàn Quốc",
            desc: "Chúng tôi sẽ hỗ trợ vận chuyển đến tận tay khách hàng dù bạn ở bất kỳ nơi đâu tại Việt Nam.",
            icon: "🚚",
          },

          {
            title: "Kiểm Tra Hàng Trước Khi Thanh Toán",
            desc: "Khách hàng được kiểm tra sản phẩm trước khi thanh toán để đảm bảo đúng mẫu mã và chất lượng.",
            icon: "📦",
          },

          {
            title: "Bảo Hành Chính Hãng 3 Tháng",
            desc: "Nếu có bất kỳ lỗi nào do nhà sản xuất, chúng tôi sẽ hỗ trợ bảo hành miễn phí trong vòng 3 tháng kể từ ngày mua hàng.",
            icon: "🔄",
          },

          {
            title: "Cam Kết Chất Lượng Sản Phẩm",
            desc: "Chất lượng là ưu tiên hàng đầu của chúng tôi. Chúng tôi cam kết tất cả sản phẩm đều là hàng chính hãng, chất lượng cao và đúng như mô tả.",
            icon: "✅",
          },
        ].map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-5 rounded-2xl border border-border p-5"
          >

            {/* ICON */}
            <div className="w-16 h-16 rounded-full border-2 border-orange-200 flex items-center justify-center text-3xl shrink-0">
              {item.icon}
            </div>

            {/* TEXT */}
            <div className="space-y-2">

              <h3 className="text-xl md:text-2xl font-extrabold uppercase text-black">
                {item.title}
              </h3>

              <p className="text-lg leading-9 text-gray-700">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerPolicy;