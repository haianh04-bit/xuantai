import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Eye, Package, Trash2 } from "lucide-react";
import { toPng } from "html-to-image";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

type Order = {
  id: string;
  product_name: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  size: string | null;
  color: string | null;
  quantity: number;
  price: number;
  total: number;
  note: string | null;
  created_at: string;
};

const formatVnd = (n: number) => n.toLocaleString("vi-VN") + "₫";

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [productFilter, setProductFilter] = useState<string>("__all__");
  const tableRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const productNames = useMemo(
    () => Array.from(new Set(orders.map((o) => o.product_name))).sort(),
    [orders],
  );

  const filteredOrders = useMemo(
    () =>
      productFilter === "__all__"
        ? orders
        : orders.filter((o) => o.product_name === productFilter),
    [orders, productFilter],
  );

  const slugify = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/gi, "d")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "san-pham";

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: "Lỗi tải đơn hàng", description: error.message, variant: "destructive" });
      return;
    }
    setOrders((data || []) as Order[]);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleExportPng = async () => {
    if (filteredOrders.length === 0 || !tableRef.current) {
      toast({ title: "Không có đơn hàng phù hợp để xuất", variant: "destructive" });
      return;
    }
    setExporting(true);
    try {
      const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";
      const dataUrl = await toPng(tableRef.current, {
        pixelRatio: 2,
        backgroundColor: bg,
        cacheBust: true,
      });
      const stamp = new Date().toISOString().slice(0, 10);
      const namePart = productFilter === "__all__" ? "tat-ca" : slugify(productFilter);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `don-hang-${namePart}-${stamp}.png`;
      link.click();
      toast({ title: `Đã tải ảnh ${filteredOrders.length} đơn hàng` });
    } catch (err) {
      toast({
        title: "Lỗi khi tạo ảnh",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handlePreviewPng = async () => {
    if (filteredOrders.length === 0 || !tableRef.current) {
      toast({ title: "Không có đơn hàng phù hợp để xem trước", variant: "destructive" });
      return;
    }
    setPreviewing(true);
    try {
      const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";
      const dataUrl = await toPng(tableRef.current, {
        pixelRatio: 2,
        backgroundColor: bg,
        cacheBust: true,
      });
      setPreviewUrl(dataUrl);
    } catch (err) {
      toast({
        title: "Lỗi khi tạo ảnh xem trước",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setPreviewing(false);
    }
  };

  const handleDownloadFromPreview = () => {
    if (!previewUrl) return;
    const stamp = new Date().toISOString().slice(0, 10);
    const namePart = productFilter === "__all__" ? "tat-ca" : slugify(productFilter);
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = `don-hang-${namePart}-${stamp}.png`;
    link.click();
  };

  const handleDeleteOrder = async (id: string) => {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
      toast({ title: "Lỗi xoá đơn", description: error.message, variant: "destructive" });
      return;
    }
    setOrders((prev) => prev.filter((o) => o.id !== id));
    toast({ title: "Đã xoá đơn hàng" });
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/60 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="container flex items-center justify-between h-16 gap-3">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-smooth">
            <ArrowLeft className="w-4 h-4" /> Về trang chủ
          </Link>
          <span className="font-serif text-xl hidden sm:inline">Admin · Đơn hàng</span>
          <Link to="/admin">
            <Button variant="outline" className="rounded-xl">
              <Package className="w-4 h-4 mr-1.5" /> Sản phẩm
            </Button>
          </Link>
        </div>
      </header>

      <section className="container py-8 max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl">Đơn hàng</h1>
            <p className="text-sm text-muted-foreground">
              Hiển thị {filteredOrders.length}/{orders.length} đơn{loading ? " · đang tải..." : ""}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-[220px] rounded-xl">
                <SelectValue placeholder="Chọn sản phẩm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tất cả sản phẩm</SelectItem>
                {productNames.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchOrders} className="rounded-xl">
              Làm mới
            </Button>
            <Button
              variant="outline"
              onClick={handlePreviewPng}
              disabled={filteredOrders.length === 0 || previewing}
              className="rounded-xl"
            >
              <Eye className="w-4 h-4 mr-1.5" />
              {previewing ? "Đang tạo..." : "Xem trước ảnh"}
            </Button>
            <Button
              onClick={handleExportPng}
              disabled={filteredOrders.length === 0 || exporting}
              className="rounded-xl"
            >
              <Download className="w-4 h-4 mr-1.5" />
              {exporting ? "Đang tạo ảnh..." : "Tải PNG"}
            </Button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
            {orders.length === 0 ? "Chưa có đơn hàng nào." : "Không có đơn hàng nào cho sản phẩm này."}
          </div>
        ) : (
          <div ref={tableRef} className="rounded-2xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Khách</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>SL</TableHead>
                  <TableHead>Tổng</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(o.created_at).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell className="font-medium">{o.customer_name}</TableCell>
                    <TableCell className="whitespace-nowrap">{o.customer_phone}</TableCell>
                    <TableCell className="text-xs">
                      {o.product_name}
                      {(o.size || o.color) && (
                        <div className="text-muted-foreground">
                          {[o.size, o.color].filter(Boolean).join(" · ")}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{o.quantity}</TableCell>
                    <TableCell className="font-semibold whitespace-nowrap">{formatVnd(o.total)}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteOrder(o.id)}
                        aria-label="Xoá đơn"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Xem trước ảnh đơn hàng</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="space-y-4">
              <div className="max-h-[70vh] overflow-auto rounded-xl border border-border bg-muted/30 p-2">
                <img src={previewUrl} alt="Xem trước bảng đơn hàng" className="w-full h-auto" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewUrl(null)} className="rounded-xl">
                  Đóng
                </Button>
                <Button onClick={handleDownloadFromPreview} className="rounded-xl">
                  <Download className="w-4 h-4 mr-1.5" />
                  Tải PNG
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default AdminOrders;
