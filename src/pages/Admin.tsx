import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ClipboardList, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProduct, PRODUCT_QUERY_KEY, type ProductColor } from "@/hooks/useProduct";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { parseVideoEmbed, isEmbedUrl } from "@/lib/videoEmbed";


const INVALID_VIDEO_SIGNATURES = ["<!doctype html", "<html", "<!DOCTYPE html"];

const validateVideoFile = async (file: File) => {
  const header = (await file.slice(0, 256).text()).trimStart();
  if (INVALID_VIDEO_SIGNATURES.some((signature) => header.startsWith(signature))) {
    throw new Error("File này không phải video hợp lệ.");
  }

  await new Promise<void>((resolve, reject) => {
    const previewUrl = URL.createObjectURL(file);
    const video = document.createElement("video");

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(previewUrl);
    };

    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Không đọc được metadata video."));
    }, 8000);

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      window.clearTimeout(timeout);
      const isValid = Number.isFinite(video.duration) && video.duration > 0.1 && video.videoWidth > 0;
      cleanup();
      if (!isValid) {
        reject(new Error("Video bị lỗi hoặc quá ngắn nên không thể phát."));
        return;
      }
      resolve();
    };

    video.onerror = () => {
      window.clearTimeout(timeout);
      cleanup();
      reject(new Error("Video không đúng định dạng phát được trên trình duyệt."));
    };

    video.src = previewUrl;
  });
};

