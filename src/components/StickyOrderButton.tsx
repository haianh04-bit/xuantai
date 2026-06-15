import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const StickyOrderButton = () => {
  const scrollToOrder = () => {
    document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,28rem)]">
      <Button
        type="button"
        size="lg"
        onClick={scrollToOrder}
        className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-hero hover:opacity-90 shadow-pop border-0"
      >
        <ShoppingBag className="w-5 h-5 mr-2" />
        Đặt hàng ngay
      </Button>
    </div>
  );
};

export default StickyOrderButton;