const Admin = () => {
  const { data: product, isLoading } = useProduct();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [price1, setPrice1] = useState<number | "">("");
  const [price2, setPrice2] = useState<number | "">("");
  const [price3, setPrice3] = useState<number | "">("");
  const [originalPrice, setOriginalPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState({ name: "", value: "#f5deb3" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoEmbedInput, setVideoEmbedInput] = useState("");

  const formatVnd = (n: number) => n.toLocaleString("vi-VN") + "₫";
  useEffect(() => {
    if (!product) return;
    setName(product.name);
    setPrice1(product.price_1 ?? product.price ?? "");
    setPrice2(product.price_2 ?? "");
    setPrice3(product.price_3 ?? "");
    setOriginalPrice(product.original_price ?? "");
    setDescription(product.description ?? "");
    setImages(product.images);
    setVideos(product.videos);
    setSizes(product.sizes);
    setColors(product.colors);
  }, [product]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("product-images")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      setImages((prev) => [...prev, ...uploaded]);
      toast({ title: `Đã tải lên ${uploaded.length} ảnh` });
    } catch (err: any) {
      toast({ title: "Lỗi tải ảnh", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const MAX = 50 * 1024 * 1024; // 50MB
    setUploadingVideo(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (file.size > MAX) {
          toast({ title: `Video "${file.name}" quá lớn (>50MB)`, variant: "destructive" });
          continue;
        }
        try {
          await validateVideoFile(file);
        } catch (error: any) {
          toast({ title: `Video "${file.name}" không hợp lệ`, description: error.message, variant: "destructive" });
          continue;
        }
        const nameExt = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
        const typeMap: Record<string, string> = {
          "video/mp4": "mp4",
          "video/quicktime": "mov",
          "video/webm": "webm",
          "video/ogg": "ogv",
          "video/x-matroska": "mkv",
        };
        const validExts = ["mp4", "mov", "webm", "ogv", "mkv", "m4v"];
        const ext = validExts.includes(nameExt) ? nameExt : (typeMap[file.type] || "mp4");
        const contentType = file.type && file.type.startsWith("video/") ? file.type : "video/mp4";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("product-videos")
          .upload(path, file, { cacheControl: "3600", upsert: false, contentType });
        if (error) throw error;
        const { data } = supabase.storage.from("product-videos").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      if (uploaded.length) {
        setVideos((prev) => [...prev, ...uploaded]);
        toast({ title: `Đã tải lên ${uploaded.length} video` });
      }
    } catch (err: any) {
      toast({ title: "Lỗi tải video", description: err.message, variant: "destructive" });
    } finally {
      setUploadingVideo(false);
      if (videoInput.current) videoInput.current.value = "";
    }
  };

  const handleAddVideoEmbed = () => {
    const parsed = parseVideoEmbed(videoEmbedInput);
    if (!parsed) {
      toast({ title: "URL video không hợp lệ", description: "Dán link YouTube, Vimeo, .mp4 hoặc mã <iframe>.", variant: "destructive" });
      return;
    }
    if (videos.includes(parsed.url)) {
      toast({ title: "Video này đã có trong danh sách", variant: "destructive" });
      return;
    }
    setVideos((prev) => [...prev, parsed.url]);
    setVideoEmbedInput("");
    toast({ title: "Đã thêm video" });
  };

  const handleSave = async () => {
    if (!product) return;
    if (!name.trim()) {
      toast({ title: "Tên sản phẩm không được trống", variant: "destructive" });
      return;
    }
    setSaving(true);
    const p1 = price1 === "" ? 0 : Number(price1);
    const p2 = price2 === "" ? null : Number(price2);
    const p3 = price3 === "" ? null : Number(price3);
    const { error } = await supabase
      .from("products")
      .update({
        name: name.trim(),
        price: p1,
        price_1: p1,
        price_2: p2,
        price_3: p3,
        original_price: originalPrice === "" ? null : Number(originalPrice),
        description: description.trim() || null,
        images: images as any,
        videos: videos as any,
        sizes: sizes as any,
        colors: colors as any,
      })
      .eq("id", product.id);
    setSaving(false);
    if (error) {
      toast({ title: "Lỗi lưu", description: error.message, variant: "destructive" });
      return;
    }
    qc.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
    toast({ title: "Đã lưu thay đổi 🎉" });
    navigate("/");
  };

  if (isLoading) {
    return <div className="container py-20 text-center text-muted-foreground">Đang tải...</div>;
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/60 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="container flex items-center justify-between h-16 gap-3">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-smooth">
            <ArrowLeft className="w-4 h-4" /> Về trang chủ
          </Link>
          <span className="font-serif text-xl hidden sm:inline">Admin · Sản phẩm</span>
          <div className="flex items-center gap-2">
            <Link to="/admin/orders">
              <Button variant="outline" className="rounded-xl">
                <ClipboardList className="w-4 h-4 mr-1.5" /> Đơn hàng
              </Button>
            </Link>
            <Button onClick={handleSave} disabled={saving} className="rounded-xl">
              <Save className="w-4 h-4 mr-1.5" />
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </div>
      </header>

      <section className="container py-8 max-w-3xl space-y-8">
        {/* Basic info */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-serif text-2xl">Thông tin cơ bản</h2>
          <div className="space-y-1.5">
            <Label htmlFor="name">Tên sản phẩm</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
          </div>
          <div className="space-y-3">
            <Label>Bảng giá combo (₫)</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "p1", label: "1 chiếc", value: price1, setter: setPrice1 },
                { id: "p2", label: "2 chiếc", value: price2, setter: setPrice2 },
                { id: "p3", label: "3 chiếc", value: price3, setter: setPrice3 },
              ].map((f) => (
                <div key={f.id} className="space-y-1">
                  <Label htmlFor={f.id} className="text-xs text-muted-foreground">{f.label}</Label>
                  <Input
                    id={f.id}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    placeholder="0"
                    value={f.value === "" ? "" : String(f.value)}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") return f.setter("");
                      const v = raw.replace(/^0+(?=\d)/, "");
                      const n = Number(v);
                      f.setter(Number.isFinite(n) && n >= 0 ? n : 0);
                    }}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Khách mua 1/2/3 chiếc sẽ tính theo bảng này. Mua nhiều hơn sẽ ghép combo 3 chiếc + lẻ.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="op">Giá gốc (₫) <span className="text-muted-foreground text-xs">(tuỳ chọn)</span></Label>
              <Input
                id="op"
                type="number"
                min={0}
                inputMode="numeric"
                value={originalPrice === "" ? "" : String(originalPrice)}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") return setOriginalPrice("");
                  const v = raw.replace(/^0+(?=\d)/, "");
                  const n = Number(v);
                  setOriginalPrice(Number.isFinite(n) && n >= 0 ? n : 0);
                }}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Mô tả</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              className="min-h-[120px]"
            />
          </div>
        </div>

        {/* Images */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl">Ảnh sản phẩm</h2>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="rounded-xl"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              {uploading ? "Đang tải..." : "Tải ảnh"}
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
          </div>
          {images.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Chưa có ảnh — bấm "Tải ảnh" để thêm
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((url, i) => (
                <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                  <img src={url} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth"
                    aria-label="Xoá ảnh"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Videos */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl">Video sản phẩm</h2>
            <Button
              type="button"
              variant="outline"
              onClick={() => videoInput.current?.click()}
              disabled={uploadingVideo}
              className="rounded-xl"
            >
              <Upload className="w-4 h-4 mr-1.5" />
              {uploadingVideo ? "Đang tải..." : "Tải video"}
            </Button>
            <input
              ref={videoInput}
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoUpload}
              className="hidden"
            />
          </div>

          {videos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Chưa có video — bấm "Tải video" hoặc dán link để thêm (file tối đa 50MB)
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {videos.map((url, i) => (
                <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-black group">
                  {isEmbedUrl(url) ? (
                    <iframe src={url} title={`Video ${i + 1}`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="w-full h-full bg-black" />
                  ) : (
                    <video controls playsInline preload="metadata" className="w-full h-full object-cover">
                      <source src={url} type={url.endsWith(".webm") ? "video/webm" : url.endsWith(".mov") ? "video/quicktime" : url.endsWith(".ogv") ? "video/ogg" : url.endsWith(".mkv") ? "video/x-matroska" : "video/mp4"} />
                    </video>
                  )}
                  <button
                    type="button"
                    onClick={() => setVideos(videos.filter((_, idx) => idx !== i))}
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth z-10"
                    aria-label="Xoá video"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pb-12">
          <Button onClick={handleSave} disabled={saving} size="lg" className="rounded-2xl">
            <Save className="w-5 h-5 mr-2" />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Admin;
